'use strict';
const {Pool}=require('pg'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createApp}=require('./app.cjs'),{migrateDatabase}=require('./migrate-database.cjs');
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required; refusing ephemeral saves');
const options={max:4,connectionTimeoutMillis:15000,idleTimeoutMillis:30000};
let pool=new Pool({connectionString:process.env.DATABASE_URL,...options});
(async()=>{
 if(process.env.ACCOUNT_DATABASE_MIGRATION_TARGET){
  const targetUrl=new URL(process.env.ACCOUNT_DATABASE_MIGRATION_TARGET),sourceUrl=new URL(process.env.DATABASE_URL);
  if(process.env.ACCOUNT_DATABASE_MIGRATION_PASSWORD)targetUrl.password=encodeURIComponent(process.env.ACCOUNT_DATABASE_MIGRATION_PASSWORD);
  if(!/\.supabase\.(com|co)$/.test(targetUrl.hostname)||targetUrl.hostname===sourceUrl.hostname)throw Error('Invalid migration target');
  targetUrl.searchParams.set('sslmode','verify-full');
  const target=new Pool({connectionString:targetUrl.toString(),...options});
  const sourceId=crypto.createHash('sha256').update(sourceUrl.hostname+sourceUrl.pathname).digest('hex');
  try{const result=await migrateDatabase(pool,target,sourceId);console.log('Account database migration verified',JSON.stringify(Object.fromEntries(Object.entries(result.counts).map(([name,value])=>[name,value.count]))));}
  catch(error){await target.end();throw error;}
  await pool.end();pool=target;
 }
 await pool.query(fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8'));
 const server=createApp(pool,{origins:(process.env.ALLOWED_ORIGINS||'https://taixu-xiantu.onrender.com').split(',').map(x=>x.trim()),trustProxy:process.env.RENDER==='true'});
 server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>console.log('Account save service ready'));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(async()=>{await pool.end();process.exit(0)});setTimeout(()=>process.exit(1),20000).unref();});
})().catch(()=>{console.error('Account database initialization failed');process.exit(1)});
