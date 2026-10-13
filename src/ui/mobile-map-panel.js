/* Presentation only: move the original controls on phones; retain every handler. */
(()=>{
 'use strict';
 const media=window.matchMedia('(max-width:760px)'),key='TAIXU_UI_MOBILE_MAP_EXPANDED_V1';
 const scene=document.querySelector('.scene-top'),journey=document.querySelector('.journey-bar'),encounter=document.querySelector('.encounter-strip'),world=document.querySelector('.world');
 if(!scene||!journey||!encounter||!world)return;
 const nodes=[scene,journey,encounter],anchors=nodes.map(node=>{const marker=document.createComment('mobile-map-original-position');node.before(marker);return marker;});
 const panel=document.createElement('section');panel.className='mobile-map-panel';panel.setAttribute('aria-label','地圖與山海行旅');
 const body=document.createElement('div');body.id='mobileMapPanelBody';body.className='mobile-map-panel-body';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='mobile-map-toggle';toggle.setAttribute('aria-controls',body.id);
 let expanded=false;try{expanded=localStorage.getItem(key)==='true';}catch{}
 function paint(){panel.classList.toggle('is-expanded',expanded);body.hidden=!expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'收合地圖探索面板':'展開地圖探索面板');toggle.title=expanded?'收合行旅與機緣':'展開行旅與機緣';toggle.textContent=expanded?'⌃':'⌄';}
 toggle.onclick=()=>{expanded=!expanded;try{localStorage.setItem(key,String(expanded));}catch{}paint();};
 function arrange(){
  if(media.matches){world.after(panel);panel.append(scene,body);body.append(journey,encounter);scene.append(toggle);paint();}
  else{nodes.forEach((node,i)=>anchors[i].after(node));toggle.remove();panel.remove();body.hidden=false;}
 }
 media.addEventListener('change',arrange);arrange();
})();
