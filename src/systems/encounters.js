'use strict';
const Encounters=(()=>{
 const themes=[
  {id:'ember',name:'赤焰魔境',boss:'焚天炎君',mob:'熔岩魔卒',elite:'赤焰魔將',color:'#eb9068',floor:'#3c2024',accent:'#f76f3d',style:'熔岩裂隙、灰燼與火焰'},
  {id:'frost',name:'霜月雪域',boss:'霜月女王',mob:'霜雪妖狼',elite:'寒霜禁衛',color:'#c4ecff',floor:'#254253',accent:'#86dfff',style:'冰晶、飄雪與霜月'},
  {id:'grove',name:'幽夢妖林',boss:'萬木妖皇',mob:'幽夢木靈',elite:'荊棘樹將',color:'#b9db8c',floor:'#173c32',accent:'#95dc91',style:'古樹、螢光與靈藤'},
  {id:'sand',name:'黃沙古國',boss:'黃沙古王',mob:'沙海亡卒',elite:'古國守衛',color:'#edd392',floor:'#4c3d28',accent:'#f6c974',style:'沙丘、石柱與古老封印'},
  {id:'void',name:'星隕虛空',boss:'星隕界主',mob:'裂隙星靈',elite:'虛空執刑者',color:'#d1baff',floor:'#22243f',accent:'#b798ff',style:'星海、浮島與虛空法陣'}
 ];
 const quests=[{kind:'kill',name:'斬妖護道',target:12,reward:130,desc:'接取後累積擊敗 12 隻妖獸'}, {kind:'collect',item:'herb',name:'靈草救急',target:15,reward:160,desc:'繳交靈幽草 15 株'}, {kind:'collect',item:'fang',name:'煉器之託',target:10,reward:190,desc:'繳交妖獸獠牙 10 件'}, {kind:'collect',item:'wood',name:'修補山門',target:12,reward:150,desc:'繳交靈木 12 件'}];
 function normalize(p){const old=p.encounters||{};p.encounters={...old,until:Math.max(0,Number(old.until)||30),sequence:old.sequence||0,completed:old.completed||0,clears:old.clears||{},quests:Array.isArray(old.quests)?old.quests:[],pending:old.pending||null};return p.encounters}
 function advance(p,dt,random=Math.random){const s=p.encounters;if(s.pending||p.rift)return false;s.until-=Math.max(0,dt);if(s.until>0)return false;s.sequence++;const isRift=random()<.45;const index=Math.floor(random()*(isRift?themes.length:quests.length));s.pending={id:s.sequence,kind:isRift?'rift':'quest',index,x:Math.max(70,Math.min(1430,p.position.x+100)),y:Math.max(80,Math.min(820,p.position.y+65))};s.until=120+random()*90;return true}
 function accept(p){const s=p.encounters,e=s.pending;if(!e||e.kind!=='quest'||s.quests.length>=3)return false;const spec=quests[e.index];if(!spec)return false;s.quests.push({...spec,id:e.id,baseline:p.killCount||0});s.pending=null;return true}
 function progress(p,q){return q.kind==='kill'?Math.max(0,(p.killCount||0)-q.baseline):(p.inventory.find(i=>i.id===q.item)?.count||0)}
 function claim(p,id,take){const s=p.encounters,q=s.quests.find(q=>q.id===id);if(!q||progress(p,q)<q.target)return false;if(q.kind==='collect'&&!take(q.item,q.target))return false;p.stones+=q.reward;p.jade+=1;s.completed++;s.quests=s.quests.filter(q=>q.id!==id);return true}
 function wave(themeIndex,wave,base){const theme=themes[themeIndex];if(!theme||!Number.isInteger(wave)||wave<1||wave>10)throw Error('Invalid rift wave');const factor=1+(wave-1)*.3,count=wave===10?3:3+Math.floor(wave/2),elites=wave>=5?Math.min(count-1,wave-3):0;return Array.from({length:count},(_,i)=>{const boss=wave===10&&i===0,elite=!boss&&i<(wave===10?3:elites);const hp=Math.round(Math.max(60,base.atk*2.1)*factor*(boss?10:elite?2:1));return {id:wave+'-'+i,rift:true,boss,elite,name:boss?theme.boss:elite?theme.elite:theme.mob,hp,maxHp:hp,atk:boss?Math.round(base.combat*1.5):Math.round(Math.max(4,base.atk*.16)*factor*(elite?1.3:1)),def:Math.round(base.def*.15*factor),stone:0,qi:0,cd:2,roam:0,vx:0,vy:0,hit:0,skillIn:boss?3:elite?4+i*.5:0,transformed:false,x:820+(i%3)*115,y:230+Math.floor(i/3)*120}})}
 function transform(e){if(!e.boss||e.transformed||e.hp<=0||e.hp/e.maxHp>=.2)return false;e.transformed=true;e.atk=Math.round(e.atk*1.35);e.skillIn=Math.min(e.skillIn,1);return true}
 function waveReward(base,wave){return Math.round(25+base.combat*.08*wave)}
 return {themes,quests,normalize,advance,accept,progress,claim,wave,transform,waveReward};
})();
if(typeof module!=='undefined')module.exports=Encounters;
