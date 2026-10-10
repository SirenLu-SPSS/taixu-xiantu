'use strict';
// Authoritative inventory remains inventory / ownedTreasures / levelPet.
const CharacterSystem=(()=>{
 const slots={head:'頭冠',earrings:'耳環',inner:'內衣',weapon:'武器',legs:'護腿',necklace:'項鍊',bracelet:'手環',robe:'外衣',ring:'戒指',boots:'鞋靴',belt:'腰帶',charm:'護符'};
 const categories={equipment:'裝備',treasures:'法寶',pets:'靈寵',consumables:'丹藥',materials:'材料',books:'技能書'};
 const gear=['jadeSword','starRobe','sword','robe','crown','boots','ring','earrings','inner','legs','necklace','bracelet'];
 function category(id,catalog={}){const type=catalog[id]?.type;return /^v21_(book|fragment)_\d+$/.test(id)||['book','fragment'].includes(type)?'books':type==='equip'||gear.includes(id)?'equipment':type==='pill'||['pill','heal','trib'].includes(id)?'consumables':'materials'}
 function normalize(p){p.equipment={...Object.fromEntries(Object.keys(slots).map(k=>[k,null])),...p.equipment};p.bag={...p.bag,version:1,capacities:{...p.bag?.capacities,...Object.fromEntries(Object.keys(categories).map(k=>[k,Math.max(100,Number(p.bag?.capacities?.[k])||100)]))}};return p}
 function entries(p,cat,catalog={}){if(cat==='treasures')return (p.ownedTreasures||[]).map(id=>({id,count:1}));if(cat==='pets')return Object.entries(p.levelPet||{}).filter(([,lv])=>lv>0).map(([id])=>({id,count:1}));return p.inventory.filter(i=>category(i.id,catalog)===cat)}
 function capacity(p,cat){return Math.max(100,p.bag?.capacities?.[cat]||100)}
 function canStore(p,id,catalog={}){return p.inventory.some(e=>e.id===id)||entries(p,category(id,catalog),catalog).length<capacity(p,category(id,catalog))}
 function equip(p,id,catalog){const it=catalog[id];if(!it||it.type!=='equip'||!Object.hasOwn(slots,it.slot)||p.realm<(it.realm||0))return {ok:false,reason:'requirement'};const entry=p.inventory.find(e=>e.id===id);if(!entry||entry.count<1)return {ok:false,reason:'missing'};
  const old=p.equipment[it.slot];if(old===id)return {ok:false,reason:'equipped'};
  const returnStack=old&&p.inventory.find(e=>e.id===old);if(returnStack&&!Number.isSafeInteger(returnStack.count+1))return {ok:false,reason:'full'};
  // One copy moves into the equipment slot; replacement returns exactly one.
  if(old&&!p.inventory.some(e=>e.id===old)&&entry.count>1&&!canStore(p,old,catalog))return {ok:false,reason:'full'};
  entry.count--;if(!entry.count)p.inventory.splice(p.inventory.indexOf(entry),1);
  if(old){const previous=p.inventory.find(e=>e.id===old);if(previous)previous.count++;else p.inventory.push({id:old,count:1})}p.equipment[it.slot]=id;return {ok:true,old};
 }
 function unequip(p,slot,catalog){const id=p.equipment[slot];if(!Object.hasOwn(slots,slot)||!id)return false;if(!canStore(p,id,catalog))return false;const entry=p.inventory.find(e=>e.id===id);if(entry&&!Number.isSafeInteger(entry.count+1))return false;if(entry)entry.count++;else p.inventory.push({id,count:1});p.equipment[slot]=null;return true}
 function sorted(p,cat,sort,catalog={}){return entries(p,cat,catalog).slice().sort((a,b)=>{const x=catalog[a.id]||{},y=catalog[b.id]||{};return (sort==='quality'?(y.rarity||0)-(x.rarity||0):sort==='type'?String(x.slot||x.type||'').localeCompare(String(y.slot||y.type||'')):0)||String(x.name||a.id).localeCompare(String(y.name||b.id),'zh-Hant')})}
 function owned(p,type,id){return type==='pet'?!!p.levelPet?.[id]:type==='treasure'&&p.ownedTreasures?.includes(id)}
 function acquire(p,type,meta){if(!meta||!['pet','treasure'].includes(type)||owned(p,type,meta.id))return false;const cat=type==='pet'?'pets':'treasures',currency=type==='pet'?'stones':'jade';if(entries(p,cat).length>=capacity(p,cat)||p[currency]<meta.cost||!Number.isSafeInteger(meta.cost)||meta.cost<0)return false;p[currency]-=meta.cost;if(type==='pet')p.levelPet[meta.id]=1;else p.ownedTreasures.push(meta.id);const key=type+':'+meta.id;if(!p.companions.order.includes(key))p.companions.order.push(key);return true}
 function companionTemplate(p,id){const item=p.economy?.instances?.[id];if(!item)return null;const data=typeof EconomyData!=='undefined'?EconomyData:require('../data/economy.js');return data.templates[item.baseId]||item.template;}
 function canDeploy(p,id){const t=companionTemplate(p,id);return !t?.highRealm||p.realm>=t.realm;}
 function primary(p,type,id){if(!['pet','treasure'].includes(type)||(id!==null&&(!owned(p,type,id)||!canDeploy(p,id))))return false;p[type==='pet'?'activePet':'activeTreasure']=id;return true}
 function deployment(p,key){const [type,id]=key.split(':');if(!owned(p,type,id)||!canDeploy(p,id))return false;const c=typeof Companions!=='undefined'?Companions:require('./companions.js');return c.setDeployment(p,key,!p.companions.deployed.includes(key))}
 function upgrade(p,id){const level=p.levelPet?.[id];if(!Number.isInteger(level)||level<1||level>=20||p.stones<level*70)return false;const req=companionTemplate(p,id)?.cultivationRequirement;if(req){const econ=typeof Economy!=='undefined'?Economy:require('./economy.js');if(!econ.take(p,req.material,req.count))return false;}p.stones-=level*70;p.levelPet[id]++;return true}
 return {slots,categories,category,normalize,entries,capacity,canStore,equip,unequip,sorted,acquire,primary,deployment,upgrade};
})();
if(typeof module!=='undefined')module.exports=CharacterSystem;
