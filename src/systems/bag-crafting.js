'use strict';
const BagCrafting=(()=>{
 const E=typeof Economy!=='undefined'?Economy:require('./economy.js'),D=typeof EconomyData!=='undefined'?EconomyData:require('../data/economy.js'),H=typeof HighRealmData!=='undefined'?HighRealmData:require('../data/high-realms.js');
 const locked=(p,id)=>!!(p.bag?.locked?.[id]);
 const isBook=id=>/^v21_(book|fragment)_\d+$/.test(id);
 function plan(p,kind,target){
  if(!['books','gems'].includes(kind)||(kind==='gems'&&![4,5,6].includes(target)))return {ok:false,reason:'target'};
  const counts=new Map();for(const e of p.inventory)counts.set(e.id,(counts.get(e.id)||0)+e.count);const initial=new Map(counts),made=[],steps=[];let cost=0;
  const put=(id,n)=>counts.set(id,(counts.get(id)||0)+n);
  if(kind==='books')for(const s of H.skills){const id='v21_fragment_'+s.id.split('_').at(-1);if(locked(p,id)||locked(p,s.bookId))continue;const n=Math.floor((counts.get(id)||0)/10);if(!n)continue;put(id,-n*10);put(s.bookId,n);made.push({id:s.bookId,count:n});steps.push({id,count:n*10});}
  else for(const [type] of D.gemTypes){
   const output='gem_'+type+'_'+target;if(locked(p,output))continue;
   const simulate=n=>{const trial=new Map(counts),used=[];let price=0;const consume=(tier,amount)=>{const id='gem_'+type+'_'+tier;if(locked(p,id))return false;const have=trial.get(id)||0,take=Math.min(have,amount);trial.set(id,have-take);const missing=amount-take;if(!missing)return true;if(tier===1||!consume(tier-1,missing*D.config.fusion.gemCopies))return false;price+=missing*50*(tier-1);used.push({id:'gem_'+type+'_'+(tier-1),count:missing*D.config.fusion.gemCopies});return true;};if(!consume(target-1,n*D.config.fusion.gemCopies))return null;price+=n*50*(target-1);used.push({id:'gem_'+type+'_'+(target-1),count:n*D.config.fusion.gemCopies});trial.set(output,(trial.get(output)||0)+n);return {trial,price,used};};
   let units=0;for(let tier=1;tier<target;tier++)if(!locked(p,'gem_'+type+'_'+tier))units+=(counts.get('gem_'+type+'_'+tier)||0)*D.config.fusion.gemCopies**(tier-1);
   let lo=0,hi=Math.floor(units/D.config.fusion.gemCopies**(target-1));while(lo<hi){const mid=Math.ceil((lo+hi)/2),r=simulate(mid);if(r&&r.price<=p.stones-cost)lo=mid;else hi=mid-1;}
   if(lo){const r=simulate(lo);for(const [id,n]of r.trial)counts.set(id,n);cost+=r.price;steps.push(...r.used);}
  }
  if(kind==='gems')for(const [id,n] of counts)if(D.templates[id]?.type==='gem'&&n>(initial.get(id)||0))made.push({id,count:n-(initial.get(id)||0)});
  const inventory=[...counts].filter(([,count])=>count>0).map(([id,count])=>({...(p.inventory.find(e=>e.id===id)||{}),id,count}));
  const countCategory=(items)=>items.filter(e=>kind==='books'?isBook(e.id):!p.economy?.instances[e.id]&&!isBook(e.id)&&!['pill','heal','trib','tianling','sword','robe','crown','boots','ring','earrings','inner','legs','necklace','bracelet','jadeSword','starRobe','belt','charm'].includes(e.id)&&D.templates[e.id]?.type!=='equip').length;
  const cap=p.bag?.capacities?.[kind==='books'?'books':'materials']||100;
  if(countCategory(inventory)>Math.max(cap,countCategory(p.inventory)))return {ok:false,reason:'full'};
  return {ok:steps.length>0,reason:steps.length?'ready':'materials',inventory,cost,made,steps,kind,target};
 }
 function craft(p,kind,target){const r=plan(p,kind,target);if(!r.ok)return r;p.inventory=r.inventory;p.stones-=r.cost;return r;}
 function reward(p,enemy,r=Math.random){
  E.normalize(p);const chance=enemy.dark||enemy.role==='cultivator'?.8:enemy.boss||enemy.role==='boss'?1:enemy.elite||enemy.role==='elite'?.35:.12;
  const key=enemy.claimId||(enemy.fragmentClaimId||(enemy.fragmentClaimId='fragment:'+((p.economy.fragmentSequence||0)+1)));if(!enemy.claimId)p.economy.fragmentSequence=Math.max(p.economy.fragmentSequence||0,Number(key.split(':').at(-1))||0);
  const receipts=p.economy.fragmentClaims||(p.economy.fragmentClaims={});if(receipts[key])return {ok:false};
  const values=[r(),r(),r()];if(values.some(n=>!Number.isFinite(n)||n<0||n>=1))return {ok:false};receipts[key]=true;if(values[0]>=chance)return {ok:true,count:0};
  const pool=H.skills.filter(s=>s.realm<=Math.max(4,enemy.realm||enemy.darkRealm||p.realm)),s=pool[Math.floor(values[1]*pool.length)],id='v21_fragment_'+s.id.split('_').at(-1),count=1+Math.floor(values[2]*3);
  if(!E.addStack(p,id,count))p.economy.mail.push({id,count,source:'技能殘卷掉落'});return {ok:true,id,count};
 }
 return {plan,craft,reward,isBook};
})();
if(typeof module!=='undefined')module.exports=BagCrafting;
