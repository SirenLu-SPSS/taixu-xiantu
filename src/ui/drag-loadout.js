/* Pointer Events provide one drag model for mouse, pen and touch. */
(()=>{
 'use strict';
 let gesture=null,suppressUntil=0,frame=0;
 const hint=document.createElement('p');hint.className='loadout-drag-help';hint.textContent='按住物品拖到對應欄位裝備／出戰；伙伴互拖交換順序，拖回背包休息。';$('characterSummary').after(hint);
 const live=document.createElement('div');live.className='loadout-drag-live';live.setAttribute('role','status');live.setAttribute('aria-live','polite');live.hidden=true;document.body.append(live);
 function decorate(){
  if(!p||!characterIsOpen())return;
  characterScreen.querySelectorAll('[data-character-slot],[data-economy-slot]').forEach(el=>{const slot=el.dataset.characterSlot||el.dataset.economySlot;el.dataset.dropType='equip';el.dataset.dropSlot=slot;el.dataset.dragId=p.equipment[slot]||'';el.dataset.dragFrom='equip';el.dataset.dragSlot=slot;});
  for(const [type,id]of [['pet','characterPets'],['treasure','characterTreasures']])$(id).querySelectorAll('[data-character-deployed]').forEach((el,index)=>{el.dataset.dropType=type;el.dataset.dropIndex=index;el.dataset.dragId=el.dataset.characterDeployed.split(':')[1]||'';el.dataset.dragFrom='deployed';});
  $('characterItems').querySelectorAll('[data-character-item]').forEach(el=>{const id=el.dataset.characterItem;if(DragLoadout.kind(p,id,ITEMS)){el.dataset.dragId=id;el.dataset.dragFrom='bag';}});
  characterScreen.querySelectorAll('[data-drag-id]').forEach(el=>{el.classList.toggle('loadout-draggable',!!el.dataset.dragId);el.querySelectorAll('img').forEach(img=>img.draggable=false);});
  characterScreen.querySelector('.character-bag').dataset.dropType='bag';
 }
 const render=renderCharacter;renderCharacter=function(){render();decorate();};const bagRender=renderCharacterBag;renderCharacterBag=function(){bagRender();decorate();};
 // Old saves may contain a primary companion which was already put to rest.
 const hydrate=economyHydrate;economyHydrate=function(){hydrate();if(p?.companions)for(const type of ['pet','treasure'])DragLoadout.sync(p,type);};
 const primary=CharacterSystem.primary;CharacterSystem.primary=function(player,type,id){if(id!==null&&!player.companions.deployed.includes(type+':'+id)){const previous=player[type==='pet'?'activePet':'activeTreasure'];if(!primary(player,type,id))return false;if(!Companions.setDeployment(player,type+':'+id,true)){primary(player,type,previous);return false;}return true;}return primary(player,type,id);};
 const deploy=Companions.setDeployment;Companions.setDeployment=function(player,key,on){const ok=deploy(player,key,on);if(ok)DragLoadout.sync(player,key.split(':')[0]);return ok;};
 const clear=Companions.clear;Companions.clear=function(player,type){clear(player,type);for(const t of ['pet','treasure'])DragLoadout.sync(player,t);};
 function targetAt(x,y){const el=document.elementFromPoint(x,y)?.closest('[data-drop-type]');if(!el||!characterScreen.contains(el))return null;return {el,type:el.dataset.dropType,slot:el.dataset.dropSlot,index:el.dataset.dropIndex===undefined?undefined:Number(el.dataset.dropIndex)};}
 function preview(){const g=gesture;if(!g?.drag)return;g.ghost.style.transform=`translate(${g.x-36}px,${g.y-84}px)`;const target=targetAt(g.x,g.y);characterScreen.querySelectorAll('.loadout-drop-hover').forEach(el=>el.classList.remove('loadout-drop-hover'));const result=DragLoadout.allowed(p,g.source,target,ITEMS);g.target=target;live.textContent=result.ok?'松開以'+(target.type==='bag'?'收回背包':target.type==='equip'?'裝備':'出戰／調整順序'):result.reason;live.classList.toggle('invalid',!result.ok);if(result.ok)target.el.classList.add('loadout-drop-hover');}
 function scrollContainer(el,dy){let remaining=dy;for(const box of [el?.closest('.character-items'),characterScreen].filter(Boolean)){const before=box.scrollTop;box.scrollTop+=remaining;remaining-=box.scrollTop-before;if(Math.abs(remaining)<1)break;}}
 function autoscroll(){const g=gesture;if(!g?.drag)return;const hit=document.elementFromPoint(g.x,g.y),box=hit?.closest('.character-items')||characterScreen,r=box.getBoundingClientRect(),edge=55;let dy=0;if(g.y<r.top+edge)dy=-Math.min(16,(r.top+edge-g.y)*.28);else if(g.y>r.bottom-edge)dy=Math.min(16,(g.y-r.bottom+edge)*.28);if(dy){scrollContainer(box,dy);preview();}frame=requestAnimationFrame(autoscroll);}
 function begin(){const g=gesture;if(!g||g.scrolling)return;characterScreen.setPointerCapture(g.pointerId);g.drag=true;g.element.classList.add('loadout-drag-source');g.ghost=g.element.cloneNode(true);g.ghost.removeAttribute('id');g.ghost.className='loadout-drag-ghost';g.ghost.setAttribute('aria-hidden','true');document.body.append(g.ghost);characterScreen.classList.add('loadout-dragging');characterScreen.querySelectorAll('[data-drop-type]').forEach(el=>{const t={type:el.dataset.dropType,slot:el.dataset.dropSlot,index:el.dataset.dropIndex===undefined?undefined:Number(el.dataset.dropIndex)};if(DragLoadout.allowed(p,g.source,t,ITEMS).ok)el.classList.add('loadout-drop-valid');});live.hidden=false;preview();frame=requestAnimationFrame(autoscroll);}
 function cleanup(){const g=gesture;if(!g)return;clearTimeout(g.timer);cancelAnimationFrame(frame);g.ghost?.remove();characterScreen.classList.remove('loadout-dragging');characterScreen.querySelectorAll('.loadout-drag-source,.loadout-drop-valid,.loadout-drop-hover').forEach(el=>el.classList.remove('loadout-drag-source','loadout-drop-valid','loadout-drop-hover'));live.hidden=true;gesture=null;if(characterScreen.hasPointerCapture(g.pointerId))characterScreen.releasePointerCapture(g.pointerId);}
 characterScreen.addEventListener('pointerdown',event=>{
  if(gesture){cleanup();return;}if(event.button!==0||!$('modal').classList.contains('hidden'))return;
  const el=event.target.closest('[data-drag-id]');if(!el?.dataset.dragId)return;
  gesture={pointerId:event.pointerId,element:el,source:{id:el.dataset.dragId,from:el.dataset.dragFrom,slot:el.dataset.dragSlot},x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,lastY:event.clientY,touch:event.pointerType!=='mouse'};
  gesture.timer=setTimeout(begin,gesture.touch?300:160);
 });
 characterScreen.addEventListener('pointermove',event=>{
  const g=gesture;if(!g||g.pointerId!==event.pointerId)return;g.x=event.clientX;g.y=event.clientY;
  if(!g.drag&&Math.hypot(g.x-g.startX,g.y-g.startY)>9){clearTimeout(g.timer);if(g.touch)g.scrolling=true;else begin();}
  if(g.drag){event.preventDefault();preview();}else if(g.scrolling){event.preventDefault();scrollContainer(g.element,g.lastY-g.y);}g.lastY=g.y;
 },{passive:false});
 characterScreen.addEventListener('pointerup',event=>{
  const g=gesture;if(!g||g.pointerId!==event.pointerId)return;const dragged=g.drag,scrolled=g.scrolling;g.x=event.clientX;g.y=event.clientY;const target=dragged?targetAt(g.x,g.y):null;
  if(dragged||scrolled)suppressUntil=performance.now()+650;const source=g.source;cleanup();if(dragged){const result=DragLoadout.apply(p,source,target,ITEMS);if(result.ok)economyFinish(result.message);else note(result.reason);}
 });
 for(const event of ['pointercancel','lostpointercapture'])characterScreen.addEventListener(event,e=>{if(event==='lostpointercapture'&&e.target!==characterScreen)return;if(gesture){suppressUntil=performance.now()+650;cleanup();}});
 characterScreen.addEventListener('click',event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
 characterScreen.addEventListener('contextmenu',event=>{if(event.target.closest('[data-drag-id]'))event.preventDefault();});
 characterScreen.addEventListener('character-bag-swipe-start',cleanup);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')cleanup();});window.addEventListener('blur',cleanup);document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanup();});
})();
