'use strict';
const BreakthroughSystem=(()=>{
 const config={majorRates:[.95,.84,.75,.40,.32,.25,.18,.12,.08],duration:3000,recipe:{herb:20,trib:2,stones:1200},tribBonus:[0,.25,.35],celestialBonus:.15};
 const count=(p,id)=>p.inventory.find(x=>x.id===id)?.count||0;
 function quote(p,realms,trib=0,celestial=0){
  const current=realms[p.realm],major=p.stage===current.stages-1,target=major?Math.min(p.realm+1,realms.length):p.realm;
  const thunder=target>=4,base=major?config.majorRates[p.realm]:current.rate*(thunder?.85:1);
  const chance=Math.min(.99,Math.max(.05,base+config.tribBonus[trib]+celestial*config.celestialBonus));
  const bolts=thunder?Math.min(6,2+target-4):0,damage=bolts*.07*(celestial?.5:1);
  return {major,target,thunder,base,chance,bolts,damage,duration:config.duration,asset:Math.min(target,realms.length-1)};
 }
 function take(p,id,n){if(!n)return;const e=p.inventory.find(x=>x.id===id);e.count-=n;if(!e.count)p.inventory.splice(p.inventory.indexOf(e),1);}
 function attempt(p,realms,qiMax,maxVitals,trib=0,celestial=0,random=Math.random){
  if(p.finished||p.qi<qiMax||!Number.isInteger(trib)||trib<0||trib>2||!Number.isInteger(celestial)||celestial<0||celestial>1||count(p,'trib')<trib||count(p,'celestialPill')<celestial)return {ok:false};
  const q=quote(p,realms,trib,celestial),roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)return {ok:false};
  take(p,'trib',trib);take(p,'celestialPill',celestial);const success=roll<q.chance;
  if(success){p.qi=0;p.stage++;if(p.stage>=realms[p.realm].stages){p.stage=0;if(p.realm===realms.length-1)p.finished=true;else p.realm++;}p.breakthroughs=(p.breakthroughs||0)+1;const s=maxVitals(p);p.hp=s.hp;p.mp=s.mp;}else{p.qi*=.72;p.hp=Math.max(1,Math.round(p.hp*.72));}
  const thunderDamage=q.thunder?Math.min(Math.max(0,p.hp-1),Math.round(maxVitals(p).hp*q.damage)):0;p.hp=Math.max(1,p.hp-thunderDamage);
  const result={ok:true,...q,success,trib,celestial,thunderDamage,realm:p.realm,stage:p.stage,at:Date.now()};
  p.breakthroughHistory=[...(p.breakthroughHistory||[]),result].slice(-30);return result;
 }
 function craft(p,canStore){const c=config.recipe;if(count(p,'celestialPill')>=Number.MAX_SAFE_INTEGER)return {ok:false,reason:'full'};if(p.stones<c.stones||count(p,'herb')<c.herb||count(p,'trib')<c.trib)return {ok:false,reason:'materials'};if(!canStore(p,'celestialPill'))return {ok:false,reason:'full'};take(p,'herb',c.herb);take(p,'trib',c.trib);p.herbs=count(p,'herb');p.stones-=c.stones;const e=p.inventory.find(x=>x.id==='celestialPill');if(e)e.count++;else p.inventory.push({id:'celestialPill',count:1});return {ok:true};}
 return {config,quote,attempt,craft};
})();
if(typeof module!=='undefined')module.exports=BreakthroughSystem;
