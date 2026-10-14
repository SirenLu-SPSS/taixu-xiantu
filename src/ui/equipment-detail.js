'use strict';
function equipmentItemPower(item){const fx=Economy.effects(item);return Math.round((fx.atk||0)*3+(fx.def||0)*2+(fx.hp||0)*.4+(fx.crit||0)*100);}
let equipmentReturnId=null;
function equipmentSocketSummary(item){
 const effects={};for(const id of item.sockets||[])for(const [key,value]of Object.entries(EconomyData.templates[id]?.effects||{}))effects[key]=(effects[key]||0)+value;
 return Object.entries(effects).map(([key,value])=>economyEffectName(key)+' +'+economyEffectValue(key,value)).join(' · ')||'尚未鑲嵌寶石';
}
function equipmentBonusRows(item){const parts=equipmentSocketSummary(item).split(' · '),middle=Math.ceil(parts.length/2);return [parts.slice(0,middle),parts.slice(middle)].filter(row=>row.length).map(row=>'<span>'+escapeHTML(row.join(' · '))+'</span>').join('');}
const equipmentDetailDescription=economyDescription;
economyDescription=function(item){
 const template=EconomyData.templates[item.baseId]||item.template;if(!['equip','pet','treasure'].includes(template?.type))return equipmentDetailDescription(item);
 TreasureArts.ensure(item);const fx=Economy.effects(item),quality=['white','blue','purple','gold','legend'][item.quality]||'white';
 return '<section class="equipment-detail"><header><div class="equipment-detail-portrait" data-quality="'+quality+'"><img src="'+characterIcon(item.id)+'" alt="'+escapeHTML(template.name)+'"><strong class="equipment-item-power">戰力 '+equipmentItemPower(item).toLocaleString()+'</strong></div><p>'+characterQuality(item.quality)+' · 等級 '+(template.type==='pet'?(p.levelPet[item.id]||item.level):template.type==='treasure'?(item.fusionLevel||item.level):item.level)+' · 強化 +'+item.enhancement+' · 需求 '+REALMS[item.realm].name+'</p><p>攻擊 '+Math.round(fx.atk||0)+' · 防禦 '+Math.round(fx.def||0)+' · 氣血 '+Math.round(fx.hp||0)+'</p><p>'+item.affixes.map(a=>escapeHTML(a.name)+' +'+economyEffectValue(a.key,a.value)).join(' · ')+'</p></header><div class="equipment-socket-row" aria-label="寶石孔位">'+item.sockets.map((id,i)=>'<span class="equipment-socket" title="孔 '+(i+1)+'：'+escapeHTML(EconomyData.templates[id]?.name||'空孔')+'">'+(id?'<img src="'+economyAsset(id)+'" alt="'+escapeHTML(EconomyData.templates[id]?.name||id)+'">':'<span aria-label="空孔">◇</span>')+'</span>').join('')+'</div><p class="equipment-gem-bonuses">'+equipmentBonusRows(item)+'</p><section class="treasure-art-detail"><h3>'+({equip:'裝備部位神通',pet:'靈寵專屬神通',treasure:'法寶專屬神通'}[template.type])+' · '+item.specialArts.length+' 條</h3>'+item.specialArts.map(id=>TreasureArts.byId.get(id)).filter(Boolean).map(treasureArtRow).join('')+'</section>'+(template.type==='treasure'?companionGemSynergy(item):'')+'</section>';
};
const equipmentDetailModal=modal;
modal=function(...args){$('modal').classList.remove('equipment-detail-modal','companion-detail-modal');delete $('modal').dataset.equipmentId;const result=equipmentDetailModal(...args);if(equipmentReturnId&&p.economy?.instances[equipmentReturnId]&&!p.economy.instances[equipmentReturnId].dismantled){const id=equipmentReturnId,back=document.createElement('button');back.className='btn line';const it=p.economy.instances[id],kind=(EconomyData.templates[it.baseId]||it.template)?.type;back.textContent='← 返回'+({pet:'靈寵',treasure:'法寶',equip:'裝備'}[kind]||'物品')+'詳情';back.dataset.equipmentReturn='true';back.onclick=()=>{equipmentReturnId=null;showItem(id);};$('modalActions').prepend(back);}return result;};
const equipmentDetailItem=economyItem;
economyItem=function(id){
 equipmentReturnId=null;equipmentDetailItem(id);const item=p.economy?.instances[id],template=EconomyData.templates[item?.baseId]||item?.template;if(template?.type!=='equip')return;
 $('modal').classList.add('equipment-detail-modal');$('modal').dataset.equipmentId=id;
 const equipped=p.equipment[template.slot]===id;
 for(const button of $('modalActions').querySelectorAll('button'))if(['已穿戴','穿戴'].includes(button.textContent)){
  button.textContent=equipped?'已裝備／卸下':'裝備';if(equipped)button.onclick=()=>{if(!CharacterSystem.unequip(p,template.slot,ITEMS))return note('裝備背包已滿，無法卸下');finishCharacterMutation('已卸下 '+template.name);};
 }
 const button=document.createElement('button');button.className='btn line';button.textContent='裝備傳承';button.disabled=BagTools.locked(p,id);button.onclick=()=>showTypedInheritance('equip',id);$('modalActions').append(button);
 const gems=document.createElement('button');gems.className='btn line';gems.textContent='一鍵配寶石';gems.disabled=BagTools.locked(p,id)||!item.sockets.length;gems.onclick=()=>showCompanionAutoGems(id);$('modalActions').insertBefore(gems,[...$('modalActions').children].find(b=>b.dataset.equipmentAction==='sell'||b.dataset.equipmentAction==='dismantle'||b.textContent.startsWith('出售')||b.textContent==='拆解')||null);
 if([2,3].includes(item.quality)){const legend=document.createElement('button');legend.className='btn line';legend.textContent='一鍵合成傳說';legend.disabled=BagTools.locked(p,id);legend.onclick=()=>showEquipmentAutoLegend(id);$('modalActions').append(legend);}
 decorateEquipmentActions();
};
const equipmentDetailSlot=showCharacterSlot;
showCharacterSlot=function(slot){const id=p.equipment[slot];if(p.economy?.instances[id])return showItem(id);return equipmentDetailSlot(slot);};
function equipmentActionIcon(label){if(label==='解鎖物品')return 'unlock';if(label==='鎖定物品')return 'lock';if(label.startsWith('出售'))return 'sell';if(label==='拆解')return 'dismantle';if(label==='已裝備／卸下')return 'equipped';if(label==='裝備')return 'equip';if(label==='關閉')return 'close';if(label==='裝備傳承')return 'inherit';if(label.includes('鍛造'))return 'forge';if(label==='出戰')return 'deploy';if(label==='休息')return 'rest';if(label.startsWith('培養'))return 'train';if(label.startsWith('進化'))return 'evolve';if(label==='強化')return 'forge';if(label.includes('傳承'))return 'inherit';if(label==='設為主選')return 'primary';if(label==='卸下主選')return 'unprimary';if(label==='法寶品階合成')return 'merge';if(label==='一鍵合成傳說')return 'legend';if(label==='一鍵配寶石')return 'gems';return null;}
function equipmentActionLabel(icon){return {lock:'鎖定',unlock:'解鎖',sell:'出售',dismantle:'拆解',equipped:'卸下',equip:'裝備',close:'關閉',inherit:'傳承',forge:'鍛造',deploy:'出戰',rest:'休息',train:'培養',evolve:'進化',primary:'主選',unprimary:'取消',merge:'合成',legend:'傳說',gems:'配石'}[icon];}
function equipmentActionGlyph(icon){
 const paths={lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/>',unlock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 017-2M12 14v3"/>',sell:'<circle cx="12" cy="12" r="9"/><path d="M12 6v12M16 8h-6a2 2 0 000 4h4a2 2 0 010 4H8"/>',dismantle:'<path d="M5 3l4 4-2 2-4-4v5l4 3 3-1 9 9 2-2-9-9 1-3-3-4zM4 20l5-5M15 8l5-5"/>',equipped:'<path d="M8 3l4 3 4-3 5 5-4 3v10H7V11L3 8zM9 15l2 2 4-4"/>',equip:'<path d="M8 3l4 3 4-3 5 5-4 3v10H7V11L3 8zM12 18v-7M9 14l3-3 3 3"/>',close:'<path d="M5 5l14 14M19 5L5 19"/>',inherit:'<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',forge:'<path d="M4 3h10v5H4zM9 8v13M16 13l4-3 3 4-3 5-4-3z"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[icon]||{deploy:'<path d="M8 4l12 8-12 8z"/>',rest:'<path d="M8 5v14M16 5v14"/>',train:'<path d="M12 21V8M12 15C3 15 3 5 3 5s9 0 9 10M12 11c0-8 9-8 9-8s0 8-9 8"/>',evolve:'<path d="M4 16l8-10 8 10M4 22l8-10 8 10"/>',primary:'<path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',unprimary:paths.close,merge:'<path d="M4 4l8 8 8-8M12 12v9M8 17l4 4 4-4"/>',legend:'<path d="M3 7l4 5 5-9 5 9 4-5-2 14H5z"/>',gems:'<path d="M6 3h12l5 7-11 12L1 10zM1 10h22M6 3l6 19 6-19"/>'}[icon]||'')+'</svg>';
}
function decorateEquipmentActions(){
 if(!$('modal').classList.contains('equipment-detail-modal'))return;
 const seen=new Set();for(const button of $('modalActions').querySelectorAll('button')){const existing=button.dataset.equipmentAction||equipmentActionIcon(button.textContent);if(existing&&seen.has(existing)){button.remove();continue;}if(existing)seen.add(existing);if(['sell','dismantle','inherit'].includes(existing)&&BagTools.locked(p,$('modal').dataset.equipmentId))button.disabled=true;if(button.dataset.equipmentAction)continue;const label=button.textContent,icon=equipmentActionIcon(label);if(!icon)continue;button.dataset.equipmentAction=icon;const original=button.onclick;if(icon==='sell'){const id=$('modal').dataset.equipmentId;button.onclick=()=>showEquipmentSaleConfirm(id,original);}if(['forge','dismantle','inherit','merge','legend','gems'].includes(icon))button.onclick=()=>{equipmentReturnId=$('modal').dataset.equipmentId;original?.();};if(['sell','dismantle'].includes(icon)&&document.querySelector('#modalContent [role=status]')?.textContent.includes('已鎖定'))button.disabled=true;button.title=label;button.setAttribute('aria-label',label);button.textContent='';button.innerHTML=equipmentActionGlyph(icon)+'<span class="equipment-action-label">'+(label==='強化'?'強化':equipmentActionLabel(icon))+'</span>';}
}
new MutationObserver(decorateEquipmentActions).observe($('modalActions'),{childList:true,subtree:true});

// Closing an operation ends its detail navigation context.
document.addEventListener('click',()=>{if($('modal').classList.contains('hidden'))equipmentReturnId=null;});

// A deliberate tap on the backdrop closes the dialog; dragging out of it does not.
let modalBackdropDown=false;
$('modal').addEventListener('pointerdown',event=>{modalBackdropDown=event.target===$('modal');});
$('modal').addEventListener('click',event=>{if(event.target===$('modal')&&modalBackdropDown){closeModal();equipmentReturnId=null;}modalBackdropDown=false;});
$('modal').addEventListener('pointercancel',()=>{modalBackdropDown=false;});

function equipmentSaleReady(item,started,now=Date.now()){return item.quality!==4||now-started>=3000;}
function showEquipmentSaleConfirm(id,sell){
 const item=p.economy?.instances[id],template=EconomyData.templates[item?.baseId]||item?.template;
 if(!item||!p.inventory.some(entry=>entry.id===id&&entry.count>0)||BagTools.locked(p,id))return note('物品已變動或已鎖定，無法出售');
 const started=Date.now(),legend=item.quality===4,price=ITEMS[id]?.price||0;
 equipmentReturnId=id;
 modal(legend?'傳說裝備出售提醒':'確認出售裝備','<p>'+escapeHTML(template.name)+' · '+characterQuality(item.quality)+' · 強化 +'+item.enhancement+'</p><p>出售 1 件可獲得 '+price+' 靈石。出售後無法取回。</p>'+(legend?'<p class="equipment-sale-warning">這是傳說裝備，請確認不是要保留的物品。等待 3 秒後才能出售。</p>':''),[{text:'取消',fn:()=>{equipmentReturnId=null;showItem(id);}},{text:'確認出售',fn:()=>{
  if(!equipmentSaleReady(item,started))return;
  if(!p.inventory.some(entry=>entry.id===id&&entry.count>0)||BagTools.locked(p,id))return note('物品已變動或已鎖定，無法出售');
  equipmentReturnId=null;sell?.();
 }}]);
 const confirm=$('modalActions').lastElementChild;
 if(legend){confirm.disabled=true;const update=()=>{if(!confirm.isConnected)return;const remaining=Math.max(0,Math.ceil((3000-(Date.now()-started))/1000));confirm.textContent=remaining?'確認出售（'+remaining+' 秒）':'確認出售';confirm.disabled=remaining>0;if(remaining)setTimeout(update,100);};update();}
}
function companionGemSynergy(item){const g=TreasureArts.gems(item);return '<h3>寶石聯動</h3><p class="companion-gem-synergy">飛劍 +'+Math.round(g.damage*100)+'% · 連鎖 +'+g.chain+' · 冰凍 +'+Math.round(g.freeze*100)+'%<br>燃燒 +'+Math.round(g.burn*100)+'% · 回血 +'+Math.round(g.heal*100)+'% · 回靈 +'+Math.round(g.mp*100)+'% · 防禦 +'+Math.round(g.defense*100)+'%</p>';}
const companionUnifiedItem=economyItem;
economyItem=function(id){
 companionUnifiedItem(id);const item=p.economy?.instances[id],template=EconomyData.templates[item?.baseId]||item?.template;if(!['pet','treasure'].includes(template?.type))return;
 $('modal').classList.add('equipment-detail-modal','companion-detail-modal');$('modal').dataset.equipmentId=id;
 for(const button of $('modalActions').querySelectorAll('button')){
  const label=button.textContent;
  if(label==='出戰／休息')button.textContent=p.companions.deployed.includes(template.type+':'+id)?'休息':'出戰';
  if(label.startsWith('培養')||label.startsWith('進化')){const original=button.onclick,action=label.startsWith('培養')?'培養':'進化';button.onclick=()=>{const before={level:p.levelPet[id],evolution:item.evolution};original();if(p.levelPet[id]>before.level||item.evolution>before.evolution){equipmentReturnId=id;modal(action+'成功','<p>'+escapeHTML(template.name)+'</p><p>等級 '+before.level+' → '+p.levelPet[id]+' · 進化 '+before.evolution+' → '+item.evolution+'</p>',[{text:'返回詳情',fn:()=>showCharacterUnit(template.type+':'+id)}]);}};}
 }
 const add=(label,fn,disabled=false)=>{if([...$('modalActions').children].some(b=>b.title===label||b.textContent===label))return;const b=document.createElement('button');b.className='btn line';b.textContent=label;b.onclick=fn;b.disabled=disabled;$('modalActions').append(b);};
 add(template.type==='pet'?'靈寵傳承':'法寶傳承',()=>template.type==='pet'?showTypedInheritance('pet',id):showTreasureInheritance(id),BagTools.locked(p,id));
 if(template.type==='pet')add('強化',()=>economyForge(id));else add('一鍵配寶石',()=>showCompanionAutoGems(id),BagTools.locked(p,id)||!item.sockets.length);
 const order=['close','primary','unprimary','deploy','rest','train','evolve','forge','gems','dismantle','merge','inherit','legend','lock','unlock'];
 for(const b of [...$('modalActions').children].sort((a,b)=>order.indexOf(a.dataset.equipmentAction||equipmentActionIcon(a.textContent))-order.indexOf(b.dataset.equipmentAction||equipmentActionIcon(b.textContent))))$('modalActions').append(b);
 decorateEquipmentActions();
};
const companionUnifiedUnit=showCharacterUnit;
showCharacterUnit=function(key){companionUnifiedUnit(key);decorateEquipmentActions();};
function companionAutoGemPlan(item,inventory,templates,arts,mode='synergy',replace=false){
 const text=(item.specialArts||[]).map(id=>JSON.stringify(arts.get(id)||{})).join(''),priority={fire:2,pierce:2,blast:1,thunder:1,frost:1,mana:1,life:1,vital:1,armor:1};
 for(const [pattern,kind]of [[/雷|thunder|chain/,'thunder'],[/冰|freeze|frost/,'frost'],[/燃|火|burn/,'fire'],[/回靈|真元|mana|restoreMp/,'mana'],[/回血|氣血|heal|restoreHp/,'vital'],[/盾|減傷|shield|reduction/,'armor']])if(pattern.test(text))priority[kind]=6;
 const preferences={balanced:['fire','armor','vital','mana','thunder','frost','pierce','life','blast','wind','blood','wisdom'],attack:['fire','pierce','thunder','blast','blood'],control:['frost','thunder','wind'],recovery:['mana','life','vital'],defense:['armor','vital','wind']};if(mode!=='synergy')for(const kind of Object.keys(priority))priority[kind]=(preferences[mode]||preferences.balanced).includes(kind)?6:0;
 const combined=inventory.map(e=>({...e}));if(replace)for(const id of item.sockets.filter(Boolean)){const entry=combined.find(e=>e.id===id);if(entry)entry.count++;else combined.push({id,count:1});}
 const pool=combined.filter(e=>templates[e.id]?.type==='gem'&&e.count>0).map(e=>({...e}));pool.sort((a,b)=>(priority[templates[b.id].kind]||0)-(priority[templates[a.id].kind]||0)||templates[b.id].tier-templates[a.id].tier||a.id.localeCompare(b.id));
 const plan=[],used={};if(!replace)for(const id of item.sockets.filter(Boolean)){const kind=templates[id]?.kind;used[kind]=(used[kind]||0)+1;}item.sockets.forEach((gem,index)=>{if(gem&&!replace)return;const choices=pool.filter(e=>e.count>0);if(mode==='balanced')choices.sort((a,b)=>(used[templates[a.id].kind]||0)-(used[templates[b.id].kind]||0)||(priority[templates[b.id].kind]||0)-(priority[templates[a.id].kind]||0)||templates[b.id].tier-templates[a.id].tier);if(mode!=='balanced')choices.sort((a,b)=>(priority[templates[b.id].kind]||0)/(1+(used[templates[b.id].kind]||0))-(priority[templates[a.id].kind]||0)/(1+(used[templates[a.id].kind]||0))||templates[b.id].tier-templates[a.id].tier||a.id.localeCompare(b.id));const e=choices[0];if(e){plan.push({index,gem:e.id});e.count--;const kind=templates[e.id].kind;used[kind]=(used[kind]||0)+1;}});return plan;
}

function applyCompanionGemPlan(player,id,plan,replace){
 const sim=JSON.parse(JSON.stringify(player)),item=sim.economy.instances[id],next=replace?item.sockets.map(()=>null):[...item.sockets];for(const e of plan)next[e.index]=e.gem;
 const delta={};for(const gem of item.sockets.filter(Boolean))delta[gem]=(delta[gem]||0)+1;for(const gem of next.filter(Boolean))delta[gem]=(delta[gem]||0)-1;
 for(const [gem,n]of Object.entries(delta))if(n<0&&!Economy.take(sim,gem,-n))return null;
 for(const [gem,n]of Object.entries(delta))if(n>0&&!Economy.addStack(sim,gem,n))return null;
 item.sockets=next;return sim;
}
function showCompanionAutoGems(id,mode='balanced',replace=true){
 const item=p.economy.instances[id],template=EconomyData.templates[item.baseId]||item.template,type=template.type,label=type==='equip'?'裝備':'法寶',reopen=()=>type==='equip'?showItem(id):showCharacterUnit('treasure:'+id);if(mode==='manual'){equipmentReturnId=id;economyForge(id);return;}const plan=companionAutoGemPlan(item,p.inventory,EconomyData.templates,TreasureArts.byId,mode,replace),preview={...item,sockets:replace?item.sockets.map(()=>null):[...item.sockets]};for(const e of plan)preview.sockets[e.index]=e.gem;equipmentReturnId=id;
 const modes={balanced:'均衡搭配',synergy:'神通聯動',attack:'攻擊爆發',control:'冰凍控制',recovery:'回血回靈',defense:'防禦護盾',manual:'自行搭配'};
 modal(label+'配石 · 搭配與重配','<label>搭配效果<select id="companionGemMode">'+Object.entries(modes).map(([key,label])=>'<option value="'+key+'" '+(key===mode?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>配置方式<select id="companionGemReplace"><option value="replace" '+(replace?'selected':'')+'>重配全部孔位（回收原寶石）</option><option value="fill" '+(!replace?'selected':'')+'>只補空孔（保留原配置）</option></select></label><p>先預覽再確認。重配可使用背包及此物品已鑲嵌的寶石；原寶石會回收，材料不足時留下空孔。</p><h3>配置預覽</h3>'+preview.sockets.map((gem,index)=>'<p>孔 '+(index+1)+'：'+escapeHTML(EconomyData.templates[gem]?.name||'空孔')+'</p>').join('')+(type==='treasure'?companionGemSynergy(preview):'<h3>寶石加成預覽</h3><p class="equipment-gem-bonuses">'+equipmentBonusRows(preview)+'</p>'),[{text:'取消',fn:reopen},{text:'確認配石',fn:()=>{
  if(BagTools.locked(p,id))return note('請先解鎖'+label);const fresh=companionAutoGemPlan(item,p.inventory,EconomyData.templates,TreasureArts.byId,mode,replace);if(JSON.stringify(fresh)!==JSON.stringify(plan))return showCompanionAutoGems(id,mode,replace);
  const sim=applyCompanionGemPlan(p,id,plan,replace);if(!sim)return note('背包空間不足或寶石已變動，未更動配置');p.inventory=sim.inventory;item.sockets=sim.economy.instances[id].sockets;economyHydrate();save(true);renderAll();reopen();note('配石成功：'+modes[mode]);
 }}]);$('modalActions').lastElementChild.disabled=!plan.length;$('companionGemMode').onchange=e=>showCompanionAutoGems(id,e.target.value,replace);$('companionGemReplace').onchange=e=>showCompanionAutoGems(id,mode,e.target.value==='replace');
}

