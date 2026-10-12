'use strict';
function equipmentItemPower(item){const fx=Economy.effects(item);return Math.round((fx.atk||0)*3+(fx.def||0)*2+(fx.hp||0)*.4+(fx.crit||0)*100);}
let equipmentReturnId=null;
function equipmentSocketSummary(item){
 const effects={};for(const id of item.sockets||[])for(const [key,value]of Object.entries(EconomyData.templates[id]?.effects||{}))effects[key]=(effects[key]||0)+value;
 return Object.entries(effects).map(([key,value])=>economyEffectName(key)+' +'+Number(value.toFixed(4))).join(' · ')||'尚未鑲嵌寶石';
}
function equipmentBonusRows(item){const parts=equipmentSocketSummary(item).split(' · '),middle=Math.ceil(parts.length/2);return [parts.slice(0,middle),parts.slice(middle)].filter(row=>row.length).map(row=>'<span>'+escapeHTML(row.join(' · '))+'</span>').join('');}
const equipmentDetailDescription=economyDescription;
economyDescription=function(item){
 const template=EconomyData.templates[item.baseId]||item.template;if(template?.type!=='equip')return equipmentDetailDescription(item);
 TreasureArts.ensure(item);const fx=Economy.effects(item),quality=['white','blue','purple','gold','legend'][item.quality]||'white';
 return '<section class="equipment-detail"><header><div class="equipment-detail-portrait" data-quality="'+quality+'"><img src="'+characterIcon(item.id)+'" alt="'+escapeHTML(template.name)+'"><strong class="equipment-item-power">戰力 '+equipmentItemPower(item).toLocaleString()+'</strong></div><p>'+characterQuality(item.quality)+' · 等級 '+item.level+' · 強化 +'+item.enhancement+' · 需求 '+REALMS[item.realm].name+'</p><p>攻擊 '+Math.round(fx.atk||0)+' · 防禦 '+Math.round(fx.def||0)+' · 氣血 '+Math.round(fx.hp||0)+'</p><p>'+item.affixes.map(a=>escapeHTML(a.name)+' +'+Number(a.value.toFixed(3))).join(' · ')+'</p></header><div class="equipment-socket-row" aria-label="寶石孔位">'+item.sockets.map((id,i)=>'<span class="equipment-socket" title="孔 '+(i+1)+'：'+escapeHTML(EconomyData.templates[id]?.name||'空孔')+'">'+(id?'<img src="'+economyAsset(id)+'" alt="'+escapeHTML(EconomyData.templates[id]?.name||id)+'">':'<span aria-label="空孔">◇</span>')+'</span>').join('')+'</div><p class="equipment-gem-bonuses">'+equipmentBonusRows(item)+'</p><section class="treasure-art-detail"><h3>裝備部位神通 · '+item.specialArts.length+' 條</h3>'+item.specialArts.map(id=>TreasureArts.byId.get(id)).filter(Boolean).map(treasureArtRow).join('')+'</section></section>';
};
const equipmentDetailModal=modal;
modal=function(...args){$('modal').classList.remove('equipment-detail-modal');delete $('modal').dataset.equipmentId;const result=equipmentDetailModal(...args);if(equipmentReturnId&&p.economy?.instances[equipmentReturnId]&&!p.economy.instances[equipmentReturnId].dismantled){const id=equipmentReturnId,back=document.createElement('button');back.className='btn line';back.textContent='← 返回裝備詳情';back.dataset.equipmentReturn='true';back.onclick=()=>{equipmentReturnId=null;showItem(id);};$('modalActions').prepend(back);}return result;};
const equipmentDetailItem=economyItem;
economyItem=function(id){
 equipmentReturnId=null;equipmentDetailItem(id);const item=p.economy?.instances[id],template=EconomyData.templates[item?.baseId]||item?.template;if(template?.type!=='equip')return;
 $('modal').classList.add('equipment-detail-modal');$('modal').dataset.equipmentId=id;
 const equipped=p.equipment[template.slot]===id;
 for(const button of $('modalActions').querySelectorAll('button'))if(['已穿戴','穿戴'].includes(button.textContent)){
  button.textContent=equipped?'已裝備／卸下':'裝備';if(equipped)button.onclick=()=>{if(!CharacterSystem.unequip(p,template.slot,ITEMS))return note('裝備背包已滿，無法卸下');finishCharacterMutation('已卸下 '+template.name);};
 }
 const button=document.createElement('button');button.className='btn line';button.textContent='裝備傳承';button.disabled=BagTools.locked(p,id);button.onclick=()=>showTypedInheritance('equip',id);$('modalActions').append(button);
 decorateEquipmentActions();
};
const equipmentDetailSlot=showCharacterSlot;
showCharacterSlot=function(slot){const id=p.equipment[slot];if(p.economy?.instances[id])return showItem(id);return equipmentDetailSlot(slot);};
function equipmentActionIcon(label){if(label==='解鎖物品')return 'unlock';if(label==='鎖定物品')return 'lock';if(label.startsWith('出售'))return 'sell';if(label==='拆解')return 'dismantle';if(label==='已裝備／卸下')return 'equipped';if(label==='裝備')return 'equip';if(label==='關閉')return 'close';if(label==='裝備傳承')return 'inherit';if(label.includes('鍛造'))return 'forge';return null;}
function equipmentActionLabel(icon){return {lock:'鎖定',unlock:'解鎖',sell:'出售',dismantle:'拆解',equipped:'卸下',equip:'裝備',close:'關閉',inherit:'傳承',forge:'鍛造'}[icon];}
function equipmentActionGlyph(icon){
 const paths={lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/>',unlock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 017-2M12 14v3"/>',sell:'<circle cx="12" cy="12" r="9"/><path d="M12 6v12M16 8h-6a2 2 0 000 4h4a2 2 0 010 4H8"/>',dismantle:'<path d="M5 3l4 4-2 2-4-4v5l4 3 3-1 9 9 2-2-9-9 1-3-3-4zM4 20l5-5M15 8l5-5"/>',equipped:'<path d="M8 3l4 3 4-3 5 5-4 3v10H7V11L3 8zM9 15l2 2 4-4"/>',equip:'<path d="M8 3l4 3 4-3 5 5-4 3v10H7V11L3 8zM12 18v-7M9 14l3-3 3 3"/>',close:'<path d="M5 5l14 14M19 5L5 19"/>',inherit:'<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',forge:'<path d="M4 3h10v5H4zM9 8v13M16 13l4-3 3 4-3 5-4-3z"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[icon]||'')+'</svg>';
}
function decorateEquipmentActions(){
 if(!$('modal').classList.contains('equipment-detail-modal'))return;
 const seen=new Set();for(const button of $('modalActions').querySelectorAll('button')){const existing=button.dataset.equipmentAction||equipmentActionIcon(button.textContent);if(existing&&seen.has(existing)){button.remove();continue;}if(existing)seen.add(existing);if(['sell','dismantle','inherit'].includes(existing)&&BagTools.locked(p,$('modal').dataset.equipmentId))button.disabled=true;if(button.dataset.equipmentAction)continue;const label=button.textContent,icon=equipmentActionIcon(label);if(!icon)continue;button.dataset.equipmentAction=icon;const original=button.onclick;if(['forge','dismantle','inherit'].includes(icon))button.onclick=()=>{equipmentReturnId=$('modal').dataset.equipmentId;original?.();};if(['sell','dismantle'].includes(icon)&&document.querySelector('#modalContent [role=status]')?.textContent.includes('已鎖定'))button.disabled=true;button.title=label;button.setAttribute('aria-label',label);button.textContent='';button.innerHTML=equipmentActionGlyph(icon)+'<span class="equipment-action-label">'+equipmentActionLabel(icon)+'</span>';}
}
new MutationObserver(decorateEquipmentActions).observe($('modalActions'),{childList:true,subtree:true});

// Closing an operation ends its detail navigation context.
document.addEventListener('click',()=>{if($('modal').classList.contains('hidden'))equipmentReturnId=null;});

// A deliberate tap on the backdrop closes the dialog; dragging out of it does not.
let modalBackdropDown=false;
$('modal').addEventListener('pointerdown',event=>{modalBackdropDown=event.target===$('modal');});
$('modal').addEventListener('click',event=>{if(event.target===$('modal')&&modalBackdropDown){closeModal();equipmentReturnId=null;}modalBackdropDown=false;});
$('modal').addEventListener('pointercancel',()=>{modalBackdropDown=false;});
