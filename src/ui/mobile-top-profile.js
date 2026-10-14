(()=>{
 'use strict';
 function compactResource(raw){return (typeof ResourceDisplay!=='undefined'?ResourceDisplay:require('../data/resource-display.js')).format(raw);}
 if(typeof module==='object'&&module.exports)module.exports={compactResource};
 if(typeof document==='undefined')return;
 const top=document.querySelector('#game .top'),info=top?.querySelector('.character-head>div');if(!info)return;
 const realmSource=document.getElementById('realmName'),realmButton=document.createElement('button');realmButton.type='button';realmButton.className='mobile-top-realm';realmButton.title='開啟境界介面';realmButton.onclick=()=>document.querySelector('#nav [data-tab="realm"]')?.click();info.append(realmButton);
 const states=document.createElement('div');states.className='mobile-top-states';info.append(states);
 const bindings=[['autoCombat','⚔︎ 自動戰鬥'],['autoMeditate','☯ 自動打坐']].map(([id,label])=>{const source=document.getElementById(id),button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{source.click();sync();};states.append(button);return {source,button,label};});
 const bar=document.createElement('div');bar.className='mobile-top-resources';bar.setAttribute('aria-label','角色資源');
 const resources=[['power','⚔︎','戰力'],['stones','◇','靈石'],['jade','✦','仙玉']].map(([id,icon,label])=>{const source=document.getElementById(id),button=document.createElement('button');button.type='button';const name=document.createElement('span');name.textContent=icon+' '+label;const value=document.createElement('b');button.append(name,value);button.onclick=()=>modal(label+'完整數值','<p class="mobile-full-resource">'+escapeHTML(source.dataset.fullValue||source.textContent)+'</p>',[{text:'返回'}]);bar.append(button);return {source,button,value,label};});top.append(bar);
 function sync(){realmButton.textContent=realmSource.textContent.replace(/\s+/g,'').replace('層/','/')+' ›';realmButton.setAttribute('aria-label','開啟境界介面：'+realmSource.textContent);for(const {source,button,label}of bindings){const enabled=/：開$/.test(source.textContent);button.classList.toggle('is-on',enabled);button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',label.replace(/^[^自]* /,'')+'：'+(enabled?'開':'關'));}for(const {source,button,value,label}of resources){value.textContent=compactResource(source.dataset.fullValue||source.textContent);button.setAttribute('aria-label',label+' '+source.textContent+'，查看完整數值');}}
 const observer=new MutationObserver(sync);for(const node of [realmSource,...bindings.map(x=>x.source),...resources.map(x=>x.source)])observer.observe(node,{childList:true,subtree:true,characterData:true});sync();
})();
