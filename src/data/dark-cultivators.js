'use strict';
const DarkCultivatorData=(()=>{
 const D=typeof EconomyData!=='undefined'?EconomyData:require('./economy.js');
 const maps=[
  {name:'青雲山',cultivator:'噬血魔修',style:'crimson black mountain demonic swordsman',pet:'blood red spectral wolf',monster:'赤眼妖狼',asset:'creature-wolf',prefix:'血煞'},
  {name:'翠竹幽林',cultivator:'幽竹邪修',style:'dark emerald bamboo forest sinister Taoist',pet:'dark emerald spectral fox',monster:'翠林山精',asset:'creature-treant',prefix:'幽竹'},
  {name:'幽冥黑窟',cultivator:'冥窟毒修',style:'purple black underground poison sorcerer',pet:'purple armored poisonous scorpion',monster:'黑甲魔蠍',asset:'map-scorpion',prefix:'冥毒'},
  {name:'雲夢仙澤',cultivator:'玄澤魔君',style:'indigo jade marsh demonic cultivator with water robes',pet:'large cyan scaled python',monster:'青鱗巨蟒',asset:'map-python',prefix:'玄澤'},
  {name:'萬劍古塚',cultivator:'葬劍邪尊',style:'ivory black ancient sword tomb fallen sword immortal',pet:'silver spectral eagle',monster:'殘念劍靈',asset:'map-sword-spirit',prefix:'葬劍'}
 ];
 const slots=Object.keys(D.slots),legends=[];
 maps.forEach((m,i)=>{for(let j=0;j<6;j++){const id='dark_legend_'+i+'_'+j,type=j<4?'equip':j===4?'treasure':'pet',slot=slots[(i*4+j)%slots.length],suffix=j<4?D.slots[slot]:j===4?'鎮魂寶印':'玄靈妖獸';const t={id,name:m.prefix+suffix,type,...(type==='equip'?{slot}:{}),realm:i<2?1:i,level:4+i,rarity:4,legendOnly:true,darkMap:i,assetId:id,atk:(slot==='weapon'?35:12)+i*12+j*3,def:10+i*7+j,hp:50+i*50+j*12,role:j===5?'攻擊':'輔助',skill:m.prefix+['破魂','護心','聚靈','鎮岳','鎮魂訣','噬影襲'][j],skillPower:1.25+i*.05,skillCooldown:5200+i*200,growth:1.2+i*.05,source:m.name+' · 越階魔修專屬傳說'};D.templates[id]=t;legends.push(t);}});
 return {maps,legends,config:{spawnChance:.025,cooldown:120000,legendChance:.10,goldChance:.25,skillCooldown:6,warning:1.2}};
})();
if(typeof module!=='undefined')module.exports=DarkCultivatorData;
