'use strict';
const DarkCultivators=(()=>{
 const D=typeof DarkCultivatorData!=='undefined'?DarkCultivatorData:require('../data/dark-cultivators.js'),E=typeof Economy!=='undefined'?Economy:require('./economy.js');
 function normalize(p){const s=p.darkCultivators||{};p.darkCultivators={...s,sequence:s.sequence||0,nextByMap:s.nextByMap||{}};return p.darkCultivators;}
 function spawn(p,mapIndex,map,realms,enemies,random=Math.random,now=Date.now()){
  const state=normalize(p);if(enemies.some(e=>e.dark)||now<(state.nextByMap[mapIndex]||0)||random()>=D.config.spawnChance)return null;
  const rank=Math.min(realms.length-1,map.level+1),r=realms[rank],m=D.maps[mapIndex];if(!m)return null;
  state.nextByMap[mapIndex]=now+D.config.cooldown;const id='dark:'+mapIndex+':'+(++state.sequence);
  return {dark:true,darkMap:mapIndex,darkRealm:rank,claimId:id,name:m.cultivator+' · '+r.name,hp:Math.round(r.hp*.8),maxHp:Math.round(r.hp*.8),atk:Math.round(r.atk*.4),def:Math.round(r.def*.5),stone:60*(rank+1),qi:100*(rank+1),skillTimer:3,skillRound:0,warning:null};
 }
 function step(e,dt,position){if(!e.dark||e.hp<=0)return null;
  if(e.warning){e.warning.left-=dt;if(e.warning.left<=0){const w=e.warning;e.warning=null;return {...w,hit:Math.hypot(position.x-w.x,position.y-w.y)<=w.radius,damage:Math.round(e.atk*(w.kind==='pet'?.5:.8))};}return null;}
  e.skillTimer-=dt;if(e.skillTimer<=0&&Math.hypot(e.x-position.x,e.y-position.y)<650){const kind=e.skillRound++%2?'pet':'treasure';e.warning={x:position.x,y:position.y,radius:kind==='pet'?85:115,left:D.config.warning,total:D.config.warning,kind};e.skillTimer=D.config.skillCooldown;}return null;
 }
 function reward(p,e,random=Math.random){E.normalize(p);if(!e.dark||!e.claimId||p.economy.claims[e.claimId])return {ok:false};
  p.economy.claims[e.claimId]={kind:'darkCultivator',at:Date.now()};const roll=random(),quality=roll<D.config.legendChance?4:roll<D.config.legendChance+D.config.goldChance?3:null,ids=[];
  if(quality!==null){const pool=quality===4?D.legends.filter(t=>t.darkMap===e.darkMap):Object.values((typeof EconomyData!=='undefined'?EconomyData:require('../data/economy.js')).templates).filter(t=>!t.legendOnly&&t.type==='equip'&&t.realm<=e.darkRealm);const t=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];const item=E.create(p,t.id,quality,e.name+' · '+e.claimId,random);E.grant(p,item);ids.push(item.id);}
  if(!E.addStack(p,'forgeDust',3))p.economy.mail.push({id:'forgeDust',count:3});p.economy.drops.push({key:e.claimId,kind:'darkCultivator',rewards:ids,at:Date.now()});return {ok:true,quality,ids};
 }
 return {normalize,spawn,step,reward};
})();
if(typeof module!=='undefined')module.exports=DarkCultivators;
