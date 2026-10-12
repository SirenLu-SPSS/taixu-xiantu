'use strict';
const performanceLoop=loop;loop=function(...args){return CombatFrameCache.run(()=>performanceLoop(...args));};
for(const [object,key]of [[Economy,'bonuses'],[Economy,'effects'],[TreasureArts,'active']]){const original=object[key];object[key]=function(owner,...args){return CombatFrameCache.read(object===TreasureArts?'active':key,owner,()=>original(owner,...args));};}
const performanceHydrate=economyHydrate;economyHydrate=function(...args){CombatFrameCache.clear();try{return performanceHydrate(...args);}finally{CombatFrameCache.clear();}};
// Floating numbers are cosmetic. Combat damage, healing and control continue unthrottled.
const performanceRise=rise;let performanceFloatStart=0,performanceFloatCount=0;rise=function(...args){const now=performance.now();if(now-performanceFloatStart>=1000){performanceFloatStart=now;performanceFloatCount=0;}if(performanceFloatCount>=24||$('damageLayer').childElementCount>=32)return;performanceFloatCount++;return performanceRise(...args);};
