'use strict';
const HostilePopulation=(()=>{
 function policy(level){const n=Math.max(0,level-4);return {enabled:level>=4,minimum:15,cap:15,interval:Math.max(.25,1.2*.8**n),elite:Math.min(.4,.25+n*.025),cultivator:Math.min(.45,.3+n*.02)};}
 function pick(pool,level,random=Math.random){const c=policy(level),roll=random(),role=roll<c.cultivator?'cultivator':roll<c.cultivator+c.elite?'elite':'normal',items=pool.filter(e=>e.role===role);const choices=items.length?items:pool.filter(e=>e.role!=='boss');return choices[Math.floor(random()*choices.length)];}
 function engage(e,position){if(!e.territorial)return true;const home=e.home||{x:e.x,y:e.y};const intruder=Math.hypot(position.x-home.x,position.y-home.y);e.engaged=intruder<=(e.engaged?220:140);return e.engaged;}
 function move(e,position,dt,speed=1){const home=e.home||{x:e.x,y:e.y};e.home=home;const engaged=engage(e,position);e.patrolTime=(e.patrolTime||0)+dt*.24;const target=engaged?position:{x:home.x+Math.cos(e.patrolTime)*65,y:home.y+Math.sin(e.patrolTime)*65};const distance=Math.hypot(target.x-e.x,target.y-e.y),step=Math.min(distance,(engaged?48:15)*dt*speed);if(distance>(engaged?42:2)){e.x+=(target.x-e.x)/distance*step;e.y+=(target.y-e.y)/distance*step;}return engaged;}
 return {policy,pick,engage,move};
})();
if(typeof module!=='undefined')module.exports=HostilePopulation;
