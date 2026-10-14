/* Desktop presentation only. All mutations use the existing companion/detail UI. */
(()=>{
 'use strict';
 const wide=matchMedia('(min-width: 1024px)'),view=document.createElement('section');
 view.id='desktopTreasure';view.hidden=true;view.setAttribute('aria-label','法寶管理');document.body.append(view);
 let selected=null,filter='all',sortIndex=0,detail='stats',signature='';
 const esc=escapeHTML;
 function navIcon(id){const paths={character:'M8 20v-3a4 4 0 0 1 8 0v3M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 20v-4m16 4v-4',inventory:'M7 7 5 3h14l-2 4M6 8h12l3 12H3L6 8Zm3 4h6m-3-3v7',skills:'m12 2 10 10-10 10L2 12 12 2Zm-4 7h8v6H8V9Zm2 3h4',treasures:'M12 2v13m-4-4 4 4 4-4M5 7c-7 12 21 12 14 0M8 22h8',pets:'m4 4 4 3 4-4 4 4 4-3-1 12-7 6-7-6L4 4Zm3 7h2m6 0h2m-7 5h4',equipment:'m3 3 15 15m3-15L6 18M3 16l5 5m8-18 5 5M3 3l1 6 5-5M21 3l-1 6-5-5',abode:'M9 2h6m-3 0v4m-7 5a8 8 0 1 0 14 0 8 8 0 0 0-14 0m7-3v6l3 2',forge:'m3 3 7 7m4 4 7 7M3 21l12-12m-3-6 4 1 5 5-4 4-5-5V3Z',sect:'m2 10 10-8 10 8H2Zm2 0v12m16-12v12M8 22V12h8v10M2 22h20',dungeons:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 7 7M10 6v8m-4-4h8',rift:'M12 2v20M2 12h20m-15-7 10 14m0-14L7 19',shop:'M3 8h18l-2-5H5L3 8Zm1 0v13h16V8M9 21v-7h6v7M2 8v3h20V8'};return '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[id]+'"/></svg>';}
 function entries(){return (p?.ownedTreasures||[]).map(id=>{const item=p.economy?.instances[id]||p.economy?.legacy[id],meta=TREASURES.find(t=>t.id===id),template=EconomyData.templates[item?.baseId]||item?.template||meta;return {id,item,meta,template};}).filter(e=>e.template);}
 const level=e=>e.item?.fusionLevel||e.item?.level||1;
 const quality=e=>e.item?.quality??e.meta?.rarity??0;
 const art=e=>characterIcon(e.id,true);
 function showcaseArt(e){return TreasureShowcase.asset(e.item?.baseId||e.id);}
 function sortValues(e){return [e.item?equipmentItemPower(e.item):Math.round((e.meta?.atk||0)*3+(e.meta?.def||0)*2+(e.meta?.hp||0)*.4),e.item?.realm??e.template.realm??0,quality(e),level(e)];}
 function sortEntries(a,b){const av=sortValues(a),bv=sortValues(b);return bv[sortIndex]-av[sortIndex]||bv[0]-av[0]||bv[1]-av[1]||bv[2]-av[2]||bv[3]-av[3]||a.id.localeCompare(b.id);}
 function matches(e){if(filter==='all')return true;const fx=e.item?Economy.effects(e.item):e.meta||{};return filter==='attack'?(fx.atk||0)>0:filter==='defense'?(fx.def||0)>0:!!e.item?.specialArts?.length;}
 function show(){if(!p||tab!=='treasures'||!wide.matches){view.hidden=true;return;}view.hidden=false;render();}
 function render(){
  const all=entries().sort(sortEntries),list=all.filter(matches);
  if(!list.some(e=>e.id===selected))selected=list.find(e=>e.id===p.activeTreasure)?.id||list[0]?.id;
  const current=list.find(e=>e.id===selected),deployed=Companions.deployedKeys(p).filter(k=>k.startsWith('treasure:')),cap=Companions.capacity(p),s=stats();
  const thumb=e=>'<img src="'+(showcaseArt(e)||art(e))+'" alt="" loading="lazy">';
  const nav=[['character','♙','角色'],['inventory','▣','背包'],['skills','◇','技能'],['treasures','♆','法寶'],['pets','♧','靈寵'],['equipment','⚔','裝備'],['abode','◴','煉丹'],['forge','⚒','鍛造'],['sect','♜','宗門'],['dungeons','⌕','探索'],['rift','✧','異界'],['shop','▱','商店']];
  view.innerHTML='<header class="dt-header"><div><strong>太虛仙途</strong><span>法寶介面</span></div><button data-dt="exit" class="btn line">返回探索</button></header><div class="dt-player"><div><b>'+esc(p.name)+'</b><small>'+esc(REALMS[p.realm].name)+' · '+(p.stage+1)+' 層</small></div><span>戰力 <b title="'+fmt(s.combat)+'">'+ResourceDisplay.format(s.combat)+'</b></span><span>靈石 <b title="'+fmt(p.stones)+'">'+ResourceDisplay.format(p.stones)+'</b></span><span>仙玉 <b title="'+fmt(p.jade)+'">'+ResourceDisplay.format(p.jade)+'</b></span><button data-dt="settings" class="btn line" aria-label="設定">⚙</button></div><div class="dt-layout"><nav class="dt-nav" aria-label="仙途導覽">'+nav.map(([id,icon,label])=>'<button data-dt-nav="'+id+'" class="'+(id==='treasures'?'active':'')+'"><i>'+icon+'</i>'+label+'</button>').join('')+'</nav><aside class="dt-list"><h2>法寶列表 <small>'+all.length+' 件</small></h2><div class="dt-filters">'+[['all','全部'],['attack','攻擊'],['defense','防禦']].map(([id,label])=>'<button data-dt-filter="'+id+'" aria-pressed="'+(filter===id)+'">'+label+'</button>').join('')+'<button data-dt-sort title="排序：'+['戰力','境界','品階','等級'][sortIndex]+'由高到低；點擊切換" aria-label="排序：'+['戰力','境界','品階','等級'][sortIndex]+'，切換下一種排序">排序<small>'+['戰力','境界','品階','等級'][sortIndex]+' ↓</small></button></div><div class="dt-items">'+list.map(e=>'<button data-dt-item="'+esc(e.id)+'" data-quality="'+quality(e)+'" class="'+(selected===e.id?'selected':'')+'">'+thumb(e)+'<span><b>'+esc(e.template.name)+'</b><small>'+characterQuality(quality(e))+' · Lv.'+level(e)+' · +'+(e.item?.enhancement||0)+'</small><em>'+((deployed.includes('treasure:'+e.id)?'出戰中': '休息中')+(p.activeTreasure===e.id?' · 本命':''))+'</em></span></button>').join('')+'</div></aside><main class="dt-main">'+(current?content(current):'<div class="dt-empty"><h2>尚無符合條件的法寶</h2><p>可從探索、掉落及商店取得法寶。</p></div>')+'<section class="dt-roster"><h3>已出戰法寶（'+deployed.length+'/'+cap+'）<button data-dt="formation" class="btn line small">編隊排序</button></h3><div>'+Array.from({length:8},(_,i)=>{const e=all.find(e=>'treasure:'+e.id===deployed[i]);return '<button '+(e?'data-dt-item="'+esc(e.id)+'"':'disabled')+' aria-label="'+(e?esc(e.template.name):i>=cap?'境界未解鎖':'空出戰欄')+'"><small>'+(i+1)+'</small>'+(e?thumb(e)+'<span>Lv.'+level(e)+'</span>':'<span>'+(i>=cap?'未解鎖':'空位')+'</span>')+'</button>';}).join('')+'</div></section></main></div>';
  view.querySelectorAll('[data-dt-item]').forEach(b=>b.onclick=()=>{selected=b.dataset.dtItem;render();});
  view.querySelector('[data-dt-sort]').onclick=()=>{sortIndex=(sortIndex+1)%4;render();};
  view.querySelectorAll('[data-dt-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.dtFilter;render();});
  view.querySelectorAll('[data-dt-detail]').forEach(b=>b.onclick=()=>{detail=b.dataset.dtDetail;render();});
  view.querySelectorAll('[data-dt-nav]').forEach(b=>{b.querySelector('i').innerHTML=navIcon(b.dataset.dtNav);b.onclick=()=>navigate(b.dataset.dtNav);});
  view.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>action(b.dataset.dt,current));
 }
 function content(e){
  const it=e.item,fx=it?Economy.effects(it):e.meta||{},arts=(it?.specialArts||[]).map(id=>TreasureArts.byId.get(id)).filter(Boolean);
  const rows=Object.entries(fx).filter(([,v])=>typeof v==='number'&&v!==0).map(([k,v])=>'<div><span>'+esc(economyEffectName(k))+'</span><b>'+Number(v.toFixed(3)).toLocaleString()+'</b></div>').join('');
  let info=detail==='stats'?'<div class="dt-stats">'+(rows||'<p>尚無額外屬性</p>')+'</div><p>'+esc(e.template.skill||e.meta?.desc||e.template.source||'')+'</p>':detail==='arts'?'<div class="dt-arts">'+(arts.map(treasureArtRow).join('')||'<p>此法寶尚無附加神通。</p>')+'</div>':'<div class="dt-gems">'+(it?.sockets||[]).map((id,i)=>'<div><span>孔 '+(i+1)+'</span>'+(id?'<img src="'+economyIcon(id)+'" alt="">'+esc(EconomyData.templates[id]?.name||id):'空孔')+'</div>').join('')+'</div>'+(it?companionGemSynergy(it):'<p>此法寶無寶石孔位。</p>');
  return '<section class="dt-detail"><div class="dt-showcase pet-showcase"><h2>'+esc(e.template.name)+'</h2><p>'+characterQuality(quality(e))+' · Lv.'+level(e)+' · 強化 +'+(it?.enhancement||0)+'</p><img class="dt-large-art '+(showcaseArt(e)?'dt-illustrated':'')+'" src="'+(showcaseArt(e)||art(e))+'" alt="'+esc(e.template.name)+'"><div class="pet-aura" aria-hidden="true"></div><div class="pet-sparks" aria-hidden="true"></div><div class="dt-power">'+(it?'戰力 '+equipmentItemPower(it).toLocaleString():'傳承法寶')+'</div></div><div class="dt-info"><div class="dt-tabs">'+[['stats','基礎屬性'],['arts','法寶神通'],['gems','寶石聯動']].map(([id,label])=>'<button data-dt-detail="'+id+'" aria-pressed="'+(detail===id)+'">'+label+'</button>').join('')+'</div><div class="dt-info-body">'+info+'</div><div class="dt-actions"><button class="btn gold" data-dt="detail">詳情／操作</button><button class="btn line" data-dt="deploy">'+(p.companions.deployed.includes('treasure:'+e.id)?'休息':'出戰')+'</button><button class="btn line" data-dt="forge">鍛造</button><button class="btn line" data-dt="gems">配石</button><button class="btn line" data-dt="inherit">傳承</button><button class="btn line" data-dt="merge">合成</button></div></div></section>';
 }
 function action(id,e){if(id==='exit'){view.hidden=true;chooseTab('realm');document.querySelector('[data-view="explore"]')?.click();return;}if(id==='settings')return $('settings').click();if(id==='formation')return showCompanionFormation();if(!e)return;
  if(id==='deploy'){toggleCompanion('treasure:'+e.id);render();return;}
  if(id==='detail'||!e.item||!p.economy.instances[e.id])return showCharacterUnit('treasure:'+e.id);
  equipmentReturnId=e.id;
  if(id==='forge')return economyForge(e.id);
  if(id==='gems')return showCompanionAutoGems(e.id);
  if(id==='inherit')return showTreasureInheritance(e.id);
  if(id==='merge')return showTreasurePromotion(e.id);
 }
 function navigate(id){if(id==='treasures')return;if(id==='shop')return showCharacterShop();if(id==='rift')return encounterJournal();if(id==='forge'){if(selected)action('forge',entries().find(e=>e.id===selected));return;}const target={character:'character',sect:'abode'}[id]||id;view.hidden=true;chooseTab(target);document.querySelector('[data-view="manage"]')?.click();}
 const original=renderCurrent;renderCurrent=function(){original();show();};
 const choose=chooseTab;chooseTab=function(id){if(id==='treasures'&&wide.matches&&p){if(riftRunning){note('退出異界後可管理養成');return;}keys.clear();moveTouch=null;tab=id;renderCurrent();return;}view.hidden=true;return choose(id);};
 const characterOpen=characterIsOpen;characterIsOpen=function(){return !view.hidden||characterOpen();};
 const title=startTitle;startTitle=function(){view.hidden=true;title();};
 wide.addEventListener('change',show);
 new MutationObserver(()=>{if(!view.hidden&&$('modal').classList.contains('hidden'))render();}).observe($('modal'),{attributes:true,attributeFilter:['class']});
 // Avoid rebuilding the large showcase on every combat-frame UI refresh.
 const ui=renderUI;renderUI=function(){ui();if(!view.hidden){const next=[p.stones,p.jade,p.activeTreasure,Companions.deployedKeys(p).join(',')].join('|');if(signature!==next){signature=next;render();}}};
})();
