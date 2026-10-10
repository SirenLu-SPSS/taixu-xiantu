'use strict';
// Pure progression rules shared by the browser and Node's regression tests.
const Progression = (() => {
  const bags=typeof CharacterSystem!=='undefined'?CharacterSystem:typeof require!=='undefined'?require('./character.js'):null;
  const worldWidth = 1500, worldHeight = 900;
  const landmarks = [
    {id:'spring',name:'靈泉',kind:'spring',x:460,y:260,mark:'泉',desc:'泉水洗塵，恢復氣血與真元。',cooldown:60000},
    {id:'herbs',name:'靈草坡',kind:'herbs',x:740,y:500,mark:'草',desc:'採集靈草，帶回洞府煉丹。',cooldown:45000},
    {id:'ore',name:'玄鐵礦脈',kind:'ore',x:280,y:610,mark:'礦',desc:'尋得靈石與煉器材料。',cooldown:60000},
    {id:'ruins',name:'古修遺跡',kind:'ruins',x:1130,y:425,mark:'秘',desc:'每張地圖可領取一次遺跡傳承。',cooldown:0}
  ];
  function normalize(player) {
    if (!player || player.version !== 2 || !Array.isArray(player.inventory) || !player.equipment) throw Error('存檔格式不相容');
    const result = {...player,inventory:player.inventory.map(entry=>({...entry}))};
    if(!player.materialsInBag){const herb=result.inventory.find(entry=>entry.id==='herb');const total=Math.max(herb?.count||0,player.herbs||0);if(herb)herb.count=total;else if(total>0)result.inventory.push({id:'herb',count:total});result.materialsInBag=true;}
    result.herbs=result.inventory.find(entry=>entry.id==='herb')?.count||0;
    result.autoGather=player.autoGather!==false;
    result.exploration = {...(player.exploration || {}),visited:{...(player.exploration?.visited || {})},cooldowns:{...(player.exploration?.cooldowns || {})},claimed:{...(player.exploration?.claimed || {})}};
    result.estate = {plots:[null,null,null],sect:0,incomeAt:Date.now(),...(player.estate || {})};
    result.estate.plots = Array.from({length:3},(_,i)=>result.estate.plots?.[i] || null);
    result.breakthroughs = player.breakthroughs || 0;
    if(bags)bags.normalize(result);return result;
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
    if(!addItem(player,'herb',amount))return 0; player.estate.plots[index]=null; return amount;
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

  function canStore(player,id,catalog=typeof ITEMS!=='undefined'?ITEMS:{}){return bags?bags.canStore(player,id,catalog):player.inventory.some(entry=>entry.id===id)||player.inventory.length<40;}
  function addItem(player,id,amount=1,catalog){
    if(!Number.isSafeInteger(amount)||amount<1||!canStore(player,id,catalog))return false;
    const entry=player.inventory.find(item=>item.id===id);
    if(entry){if(!Number.isSafeInteger(entry.count+amount))return false;entry.count+=amount;}else player.inventory.push({id,count:amount});
    if(id==='herb')player.herbs=player.inventory.find(item=>item.id==='herb').count;
    return true;
  }
  function takeItem(player,id,amount=1){
    const entry=player.inventory.find(item=>item.id===id);
    if(!Number.isSafeInteger(amount)||amount<1||!entry||entry.count<amount)return false;
    entry.count-=amount;if(entry.count===0)player.inventory.splice(player.inventory.indexOf(entry),1);
    if(id==='herb')player.herbs=player.inventory.find(item=>item.id==='herb')?.count||0;
    return true;
  }
  function sellItem(player,id,amount,price){
    if(player.bag?.locked?.[id]||player.economy?.instances[id]?.locked)return {ok:false};
    const gain=amount*price;
    if(!Number.isSafeInteger(price)||price<1||!Number.isSafeInteger(gain)||!Number.isSafeInteger(player.stones+gain))return {ok:false};
    if(!takeItem(player,id,amount))return {ok:false};
    player.stones+=gain;return {ok:true,amount,gain};
  }
  function buySupply(player,id,amount){
    const price={forgeDust:30,pill:24,heal:32,trib:180}[id];
    if(!price||!Number.isSafeInteger(amount)||amount<1||amount>100)return {ok:false,reason:'quantity'};
    const cost=price*amount;
    if(player.stones<cost)return {ok:false,reason:'funds'};
    if(!addItem(player,id,amount))return {ok:false,reason:'full'};
    player.stones-=cost;return {ok:true,cost,amount};
  }
  function collectLandmark(player,map,point,maxVitals,now=Date.now()){
    if(!landmarkState(player,map,point,now).ready)return {ok:false,reason:'cooldown'};
    const result={ok:true,kind:point.kind,stones:0};
    if(point.kind==='herbs'){if(!addItem(player,'herb',3))return {ok:false,reason:'full'};result.herbs=3;}
    else if(point.kind==='ore'){if(!addItem(player,'wood',2))return {ok:false,reason:'full'};result.wood=2;result.stones=25*(map+1);player.stones+=result.stones;}
    else if(point.kind==='ruins'){result.stones=60*(map+1);player.stones+=result.stones;player.jade+=5;player.exploration.claimed[key(map,point.id)]=true;}
    else if(point.kind==='spring'){player.hp=maxVitals.hp;player.mp=maxVitals.mp;}
    else return {ok:false,reason:'unknown'};
    player.exploration.cooldowns[key(map,point.id)]=now+point.cooldown;
    return result;
  }
  function canAutoCast(which,mp,hp,maxHp) {
    if(which===0) return true;
    return mp>=[0,14,25,20][which] && (which!==3 || hp<maxHp*.55);
  }
  function effectRadius(time) {return (1-Math.max(0,Math.min(1,time)))*65+20;}
  function manaMax(realm,stage=0){const bases=[75,180,360,720,1400,2800,5600,10000,18000];const r=Math.max(0,Math.min(8,Math.floor(Number(realm)||0))),s=Math.max(0,Math.min(r===0?8:r===8?0:3,Math.floor(Number(stage)||0)));return Math.round(bases[r]*(1+s*.08));}
  function manaRecovery(max,meditating=false){return meditating?Math.max(12,max*.04):Math.max(3.5,max*.003);}
  return {worldWidth,worldHeight,landmarks,normalize,key,landmarkState,plant,harvest,income,establish,canAutoCast,effectRadius,canStore,addItem,takeItem,sellItem,buySupply,collectLandmark,manaMax,manaRecovery};
})();
if(typeof module !== 'undefined') module.exports=Progression;
