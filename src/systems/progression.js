'use strict';
// Pure progression rules shared by the browser and Node's regression tests.
const Progression = (() => {
  const worldWidth = 1500, worldHeight = 900;
  const landmarks = [
    {id:'spring',name:'靈泉',kind:'spring',x:460,y:260,mark:'泉',desc:'泉水洗塵，恢復氣血與真元。',cooldown:60000},
    {id:'herbs',name:'靈草坡',kind:'herbs',x:740,y:500,mark:'草',desc:'採集靈草，帶回洞府煉丹。',cooldown:45000},
    {id:'ore',name:'玄鐵礦脈',kind:'ore',x:280,y:610,mark:'礦',desc:'尋得靈石與煉器材料。',cooldown:60000},
    {id:'ruins',name:'古修遺跡',kind:'ruins',x:1130,y:425,mark:'秘',desc:'每張地圖可領取一次遺跡傳承。',cooldown:0}
  ];
  function normalize(player) {
    if (!player || player.version !== 2 || !Array.isArray(player.inventory) || !player.equipment) throw Error('存檔格式不相容');
    const result = {...player};
    result.exploration = {...(player.exploration || {}),visited:{...(player.exploration?.visited || {})},cooldowns:{...(player.exploration?.cooldowns || {})},claimed:{...(player.exploration?.claimed || {})}};
    result.estate = {plots:[null,null,null],sect:0,incomeAt:Date.now(),...(player.estate || {})};
    result.estate.plots = Array.from({length:3},(_,i)=>result.estate.plots?.[i] || null);
    result.breakthroughs = player.breakthroughs || 0;
    return result;
  }
  function key(map,id) { return `${map}:${id}`; }
  function landmarkState(player,map,point,now=Date.now()) {
    const id=key(map,point.id);
    if(point.kind==='ruins' && player.exploration.claimed[id]) return {ready:false,seconds:0,claimed:true};
    const until=player.exploration.cooldowns[id] || 0;
    return {ready:until<=now,seconds:Math.max(0,Math.ceil((until-now)/1000)),claimed:false};
  }
  function plant(player,index,now=Date.now()) {
    if(!Number.isInteger(index)||index<0||index>2||player.estate.plots[index]||player.stones<12) return false;
    player.stones-=12; player.estate.plots[index]={plantedAt:now,readyAt:now+90000}; return true;
  }
  function harvest(player,index,now=Date.now()) {
    const plot=player.estate.plots[index];
    if(!plot||plot.readyAt>now) return 0;
    const amount=4+player.estate.sect;
    player.herbs+=amount; player.estate.plots[index]=null; return amount;
  }
  function income(player,now=Date.now()) {
    if(!player.estate.sect) return 0;
    const minutes=Math.floor(Math.min(14400000,Math.max(0,now-player.estate.incomeAt))/60000);
    const gain=minutes*player.estate.sect*3;
    if(minutes){player.stones+=gain;player.estate.incomeAt=now-(Math.max(0,now-player.estate.incomeAt)%60000);}
    return gain;
  }
  function establish(player,now=Date.now()) {
    const cost=180*(player.estate.sect+1);
    if(player.stones<cost||player.estate.sect>=5) return false;
    income(player,now); player.stones-=cost; player.estate.sect++;player.estate.incomeAt=now;return true;
  }
  function canAutoCast(which,mp,hp,maxHp) {
    if(which===0) return true;
    return mp>=[0,14,25,20][which] && (which!==3 || hp<maxHp*.55);
  }
  function effectRadius(time) {return (1-Math.max(0,Math.min(1,time)))*65+20;}
  return {worldWidth,worldHeight,landmarks,normalize,key,landmarkState,plant,harvest,income,establish,canAutoCast,effectRadius};
})();
if(typeof module !== 'undefined') module.exports=Progression;
