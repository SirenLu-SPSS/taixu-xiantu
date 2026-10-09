'use strict';
// Shared definitions: future enemy skills can use the same radius, multiplier and cooldown fields.
const ForgeAffixes=(()=>{
 const curves=[[[0,1],[5,.9],[10,.75]],[[0,1],[10,.95],[20,.85],[30,.7]],[[0,1],[20,.94],[35,.82],[50,.7]],[[0,1],[20,.96],[40,.88],[60,.77],[80,.65]],[[0,1],[10,.97],[30,.9],[60,.78],[100,.6],[130,.55],[160,.5],[200,.45]]];
 const milestones={3:[20,40,60,80],4:[30,60,100,130,160,200]};
 const library=[
 {id:'adamant',name:'玄甲護體',qualities:[3,4],kind:'stat',key:'def',value:45},
 {id:'vitality',name:'長生真血',qualities:[3,4],kind:'stat',key:'hp',value:280},
 {id:'edge',name:'破軍劍意',qualities:[3,4],kind:'stat',key:'atk',value:35},
 {id:'pierce',name:'洞虛破甲',qualities:[3,4],kind:'stat',key:'penetration',value:.06},
 {id:'ward',name:'御雷金身',qualities:[3,4],kind:'stat',key:'reduction',value:.05},
 {id:'recovery',name:'回春仙息',qualities:[3,4],kind:'stat',key:'regenHp',value:1.5},
 {id:'sword-ring',name:'太虛環斬',qualities:[3,4],kind:'skill',radius:110,maxTargets:3,multiplier:.18,cooldown:6000,visual:'sword',actors:['player','enemy']},
 {id:'celestial-fire',name:'九霄焚天',qualities:[4],kind:'skill',radius:140,maxTargets:3,multiplier:.25,cooldown:8000,visual:'fire',actors:['player','enemy']},
 {id:'immortal',name:'不滅仙軀',qualities:[4],kind:'stat',key:'hp',value:480},
 {id:'heaven-edge',name:'誅仙鋒芒',qualities:[4],kind:'stat',key:'damage',value:.08},
 {id:'spirit',name:'天元靈泉',qualities:[4],kind:'stat',key:'regenMp',value:1.2},
 {id:'insight',name:'悟道仙心',qualities:[4],kind:'stat',key:'qi',value:.5}
 ];
 function chance(q,level){const points=curves[q]||curves[0];for(let i=1;i<points.length;i++){const [x,y]=points[i],a=points[i-1];if(level<=x)return a[1]+(y-a[1])*Math.max(0,level-a[0])/(x-a[0]);}return points.at(-1)[1];}
 function gemBoost(g){return g?.type==='gem'?([0,.03,.05,.08,.12,.17,.22][g.tier]||0)+Math.max(0,g.rarity||0)*.01:0;}
 function unlock(item){const levels=milestones[item.quality]||[];if(!levels.some(level=>item.enhancement>=level))return [];item.forgeAffixes=item.forgeAffixes||[];const added=[];for(const level of levels){if(item.enhancement<level||item.forgeAffixes.some(a=>a.milestone===level))continue;const pool=library.filter(a=>a.qualities.includes(item.quality)&&!item.forgeAffixes.some(b=>a.id===b.id));if(!pool.length)break;let hash=0;for(const c of item.id+':'+level)hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;const entry={id:pool[hash%pool.length].id,milestone:level};item.forgeAffixes.push(entry);added.push(entry);}return added;}
 function entries(item){return (item.forgeAffixes||[]).map(a=>{const d=library.find(b=>b.id===a.id);return d&&{...d,milestone:a.milestone};}).filter(Boolean);}
 function proc(items,origin,targets,now,cooldowns,hit,damage){let count=0;for(const item of items)for(const skill of entries(item).filter(a=>a.kind==='skill')){if(count>=3)return count;const key=item.id+':'+skill.id;if(now<(cooldowns[key]||0))continue;const victims=targets.filter(t=>t!==origin&&t.hp>0&&Math.hypot(t.x-origin.x,t.y-origin.y)<=skill.radius).slice(0,Math.min(skill.maxTargets,3-count));if(!victims.length)continue;cooldowns[key]=now+skill.cooldown;for(const t of victims){hit(t,damage*skill.multiplier);count++;}}return count;}
 return {curves,milestones,library,chance,gemBoost,unlock,entries,proc};
})();
if(typeof module!=='undefined')module.exports=ForgeAffixes;
