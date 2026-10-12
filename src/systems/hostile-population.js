'use strict';
const HostilePopulation=(()=>{
 function policy(level){const n=Math.max(0,level-4);return {enabled:level>=4,minimum:30,cap:30+n*2,interval:Math.max(.25,1.2*.8**n),elite:Math.min(.4,.25+n*.025),cultivator:Math.min(.45,.3+n*.02)};}
 function pick(pool,level,random=Math.random){const c=policy(level),roll=random(),role=roll<c.cultivator?'cultivator':roll<c.cultivator+c.elite?'elite':'normal',items=pool.filter(e=>e.role===role);const choices=items.length?items:pool.filter(e=>e.role!=='boss');return choices[Math.floor(random()*choices.length)];}
 return {policy,pick};
})();
if(typeof module!=='undefined')module.exports=HostilePopulation;
