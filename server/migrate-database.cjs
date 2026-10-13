'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const TABLES={accounts:['id'],sessions:['token_hash'],characters:['id'],save_history:['character_id','revision']};
const schema=fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
async function fingerprint(client,table){const digest=crypto.createHash('sha256');let count=0;for(let offset=0;;offset+=100){const {rows}=await client.query(`SELECT row_to_json(t) AS data FROM ${table} t ORDER BY ${TABLES[table].join(',')} LIMIT 100 OFFSET $1`,[offset]);for(const {data}of rows){digest.update(JSON.stringify(canonical(data))+'\n');count++;}if(rows.length<100)break;}return {count,sha256:digest.digest('hex')};}
async function gate(source){
 await source.query(`CREATE TABLE IF NOT EXISTS account_migration_gate(id integer PRIMARY KEY CHECK(id=1), frozen boolean NOT NULL DEFAULT false);
 INSERT INTO account_migration_gate(id,frozen) VALUES(1,false) ON CONFLICT(id) DO NOTHING;
 CREATE OR REPLACE FUNCTION account_migration_write_guard() RETURNS trigger LANGUAGE plpgsql AS $$
 DECLARE blocked boolean;
 BEGIN
  SELECT frozen INTO blocked FROM account_migration_gate WHERE id=1 FOR SHARE;
  IF blocked THEN RAISE EXCEPTION 'Cloud saves are moving; local progress remains available'; END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
 END $$;`);
 // Trigger installation waits for existing table writers before the gate is frozen.
 for(const table of Object.keys(TABLES))await source.query(`DROP TRIGGER IF EXISTS account_migration_guard ON ${table}; CREATE TRIGGER account_migration_guard BEFORE INSERT OR UPDATE OR DELETE ON ${table} FOR EACH ROW EXECUTE FUNCTION account_migration_write_guard()`);
}
async function migrateDatabase(sourcePool,targetPool,sourceId){
 const source=await sourcePool.connect(),target=await targetPool.connect();let frozen=false,committed=false,targetTransaction=false;
 try{
  await source.query(schema);
  await source.query('BEGIN');await gate(source);await source.query('COMMIT');
  await target.query('BEGIN');targetTransaction=true;
  await target.query("SELECT pg_advisory_xact_lock(20461013)");
  await target.query('CREATE TABLE IF NOT EXISTS account_migration_receipts(source_id text PRIMARY KEY, counts jsonb NOT NULL, completed_at timestamptz NOT NULL DEFAULT now())');
  const previous=(await target.query('SELECT counts FROM account_migration_receipts WHERE source_id=$1',[sourceId])).rows[0];
  if(previous){
   const state=(await source.query('SELECT frozen FROM account_migration_gate WHERE id=1')).rows[0];
   if(!state?.frozen)throw Error('Migration receipt exists but source is writable; refusing an unsafe cutover');
   await target.query('COMMIT');targetTransaction=false;return {alreadyMigrated:true,counts:previous.counts};
  }
  await target.query(schema);
  for(const table of Object.keys(TABLES))if(Number((await target.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n)!==0)throw Error('Target is not empty; refusing to overwrite existing accounts');
  await source.query('UPDATE account_migration_gate SET frozen=true WHERE id=1');frozen=true;
  const counts={};
  for(const table of Object.keys(TABLES)){
   for(let offset=0;;offset+=100){
    const {rows}=await source.query(`SELECT row_to_json(t) AS data FROM ${table} t ORDER BY ${TABLES[table].join(',')} LIMIT 100 OFFSET $1`,[offset]);
    for(const {data}of rows){const columns=Object.keys(data),values=columns.map(k=>typeof data[k]==='object'&&data[k]!==null?JSON.stringify(data[k]):data[k]);await target.query(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map((_,i)=>'$'+(i+1)).join(',')})`,values);}
    if(rows.length<100)break;
   }
   const original=await fingerprint(source,table),copied=await fingerprint(target,table);
   if(JSON.stringify(original)!==JSON.stringify(copied))throw Error('Migration verification failed for '+table);
   counts[table]=original;
   await target.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY; REVOKE ALL ON ${table} FROM PUBLIC`);
  }
  await target.query(`DO $$ DECLARE role_name text; table_name text; BEGIN
   FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
    IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
     FOREACH table_name IN ARRAY ARRAY['accounts','sessions','characters','save_history','account_migration_receipts'] LOOP
      EXECUTE format('REVOKE ALL ON TABLE %I FROM %I',table_name,role_name);
     END LOOP;
    END IF;
   END LOOP;
  END $$`);
  await target.query('ALTER TABLE account_migration_receipts ENABLE ROW LEVEL SECURITY; REVOKE ALL ON account_migration_receipts FROM PUBLIC');
  await target.query('INSERT INTO account_migration_receipts(source_id,counts) VALUES($1,$2)',[sourceId,JSON.stringify(counts)]);
  await target.query('COMMIT');targetTransaction=false;committed=true;
  return {alreadyMigrated:false,counts};
 }catch(error){
  if(targetTransaction)await target.query('ROLLBACK').catch(()=>{});
  await source.query('ROLLBACK').catch(()=>{});
  if(frozen&&!committed)await source.query('UPDATE account_migration_gate SET frozen=false WHERE id=1');
  throw error;
 }finally{source.release();target.release();}
}
module.exports={migrateDatabase,fingerprint};
