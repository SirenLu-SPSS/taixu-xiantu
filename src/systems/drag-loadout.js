'use strict';
const DragLoadout=(()=>{
 const C=typeof CharacterSystem!=='undefined'?CharacterSystem:require('./character.js');
 const B=typeof Companions!=='undefined'?Companions:require('./companions.js');
 function kind(p,id,catalog){if(catalog[id]?.type==='equip')return 'equip';if(p.levelPet?.[id]>0)return 'pet';if(p.ownedTreasures?.includes(id))return 'treasure';return null;}
 function standby(p,type,id){return !p.companions?.deployed?.includes(type+':'+id)&&p[type==='pet'?'activePet':'activeTreasure']!==id;}
 function group(p,type){return B.deployedKeys(p).filter(k=>k.startsWith(type+':'));}
 function sync(p,type){const ids=group(p,type).map(k=>k.slice(type.length+1)),field=type==='pet'?'activePet':'activeTreasure';if(p[field]&&!ids.includes(p[field]))p[field]=ids[0]||null;if(!p[field]&&ids.length)p[field]=ids[0];if(p.economy?.loadout)p.economy.loadout[type==='pet'?'pets':'treasures']=Array.from({length:6},(_,i)=>ids.includes(p[field])?(i===0?p[field]:ids.filter(id=>id!==p[field])[i-1]||null):null);}
 function allowed(p,source,target,catalog){
  if(!source||!target)return {ok:false,reason:'請拖到對應欄位'};
  const type=kind(p,source.id,catalog);if(!type)return {ok:false,reason:'此物品不能拖移裝備'};
  if(source.from==='bag'){
   if(type==='equip'&&!p.inventory.some(x=>x.id===source.id&&x.count>0))return {ok:false,reason:'背包物品已變更'};
   if(type!=='equip'&&!standby(p,type,source.id))return {ok:false,reason:'此伙伴已出戰，請從人物欄拖移'};
  }else if(type==='equip'?p.equipment[source.slot]!==source.id:!group(p,type).includes(type+':'+source.id))return {ok:false,reason:'原欄位已變更'};
  if(target.type==='bag')return source.from==='bag'?{ok:false,reason:'物品已在背包待命'}:{ok:true,type};
  if(type==='equip'){
   if(target.type!=='equip'||catalog[source.id].slot!==target.slot)return {ok:false,reason:'只能放入 '+(C.slots[catalog[source.id].slot]||'對應裝備')+' 欄位'};
   if(source.from!=='bag')return {ok:false,reason:'裝備已在此欄位'};
   if(p.realm<(catalog[source.id].realm||0))return {ok:false,reason:'境界不足，無法裝備'};
  }else{
   if(target.type!==type||!Number.isInteger(target.index)||target.index<0||target.index>7)return {ok:false,reason:'靈寵與法寶只能放入各自欄位'};
   if(target.index>=B.capacity(p))return {ok:false,reason:'境界未達，此欄位尚未解鎖'};
   const item=p.economy?.instances?.[source.id],template=item?.template||(typeof EconomyData!=='undefined'?EconomyData.templates[item?.baseId]:null);
   if(template?.highRealm&&p.realm<template.realm)return {ok:false,reason:'境界不足，無法出戰'};
   if(group(p,type)[target.index]===type+':'+source.id)return {ok:false,reason:'已在此欄位'};
  }
  return {ok:true,type};
 }
 function apply(p,source,target,catalog){
  const check=allowed(p,source,target,catalog);if(!check.ok)return check;const {type}=check;
  if(type==='equip'){
   if(target.type==='bag')return C.unequip(p,source.slot,catalog)?{ok:true,message:'裝備已卸下，收回背包'}:{ok:false,reason:'背包已滿，無法卸下'};
   const result=C.equip(p,source.id,catalog);return result.ok?{ok:true,message:'已裝備 '+catalog[source.id].name}:{ok:false,reason:result.reason==='full'?'背包已滿，無法替換':'無法裝備，物品狀態已變更'};
  }
  const key=type+':'+source.id,order=group(p,type),oldIndex=order.indexOf(key);
  if(target.type==='bag'){B.setDeployment(p,key,false);sync(p,type);return {ok:true,message:(type==='pet'?'靈寵':'法寶')+'已休息，收回背包'};}
  const index=Math.min(target.index,order.length),other=order[index];
  if(oldIndex>=0){if(other)[order[oldIndex],order[index]]=[order[index],order[oldIndex]];else{order.splice(oldIndex,1);order.push(key);}}
  else if(other)order[index]=key;else order.push(key);
  const old=group(p,type);p.companions.deployed=p.companions.deployed.filter(k=>!old.includes(k)).concat(order);
  p.companions.order=order.concat(p.companions.order.filter(k=>!order.includes(k)));p.companions.cursor=0;
  sync(p,type);return {ok:true,message:oldIndex>=0?'出戰順序已調整':other?'已出戰，原伙伴回背包待命':'已裝備並出戰'};
 }
 return {kind,standby,group,sync,allowed,apply};
})();
if(typeof module!=='undefined')module.exports=DragLoadout;
