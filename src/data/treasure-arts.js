'use strict';
const TreasureArtsData=(()=>{
 const categories=['單體攻擊','範圍攻擊','追蹤連鎖','氣血真元','防禦減傷','綜合神通'];
 const colors=['#ffbd78','#ff886b','#c6a4ff','#80e5bc','#8dd8ff','#f1d17c'];
 const names=[['破甲劍氣','致命一擊','誅魔斬殺','穿心劍訣','雷霆重擊','寒冰刺骨','烈焰焚魂','噬魂一擊','破靈劍意','連環劍斬'],['萬劍分光','九霄雷暴','焚天火雨','玄冰劍陣','五行劍域','星辰隕落','雷霆震盪','旋風劍輪','混沌劍潮','天罡劍雨'],['追魂飛劍','十二劍影','雷霆連鎖','冰魄追魂','幽冥索命','劍靈護主','雷光穿梭','萬劍輪迴','玄門劍陣','星辰追擊'],['生命汲取','靈氣回流','青木回春','聚靈歸元','戰意回春','噬靈奪元','仙靈護命','靈脈共鳴','萬象歸元','不滅生機'],['玄武護盾','劍氣護體','五行抗性','雷霆反震','金身不滅','玄冰護甲','太虛閃避','萬法不侵','仙靈庇護','混元護體'],['劍陣護主','雷火雙劫','冰雷封魂','吞靈劍域','萬劍回春','混沌歸元','天道劍意','九轉劍魂','太虛神域','仙劫降臨']];
 // Every component is executed by the same interpreter; numbers are initial V2.2 tuning.
 const specs=[
 [{pierce:.4},{crit:1},{execute:.15},{pierce:.65,hits:2},{element:'thunder',multiplier:1.8},{element:'frost',slow:.35},{burn:.2},{leech:.12},{drain:.25},{hits:3}],
 [{shots:12,multiplier:.85},{area:150,element:'thunder'},{area:130,zone:5,burn:.12},{area:120,freeze:1.5},{area:145,multiplier:1.2},{area:100,multiplier:2},{area:140,knockback:65},{area:95,zone:4},{area:155,cone:true,hits:3},{area:120,zone:6}],
 [{shots:3,persistent:6},{shots:12,persistent:5},{chain:6,element:'thunder'},{shots:3,freeze:3,controlChance:.25},{shots:4,lowest:true},{shots:3,persistent:6,guard:true},{chain:4,pierce:.35},{shots:4,returns:1},{area:120,zone:8},{shots:5,multiplier:.65}],
 [{leech:.08},{mp:.004},{heal:.006,periodic:true},{mp:.006,periodic:true},{heal:.04,kill:true},{mp:.04,kill:true},{heal:.15,low:true},{heal:.003,mp:.003,periodic:true},{heal:.025,mp:.025},{heal:.005,healing:.15,periodic:true}],
 [{shield:.08},{reduction:.12},{reduction:.1,elemental:true},{reflect:.5},{reduction:.35,duration:2},{slow:.4,reactive:true},{dodge:.18},{resist:.6},{shield:.2,low:true},{reduction:.2,manaScaled:true}],
 [{shots:4,shield:.04},{chain:4,burn:.18},{freeze:2,element:'thunder'},{area:140,mp:.01},{shots:6,heal:.008},{multiplier:1.15,reduction:.08,heal:.015},{crit:.5,pierce:.3},{kill:true,buff:5},{area:130,zone:5,reduction:.15},{area:155,freeze:1,element:'thunder'}]
 ];
 const library=names.flatMap((group,c)=>group.map((name,i)=>{const effect=specs[c][i],min=(c===1&&i===0)||(c===2&&i===1)?3:c===5?2:(i===0?0:i<4?1:i<8?2:3);return {id:'art_'+(c*10+i+1),name,category:c,color:colors[c],minRealm:(c===5&&i>=6)||(c===1&&i>=8)?3:0,qualities:[0,1,2,3,4].filter(q=>q>=min),families:c===0?['sword','general']:c===1?['sword','cauldron','general']:c===2?['sword','orb','general']:c===3?['orb','cauldron','general']:c===4?['shield','orb','general']:['sword','shield','orb','cauldron','general'],effectType:effect.shots?'projectile':effect.zone?'zone':effect.chain?'chain':c===4?'defense':c===3?'recovery':'strike',multiplier:effect.multiplier||.7,chance:c===3||c===4?1:.35,cooldown:c===3&&i===1?.34:effect.periodic?1:effect.low?20:effect.kill?1:effect.shots===12?12:6+(i%4),duration:effect.duration||effect.persistent||effect.zone||4,targets:effect.shots||effect.chain||(effect.area?6:1),range:effect.guard?180:400,assetId:'treasure_art_'+(c*10+i+1),effect};}));
 return {version:1,categories,colors,library,counts:[[0,1],[1,2],[2,4],[4,6],[6,8]],limits:{projectiles:72,zones:12,hitsPerStep:32,events:80,chain:6,freeze:3,bossFreeze:.6,bossImmunity:5,recoveryPerSecond:3}};
})();
if(typeof module!=='undefined')module.exports=TreasureArtsData;
