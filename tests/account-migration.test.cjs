const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {PGlite}=require('@electric-sql/pglite'),{migrateDatabase,fingerprint}=require('../server/migrate-database.cjs');
const schema=fs.readFileSync(require.resolve('../server/schema.sql'),'utf8');
async function database(t){const db=new PGlite();await db.exec(schema);t.after(()=>db.close());const pool={query:async(sql,params)=>params?db.query(sql,params):(await db.exec(sql)).at(-1),connect:async()=>({...pool,release(){}})};return {db,pool};}
async function seed(pool){const account=crypto.randomUUID(),character=crypto.randomUUID();await pool.query('INSERT INTO accounts(id,username,password_hash,recovery_hash) VALUES($1,$2,$3,$4)',[account,'migration_test','original-password-hash','original-recovery-hash']);await pool.query('INSERT INTO sessions(token_hash,account_id,expires_at) VALUES($1,$2,$3)',['original-session-hash',account,'2027-01-01T00:00:00Z']);await pool.query('INSERT INTO characters(id,account_id,slot,name,revision,save) VALUES($1,$2,$3,$4,$5,$6)',[character,account,5,'原人物',42,JSON.stringify({version:2,realm:8,inventory:['pet'],equipment:{weapon:'legend'},gold:9000000,custom:{b:2,a:1}})]);await pool.query('INSERT INTO save_history(character_id,revision,save) VALUES($1,$2,$3)',[character,41,JSON.stringify({gold:8000000})]);return {account,character};}
test('Supabase copy preserves hashes, sessions, slot five, revisions and complete saves, then blocks old writes',async t=>{
 const source=await database(t),target=await database(t),ids=await seed(source.pool);const result=await migrateDatabase(source.pool,target.pool,'source-test');assert.equal(result.counts.characters.count,1);
 for(const table of ['accounts','sessions','characters','save_history'])assert.deepEqual(await fingerprint(source.pool,table),await fingerprint(target.pool,table));
 await assert.rejects(source.pool.query('UPDATE characters SET name=$1 WHERE id=$2',['不該寫入',ids.character]),/Cloud saves are moving/);
 const again=await migrateDatabase(source.pool,target.pool,'source-test');assert.equal(again.alreadyMigrated,true);
 await target.pool.query('UPDATE characters SET name=$1 WHERE id=$2',['新進度',ids.character]);assert.equal((await target.pool.query('SELECT name FROM characters')).rows[0].name,'新進度');
});
test('copy failure rolls back all target rows and resumes original saves',async t=>{
 const source=await database(t),target=await database(t),ids=await seed(source.pool);const failing={connect:async()=>{const client=await target.pool.connect();return {...client,query:(sql,params)=>sql.startsWith('INSERT INTO characters(')?Promise.reject(Error('simulated failure')):client.query(sql,params)}}};
 await assert.rejects(migrateDatabase(source.pool,failing,'failed-source'),/simulated failure/);assert.equal((await target.pool.query('SELECT count(*) AS n FROM accounts')).rows[0].n,0);
 await source.pool.query('UPDATE characters SET name=$1 WHERE id=$2',['仍可存檔',ids.character]);assert.equal((await source.pool.query('SELECT frozen FROM account_migration_gate')).rows[0].frozen,false);
});
test('copy refuses a populated destination without replacing its accounts',async t=>{
 const source=await database(t),target=await database(t);await seed(source.pool);await seed(target.pool);await assert.rejects(migrateDatabase(source.pool,target.pool,'nonempty-source'),/not empty/);assert.equal((await target.pool.query('SELECT count(*) AS n FROM accounts')).rows[0].n,1);assert.equal((await source.pool.query('SELECT frozen FROM account_migration_gate')).rows[0].frozen,false);
});
