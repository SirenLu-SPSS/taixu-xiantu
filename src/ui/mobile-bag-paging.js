'use strict';
(()=>{
 const phone=matchMedia('(max-width:760px)'),bag=$('characterItems');
 phone.addEventListener("change",()=>{if(characterIsOpen())renderCharacterBag();});
 let gesture=null,suppressUntil=0;
 characterScreen.addEventListener('pointerdown',e=>{
  if(!phone.matches||e.pointerType==='mouse'||!bag.contains(e.target)||!$('modal').classList.contains('hidden'))return;
  if(gesture){gesture=null;return;}
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),page:characterPage,category:characterCategory,swipe:false};
 },true);
 characterScreen.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||g.id!==e.pointerId)return;
  if(characterScreen.classList.contains('loadout-dragging')){gesture=null;return;}
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.swipe&&Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}
  if(!g.swipe&&Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)*1.4){g.swipe=true;characterScreen.dispatchEvent(new Event('character-bag-swipe-start'));}
  if(g.swipe){e.preventDefault();e.stopImmediatePropagation();}
 },{capture:true,passive:false});
 characterScreen.addEventListener('pointerup',e=>{
  const g=gesture;if(!g||g.id!==e.pointerId)return;gesture=null;
  if(!g.swipe)return;
  e.preventDefault();e.stopImmediatePropagation();suppressUntil=performance.now()+650;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4||performance.now()-g.time>800||g.page!==characterPage||g.category!==characterCategory)return;
  const button=$(dx<0?'characterNext':'characterPrevious');if(button.disabled)return;
  button.onclick();bag.scrollTop=0;bag.setAttribute('aria-label','背包物品 · 第 '+(characterPage+1)+' 頁');
 },true);
 characterScreen.addEventListener('pointercancel',()=>{gesture=null;},true);
 characterScreen.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{gesture=null;});
})();
