'use strict';
const path=require('node:path');
function databaseOptions(connectionString){
 const url=new URL(connectionString);
 if(/\.supabase\.(com|co)$/.test(url.hostname)){
  url.searchParams.set('sslmode','verify-full');
  url.searchParams.set('sslrootcert',path.join(__dirname,'certs','supabase-root.crt'));
 }
 return {connectionString:url.toString(),max:4,connectionTimeoutMillis:15000,idleTimeoutMillis:30000};
}
module.exports={databaseOptions};
