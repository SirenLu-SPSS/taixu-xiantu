'use strict';
const Companions=(()=>{
 const units=[['pet:fox',2800,.32,'fire'],['pet:turtle',5200,.35,'sword'],['pet:falcon',3600,.55,'sword'],['pet:dragon',7000,.85,'fire'],['treasure:mirror',3500,.4,'sword'],['treasure:dagger',4500,.7,'sword'],['treasure:bell',6500,.55,'sword'],['treasure:gourd',5500,.6,'fire']].map(([key,cd,scale,kind])=>({key,cd,scale,kind}));
 const unit=key=>units.find(u=>u.key===key);
 const owned=(p,key)=>{const [type,id]=key.split(':');return type==='pet'?!!p.levelPet?.[id]:type==='treasure'&&!!p.ownedTreasures?.includes(id)};
 function normalize(p,now=Date.now()){const previous=p.companions||{},order=[...new Set((previous.order||units.map(u=>u.key)).filter(k=>unit(k)&&owned(p,k)))];const deployed=Array.isArray(previous.deployed)?previous.deployed.filter(k=>order.includes(k)):order.slice();const cooldowns={};for(const u of units){const end=Number(previous.cooldowns?.[u.key]);if(Number.isFinite(end)&&end>now)cooldowns[u.key]=Math.min(end,now+u.cd)}p.companions={order,deployed:[...new Set(deployed)],cooldowns,auto:previous.auto!==false,cursor:Math.max(0,Math.floor(Number(previous.cursor)||0))%Math.max(1,order.length)};return p.companions}
 function ready(p,key,now){return owned(p,key)&&p.companions.deployed.includes(key)&&now>=(p.companions.cooldowns[key]||0)}
 function next(p,now){const s=p.companions;if(!s.auto)return null;for(let i=0;i<s.order.length;i++){const index=(s.cursor+i)%s.order.length,key=s.order[index];if(ready(p,key,now))return key}return null}
 function launch(p,key,now){if(!unit(key)||!ready(p,key,now))return false;const s=p.companions;s.cooldowns[key]=now+unit(key).cd;s.cursor=(s.order.indexOf(key)+1)%Math.max(1,s.order.length);return true}
 return {units,unit,owned,normalize,ready,next,launch};
})();
if(typeof module!=='undefined')module.exports=Companions;
