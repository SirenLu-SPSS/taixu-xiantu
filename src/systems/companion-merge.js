'use strict';
const CompanionMerge=(()=>{
 const D=typeof EconomyData!=='undefined'?EconomyData:require('../data/economy.js');
 function level(p,id,type){const it=p.economy?.instances[id];return type==='pet'?(p.levelPet[id]||1):(it?.fusionLevel||1);}
 function preview(p,type){
  if(!['pet','treasure'].includes(type))return {ok:false,groups:[],count:0,reason:'type'};
  const owned=type==='pet'?Object.keys(p.levelPet||{}).filter(id=>p.levelPet[id]>0):p.ownedTreasures||[],main=p[type==='pet'?'activePet':'activeTreasure'],groups=new Map();
  for(const id of new Set(owned)){const it=p.economy?.instances[id],t=it&&(D.templates[it.baseId]||it.template);if(!it||it.mergedInto||it.dismantled||t?.type!==type||it.locked||p.bag?.locked?.[id])continue;const key=it.baseId+':'+it.quality+':'+it.realm;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(it);}
  const out=[];for(const items of groups.values()){
   const protectedItem=it=>it.enhancement>0||it.sockets?.some(Boolean)||it.evolution>0||it.cultivation>0;
   const ranked=items.slice().sort((a,b)=>Number(b.id===main)-Number(a.id===main)||Number(protectedItem(b))-Number(protectedItem(a))||level(p,b.id,type)-level(p,a.id,type)||a.id.localeCompare(b.id));
   const survivor=ranked[0],donors=ranked.slice(1).filter(it=>!protectedItem(it));if(!donors.length)continue;
   const ids=[survivor.id,...donors.map(it=>it.id)],levels=ids.map(id=>level(p,id,type)),after=levels.reduce((n,v)=>n+v,0);if(!Number.isSafeInteger(after)||after<2)continue;
   out.push({id:survivor.id,baseId:survivor.baseId,quality:survivor.quality,ids,levels,before:levels[0],after,consumed:donors.map(it=>it.id)});
  }
  return {ok:out.length>0,type,groups:out,count:out.reduce((n,g)=>n+g.consumed.length,0)};
 }
 function merge(p,type){const plan=preview(p,type);if(!plan.ok)return plan;const remap=new Map();for(const g of plan.groups){const it=p.economy.instances[g.id];it.fusionLevel=g.after;it.level=g.after;if(type==='pet')p.levelPet[g.id]=g.after;for(const id of g.consumed){remap.set(id,g.id);p.economy.instances[id].mergedInto=g.id;if(type==='pet')delete p.levelPet[id];else p.ownedTreasures=p.ownedTreasures.filter(k=>k!==id);}}
  p.economy.mail=p.economy.mail.filter(e=>!remap.has(typeof e==='string'?e:e?.id));
  const field=type==='pet'?'activePet':'activeTreasure';if(remap.has(p[field]))p[field]=remap.get(p[field]);
  const cat=type==='pet'?'pets':'treasures',load=p.economy.loadout[cat],seen=new Set();p.economy.loadout[cat]=load.map(id=>{id=remap.get(id)||id;if(!id||seen.has(id))return null;seen.add(id);return id;});
  if(p.companions){const rewrite=key=>{const prefix=type+':';return key.startsWith(prefix)?prefix+(remap.get(key.slice(prefix.length))||key.slice(prefix.length)):key;};for(const field of ['order','deployed'])p.companions[field]=[...new Set(p.companions[field].map(rewrite))];const cooldowns={};for(const [key,value] of Object.entries(p.companions.cooldowns||{})){const next=rewrite(key);cooldowns[next]=Math.max(cooldowns[next]||0,value);}p.companions.cooldowns=cooldowns;p.companions.cursor=0;}
  p.economy.mergeLog=[...(p.economy.mergeLog||[]),{type,groups:plan.groups,at:Date.now()}];return plan;
 }
 function treasureCandidates(p){return [...new Set(p.ownedTreasures||[])].map(id=>p.economy?.instances[id]).filter(it=>it&&!it.mergedInto&&!it.dismantled&&!it.locked&&!p.bag?.locked?.[it.id]&&(D.templates[it.baseId]||it.template)?.type==='treasure'&&[2,3].includes(it.quality));}
 function promotionQuote(p,mainId,donors){const candidates=treasureCandidates(p),main=candidates.find(it=>it.id===mainId);if(!main||donors.length!==2||new Set([mainId,...donors]).size!==3)return {ok:false,reason:'請選擇主法寶與兩件不同的同品階材料'};const materials=donors.map(id=>candidates.find(it=>it.id===id));if(materials.some(it=>!it||it.quality!==main.quality||it.realm!==main.realm))return {ok:false,reason:'材料必須與主法寶同品階、同境界'};if(materials.some(it=>it.enhancement>0||it.sockets?.some(Boolean)||it.id===p.activeTreasure||p.companions?.deployed?.includes('treasure:'+it.id)))return {ok:false,reason:'材料不可為主選、出戰中、已強化或已鑲嵌的法寶'};return {ok:true,main,materials,target:main.quality+1};}
 function promoteTreasure(p,mainId,donors){const q=promotionQuote(p,mainId,donors);if(!q.ok)return q;const main=q.main,before=main.quality,ratio=D.qualities[q.target].scale/D.qualities[before].scale;for(const key of ['atk','def','hp'])main.base[key]=Math.round((main.base[key]||0)*ratio);main.quality=q.target;while(main.sockets.length<D.qualities[q.target].holes[0])main.sockets.push(null);for(const it of q.materials)it.mergedInto=mainId;p.ownedTreasures=p.ownedTreasures.filter(id=>!donors.includes(id));p.inventory=p.inventory.filter(e=>!donors.includes(e.id));p.economy.mail=p.economy.mail.filter(e=>!donors.includes(typeof e==='string'?e:e.id));p.economy.loadout.treasures=p.economy.loadout.treasures.map(id=>donors.includes(id)?null:id);if(p.companions){for(const field of ['order','deployed'])p.companions[field]=p.companions[field].filter(key=>!donors.includes(key.split(':')[1]));for(const id of donors)delete p.companions.cooldowns['treasure:'+id];p.companions.cursor=0;}p.economy.promotionLog=[...(p.economy.promotionLog||[]),{mainId,donors:[...donors],before,after:q.target,at:Date.now()}];return {ok:true,item:main};}
 return {preview,merge,level,treasureCandidates,promotionQuote,promoteTreasure};
})();
if(typeof module!=='undefined')module.exports=CompanionMerge;