function showEquipmentAutoLegend(id){
 const item=p.economy.instances[id],plan=CompanionMerge.autoLegendPlan(p,id);equipmentReturnId=id;
 const reason=(plan.reason||'').replaceAll('主法寶','主裝備').replaceAll('法寶','裝備');
 modal('裝備 · 一鍵合成傳說','<p>'+escapeHTML((EconomyData.templates[item.baseId]||item.template).name)+' · '+characterQuality(item.quality)+'</p><p>沿用一鍵傳說合成：三紫升金、三金升傳說；自動搭配同境界、同部位材料，優先金品，不足時以三紫補一金。保留本體等級、強化、寶石與穿戴位置；鎖定、穿戴中、強化或鑲嵌過的裝備不作材料。</p><p>額外成長及詞條繼承機率與法寶一鍵傳說相同。</p>'+(plan.ok?'<p>消耗：金品 ×'+plan.gold+'、紫品 ×'+plan.purple+'；靈石 0。</p>':'<p role="alert">素材不足或不可合成：'+escapeHTML(reason)+'</p>'),[{text:'返回詳情',fn:()=>{equipmentReturnId=null;showItem(id);}},{text:'確認一鍵升傳說',style:'gold',fn:()=>{const fresh=CompanionMerge.autoLegendPlan(p,id);if(JSON.stringify(fresh)!==JSON.stringify(plan))return showEquipmentAutoLegend(id);const result=CompanionMerge.autoLegend(p,id);if(!result.ok)return showEquipmentAutoLegend(id);economyHydrate();save(true);renderAll();equipmentReturnId=null;showItem(id);note('傳說裝備合成成功');}}]);$('modalActions').lastElementChild.disabled=!plan.ok;
}
