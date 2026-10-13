'use strict';
const http=require('node:http'),crypto=require('node:crypto'),{promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt), hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const passwordValid=x=>typeof x==='string'&&x.length>=10&&x.length<=128;
const usernameValid=x=>typeof x==='string'&&/^[a-z0-9_]{4,32}$/.test(x);
async function passwordHash(password,salt=crypto.randomBytes(16).toString('hex')){
 const key=await scrypt(password,salt,32,{N:32768,r:8,p:1,maxmem:64*1024*1024});return salt+':'+key.toString('hex');
}
async function matches(password,stored){const computed=await passwordHash(password,stored.split(':')[0]);return crypto.timingSafeEqual(Buffer.from(computed),Buffer.from(stored));}
function validateSave(save){
 if(!save||save.version!==2||typeof save.name!=='string'||!save.name.trim()||save.name.length>12||!save.equipment||Array.isArray(save.equipment)||typeof save.equipment!=='object'||!Array.isArray(save.inventory)||!Number.isInteger(save.realm)||save.realm<0||save.realm>30)throw fail(400,'存檔格式不正確，原檔案未變更');
 return save;
}
const MAX_SAVE_BYTES=16*1024*1024;
function body(req){return new Promise((resolve,reject)=>{
 let size=0,chunks=[],oversized=false;
 req.on('data',chunk=>{size+=chunk.length;if(oversized)return;if(size>MAX_SAVE_BYTES){oversized=true;chunks=[];reject(fail(413,'存檔超過 16 MB，請先匯出備份；原有雲端進度未變更'));return;}chunks.push(chunk);});
 req.on('end',()=>{if(oversized)return;try{resolve(JSON.parse(Buffer.concat(chunks).toString()))}catch{reject(fail(400,'資料格式錯誤'))}});
 req.on('aborted',()=>reject(fail(400,'上傳中斷，請保留本機存檔後重試')));req.on('error',reject);
});}
function createApp(pool,{origins=[],trustProxy=false,rateLimit=20}={}){
 const attempts=new Map(),dummyPassword=passwordHash('unavailable-account');let hashing=0;
 function throttle(key){const now=Date.now();if(attempts.size>10000)for(const [k,v]of attempts)if(v.until<now)attempts.delete(k);if(attempts.size>10000)throw fail(503,'服務忙碌，請稍後重試');const old=attempts.get(key),v=old&&old.until>now?old:{count:0,until:now+900000};if(++v.count>rateLimit)throw fail(429,'嘗試次數過多，請 15 分鐘後再試');attempts.set(key,v);}
 async function transaction(fn){const c=await pool.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
 async function session(req){const token=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)throw fail(401,'請先登入帳號');const {rows}=await pool.query('SELECT a.id,a.username FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>now()',[hash(token)]);if(!rows[0])throw fail(401,'登入已過期，請重新登入');return rows[0];}
 async function issue(c,account){const token=crypto.randomBytes(32).toString('hex');await c.query('DELETE FROM sessions WHERE expires_at<now()');await c.query("INSERT INTO sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[hash(token),account.id]);return {token,username:account.username};}
 const meta='id,slot,name,revision,updated_at,save->>\'realm\' AS realm,save->>\'stage\' AS stage';
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers.origin;
  if(origin&&!origins.includes(origin)){res.writeHead(403);res.end();return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, OPTIONS');}
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  const reply=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
  try{
   const path=new URL(req.url,'http://localhost').pathname;
   if(path==='/health'&&req.method==='GET'){await pool.query('SELECT 1');return reply({ok:true});}
   if(/^\/api\/auth\/(register|login|recover)$/.test(path)&&req.method==='POST'){
    const ip=trustProxy?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',').pop().trim():req.socket.remoteAddress;throttle('ip:'+ip);
    const data=await body(req),username=typeof data.username==='string'?data.username.trim().toLowerCase():'';
    if(!usernameValid(username)||!passwordValid(data.password))throw fail(400,'帳號需 4–32 位英文、數字或底線，密碼需 10–128 字元');
    throttle('user:'+hash(username));if(hashing>=4)throw fail(503,'登入服務忙碌，請稍後再試');hashing++;
    try{
     if(path.endsWith('/register')){
      const recoveryCode=crypto.randomBytes(24).toString('hex'),account={id:crypto.randomUUID(),username},ph=await passwordHash(data.password);
      const result=await transaction(async c=>{await c.query('INSERT INTO accounts(id,username,password_hash,recovery_hash) VALUES($1,$2,$3,$4)',[account.id,username,ph,hash(recoveryCode)]);return issue(c,account)});
      return reply({...result,recoveryCode},201);
     }
     const {rows}=await pool.query('SELECT * FROM accounts WHERE username=$1',[username]),account=rows[0];
     if(path.endsWith('/recover')){
      if(!account||typeof data.recoveryCode!=='string'||!crypto.timingSafeEqual(Buffer.from(hash(data.recoveryCode.trim())),Buffer.from(account.recovery_hash)))throw fail(401,'帳號或救援碼不正確');
      const ph=await passwordHash(data.password),recoveryCode=crypto.randomBytes(24).toString('hex');
      const result=await transaction(async c=>{await c.query('SELECT id FROM accounts WHERE id=$1 FOR UPDATE',[account.id]);await c.query('UPDATE accounts SET password_hash=$2,recovery_hash=$3 WHERE id=$1 AND recovery_hash=$4 RETURNING id',[account.id,ph,hash(recoveryCode),account.recovery_hash]).then(r=>{if(!r.rows.length)throw fail(401,'救援碼已使用')});await c.query('DELETE FROM sessions WHERE account_id=$1',[account.id]);return issue(c,account)});
      return reply({...result,recoveryCode});
     }
     // Use the same expensive hash for nonexistent accounts to reduce username timing disclosure.
     const ok=await matches(data.password,account?.password_hash||await dummyPassword);
     if(!account||!ok)throw fail(401,'帳號或密碼不正確');return reply(await issue(pool,account));
    }finally{hashing--;}
   }
   const account=await session(req);
   if(path==='/api/me'&&req.method==='GET')return reply({username:account.username});
   if(path==='/api/auth/logout'&&req.method==='POST'){await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash(req.headers.authorization.slice(7))]);return reply({ok:true});}
   if(path==='/api/characters'&&req.method==='GET')return reply({characters:(await pool.query('SELECT '+meta+' FROM characters WHERE account_id=$1 ORDER BY slot',[account.id])).rows});
   if(path==='/api/characters'&&req.method==='POST'){
    const data=await body(req),save=validateSave(data.save);
    return reply(await transaction(async c=>{
     await c.query('SELECT id FROM accounts WHERE id=$1 FOR UPDATE',[account.id]);
     const slots=(await c.query('SELECT slot FROM characters WHERE account_id=$1',[account.id])).rows.map(x=>x.slot),slot=Array.from({length:5},(_,i)=>i+1).find(x=>!slots.includes(x));
     if(!slot)throw fail(409,'此帳號已有 5 位人物');
     return (await c.query('INSERT INTO characters(id,account_id,slot,name,save) VALUES($1,$2,$3,$4,$5) RETURNING '+meta,[crypto.randomUUID(),account.id,slot,save.name,save])).rows[0];
    }),201);
   }
   const id=path.match(/^\/api\/characters\/([a-f0-9-]{36})$/)?.[1];
   if(id&&req.method==='GET'){
    const row=(await pool.query('SELECT '+meta+',save FROM characters WHERE id=$1 AND account_id=$2',[id,account.id])).rows[0];if(!row)throw fail(404,'找不到人物');return reply(row);
   }
   if(id&&req.method==='PUT'){
    const data=await body(req),save=validateSave(data.save);if(!Number.isInteger(data.revision)||data.revision<1)throw fail(400,'缺少存檔版本');
    return reply(await transaction(async c=>{
     const old=(await c.query('SELECT revision,save FROM characters WHERE id=$1 AND account_id=$2 FOR UPDATE',[id,account.id])).rows[0];if(!old)throw fail(404,'找不到人物');if(old.revision!==data.revision)throw fail(409,'其他裝置已更新此人物，請先備份本機進度，再讀取雲端版本');
     await c.query('INSERT INTO save_history(character_id,revision,save) VALUES($1,$2,$3)',[id,old.revision,old.save]);
     await c.query('DELETE FROM save_history WHERE character_id=$1 AND revision<$2',[id,old.revision-4]);
     return (await c.query('UPDATE characters SET name=$3,save=$4,revision=revision+1,updated_at=now() WHERE id=$1 AND account_id=$2 RETURNING '+meta,[id,account.id,save.name,save])).rows[0];
    }));
   }
   throw fail(404,'找不到此功能');
  }catch(error){const status=error.status||(error.code==='23505'?409:503);reply({error:error.status?error.message:error.code==='23505'?'此帳號已有人使用':'伺服器暫時無法儲存，請保留本機備份'},status);}
 });
}
module.exports={createApp,passwordHash,validateSave,MAX_SAVE_BYTES};
