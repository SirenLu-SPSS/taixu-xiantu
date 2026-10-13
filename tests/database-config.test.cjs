const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ConnectionParameters=require('pg/lib/connection-parameters'),{databaseOptions}=require('../server/database-config.cjs');
test('Supabase pools verify the official CA and hostname even when URL requests disabled SSL',()=>{
 const options=databaseOptions('postgresql://postgres.example:test@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=disable');
 const url=new URL(options.connectionString);assert.equal(url.searchParams.get('sslmode'),'verify-full');
 const config=new ConnectionParameters(options);assert.notEqual(config.ssl.rejectUnauthorized,false);const cert=new crypto.X509Certificate(config.ssl.ca);assert.equal(cert.ca,true);assert.match(cert.subject,/Supabase/);assert(new Date(cert.validTo)>new Date());assert.equal(options.max,4);
});
test('existing private Render connections do not acquire Supabase TLS configuration',()=>{const options=databaseOptions('postgresql://user:test@dpg-local/example');assert.equal(new URL(options.connectionString).searchParams.has('sslrootcert'),false);});
