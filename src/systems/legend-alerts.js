'use strict';
const LegendAlerts=(()=>{
 const E=typeof Economy!=='undefined'?Economy:require('./economy.js'),D=typeof EconomyData!=='undefined'?EconomyData:require('../data/economy.js'),P=typeof Progression!=='undefined'?Progression:require('./progression.js');
 function pending(p){if(!p.economy)return [];const seen=p.economy.legendHandled||{};return Object.values(p.economy.instances).filter(it=>it.quality===4&&!seen[it.id]&&(E.held(p,it.id)||p.economy.mail.includes(it.id)));}
 function dismiss(p,id){p.economy.legendHandled={...p.economy.legendHandled,[id]:true};}
 function stash(p,id,type){if(type==='equip'){if(!P.addItem(p,id,1)){if(p.economy.instances[id])p.economy.mail.push(id);else p.economy.mail.push({id,count:1});}return;}
  const level=type==='pet'?p.levelPet[id]:1;if(type==='pet')delete p.levelPet[id];else p.ownedTreasures=p.ownedTreasures.filter(k=>k!==id);
  p.economy.mail.push({id,companion:type,level,count:1});const key=type+':'+id;
  if(p.companions){p.companions.order=p.companions.order.filter(k=>k!==key);p.companions.deployed=p.companions.deployed.filter(k=>k!==key);}
  const cat=type==='pet'?'pets':'treasures';p.economy.loadout[cat]=p.economy.loadout[cat].map(k=>k===id?null:k);
 }
 function equip(p,id,catalog={}){const it=p.economy?.instances[id],t=it&&(D.templates[it.baseId]||it.template);if(!it||it.quality!==4||!t||(!E.held(p,id)&&!p.economy.mail.includes(id)))return {ok:false,reason:'missing'};if(p.realm<(it.realm||0))return {ok:false,reason:'realm'};
  if(!['equip','pet','treasure'].includes(t.type))return {ok:false,reason:'type'};
  const field=t.type==='equip'?null:t.type==='pet'?'activePet':'activeTreasure',old=t.type==='equip'?p.equipment[t.slot]:p[field];if(old===id){dismiss(p,id);return {ok:true,old};}
  const inMail=p.economy.mail.includes(id);
  if(t.type==='equip'){if(!inMail&&!P.takeItem(p,id,1))return {ok:false,reason:'missing'};p.economy.mail=p.economy.mail.filter(e=>e!==id);p.equipment[t.slot]=id;
   if(old){const snapshot=typeof ITEMS!=='undefined'?ITEMS:catalog;if(!P.addItem(p,old,1,snapshot)){if(p.economy.instances[old])p.economy.mail.push(old);else p.economy.mail.push({id:old,count:1});}}
  }else{const cat=t.type==='pet'?'pets':'treasures';if(inMail&&E.stored(p,t.type)>=(p.bag?.capacities?.[cat]||100)){
    const owned=t.type==='pet'?Object.keys(p.levelPet).filter(k=>p.levelPet[k]>0):p.ownedTreasures;
    const displaced=old||owned.find(k=>k!==id);if(!displaced)return {ok:false,reason:'full'};stash(p,displaced,t.type);
   }p.economy.mail=p.economy.mail.filter(e=>e!==id);if(t.type==='pet')p.levelPet[id]=it.level||1;else if(!p.ownedTreasures.includes(id))p.ownedTreasures.push(id);p[field]=id;
  }dismiss(p,id);return {ok:true,old};
 }
 function seconds(deadline,now=Date.now()){return Math.max(0,Math.ceil((deadline-now)/1000));}
 return {pending,dismiss,equip,seconds};
})();
if(typeof module!=='undefined')module.exports=LegendAlerts;
