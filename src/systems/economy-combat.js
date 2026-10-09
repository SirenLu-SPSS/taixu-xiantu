'use strict';
const EconomyCombat=(()=>{
 function recover(p,stats,qiMax,fx,dt){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.1,dt);p.hp=Math.min(stats.hp,p.hp+dt*(fx.regenHp||0)*(1+(fx.healing||0)));p.mp=Math.min(stats.mp,p.mp+dt*(fx.regenMp||0));p.qi=Math.min(qiMax,p.qi+dt*(fx.qi||0));}
 function incoming(damage,fx,r=Math.random){if(r()<(fx.dodge||0))return 0;return Math.max(1,Math.round(damage*(1-(fx.reduction||0))));}
 function splashTargets(enemies,hit,config){return enemies.filter(e=>e!==hit&&e.hp>0&&Math.hypot(e.x-hit.x,e.y-hit.y)<=config.radius).slice(0,config.maxTargets);}
 return {recover,incoming,splashTargets};
})();
if(typeof module!=='undefined')module.exports=EconomyCombat;
