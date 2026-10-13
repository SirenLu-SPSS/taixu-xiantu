const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/ui/accounts.js'),'utf8');
function fixture(){
 const timers=new Map();let id=0,now=0,uploads=0,locals=0,caches=0;
 const context=vm.createContext({setTimeout:(fn,delay)=>{timers.set(++id,{fn,at:now+delay});return id;},clearTimeout:key=>timers.delete(key),local:()=>locals++,cached:()=>caches++,uploaded:()=>uploads++,read:()=>null,backupGuest:()=>{},note:()=>{}});
 vm.runInContext('let timer=null,active={id:1};const OWNER="owner";let save=()=>local();function cacheCurrent(){cached();return true;}function flush(){uploaded();}',context);
 vm.runInContext(source.match(/ function scheduleFlush\(\)\{[^\n]+/)[0]+source.match(/ const baseSave=save;save=function[^\n]+/)[0],context);
 return {save:quiet=>vm.runInContext('save('+quiet+')',context),advance(ms){now+=ms;for(const [key,t]of timers)if(t.at<=now){timers.delete(key);t.fn();}},counts:()=>({uploads,locals,caches,timers:timers.size}),guest:()=>vm.runInContext('active=null',context)};
}
test('frequent quiet saves cannot postpone the fifteen second cloud upload',()=>{
 const f=fixture();f.save(true);
 for(let i=0;i<14;i++){f.advance(1000);f.save(true);}
 assert.equal(f.counts().uploads,0);assert.equal(f.counts().timers,1);
 f.advance(1000);assert.equal(f.counts().uploads,1);
 f.save(true);f.advance(15000);assert.equal(f.counts().uploads,2);
 assert.equal(f.counts().locals,16);assert.equal(f.counts().caches,16);
});
test('manual save requests immediate cloud upload and guest saves remain local',()=>{
 const f=fixture();f.save(false);assert.equal(f.counts().uploads,1);
 f.guest();f.save(true);f.advance(15000);
 assert.equal(f.counts().uploads,1);assert.equal(f.counts().locals,2);
});
