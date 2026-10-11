'use strict';
const {Pool}=require('pg'),fs=require('node:fs'),path=require('node:path'),{createApp}=require('./app.cjs');
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required; refusing ephemeral saves');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:8,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
(async()=>{
 await pool.query(fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8'));
 const server=createApp(pool,{origins:(process.env.ALLOWED_ORIGINS||'https://taixu-xiantu.onrender.com').split(',').map(x=>x.trim()),trustProxy:process.env.RENDER==='true'});
 server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>console.log('Account save service ready'));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(async()=>{await pool.end();process.exit(0)});setTimeout(()=>process.exit(1),20000).unref();});
})().catch(()=>{console.error('Account database initialization failed');process.exit(1)});
