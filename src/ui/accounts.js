/* Account saves supplement the existing save buffer; no local save is deleted. */
(()=>{
 'use strict';
 const API=window.TAIXU_ACCOUNT_API||'',AUTH='TAIXU_ACCOUNT_SESSION_V1',GUEST=SAVE+'_GUEST_BACKUP',OWNER=SAVE+'_OWNER',CACHE='TAIXU_CLOUD_CACHE_V1';
 let session=null,active=null,timer=null,flight=null,serial=0,conflict=false;
 let wakeFlight=null;
 function wakeAccountService(){if(!API||wakeFlight)return;wakeFlight=fetch(API+'/health',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(120000)}).catch(()=>null).finally(()=>{wakeFlight=null;});}
 let writer=crypto.randomUUID();try{writer=sessionStorage.getItem('TAIXU_SAVE_WRITER')||writer;sessionStorage.setItem('TAIXU_SAVE_WRITER',writer)}catch{}
 try{session=JSON.parse(sessionStorage.getItem(AUTH)||'null')}catch{}
 const read=key=>{try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}},write=(key,value)=>storage.setItem(key,JSON.stringify(value));
 const cacheKey=(owner,id)=>CACHE+':'+owner+':'+id;
 const knownKey=()=>CACHE+':list:'+session?.username;
 const status=document.createElement('p');status.id='accountStatus';status.className='account-status';status.setAttribute('role','status');
 const button=document.createElement('button');button.className='btn line';button.id='accountManager';button.textContent='帳號綁定／登入';
 $('continueGame').after(button,status);
 function statusText(text){status.textContent=text;$('save').title=text;const label=$('cloudSaveStatus');if(label)label.textContent=text;button.textContent=session?'帳號／人物管理 · '+session.username:'帳號綁定／登入';$('continueGame').disabled=!session&&!localRecord();}
 function authStore(value){session=value;try{if(value)sessionStorage.setItem(AUTH,JSON.stringify(value));else sessionStorage.removeItem(AUTH)}catch{}statusText(value?'已登入 '+value.username+' · 每帳號最多 5 位人物':'尚未綁定帳號 · 本機進度可匯入雲端');}
 async function request(path,method='GET',data){
  if(!API)throw Error('帳號存檔服務尚未啟用，本機存檔仍可正常使用');
  let response;try{response=await fetch(API+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(session?{Authorization:'Bearer '+session.token}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(120000),cache:'no-store',credentials:'omit'})}catch{throw Error('帳號服務尚未回應，可能正在喚醒或網路中斷；進度已保留於本機，請稍後重試');}
  const result=await response.json();if(!response.ok){const e=Error(result.error||'伺服器忙碌');e.status=response.status;throw e;}return result;
 }
 function download(save,name='太虛仙途_存檔'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(save,null,2)],{type:'application/json'}));a.href=url;a.download=name+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function backupGuest(){const raw=storage.getItem(SAVE);if(raw&&!read(OWNER))storage.setItem(GUEST,raw);}
 function cacheCurrent(){if(!active||!p)return;const record={...active,save:JSON.parse(JSON.stringify(p)),pending:true,stamp:Date.now(),serial:++serial,writer,writeId:crypto.randomUUID()};const key=cacheKey(active.owner,active.id);if(!write(key+':working:'+writer,record)||!write(key,record)){note('本機儲存空間不足，請立即匯出備份');return false;}active=record;return true;}
 function scheduleFlush(){if(timer===null)timer=setTimeout(()=>{timer=null;flush();},15000);}
 async function flush(){
  if(flight)return flight;if(!active?.pending||!session||active.owner!==session.username||conflict)return !active?.pending;
  clearTimeout(timer);timer=null;
  const captured={...active};statusText('正在同步 '+captured.save.name+'…');
  flight=(async()=>{try{
   const result=await request('/api/characters/'+captured.id,'PUT',{revision:captured.revision,save:captured.save});
   const key=cacheKey(captured.owner,captured.id),latest=read(key),current=active?.id===captured.id&&active.owner===captured.owner?active:captured;
   const next={...current,revision:result.revision,pending:current.writeId!==captured.writeId};write(key+':working:'+writer,next);
   if(latest?.writer===writer)write(key,next);
   if(active?.id===captured.id&&active.owner===captured.owner){active=next;statusText(next.pending?'新進度待同步':'雲端已儲存 · '+new Date(result.updated_at).toLocaleString('zh-TW'));}
   return !next.pending;
  }catch(e){if(e.status===409)conflict=true;statusText(e.message);if(e.status===401)note('登入已過期；本機進度已保留，請重新登入');return false;}finally{flight=null;if(active?.pending&&!conflict&&session)scheduleFlush();}})();return flight;
 }
 const baseSave=save;save=function(quiet=false){baseSave(quiet);if(!active&&!read(OWNER))backupGuest();if(active&&cacheCurrent()){if(quiet)scheduleFlush();else{flush();note('已存本機，正在同步雲端')}}};
 const baseTitle=startTitle;startTitle=function(){baseTitle();statusText(session?'已登入 '+session.username+' · 每帳號最多 5 位人物':'尚未綁定帳號 · 本機進度可匯入雲端');};
 function errorAt(id,e){const el=$(id);if(el)el.textContent=e.message;else note(e.message);}
 function busyAction(id,action){const el=$(id);if(!el)return;el.onclick=async()=>{const label=el.textContent,message=$('accountError');el.disabled=true;el.textContent='連線中…';if(message)message.textContent='正在連線到帳號服務…';const waiting=setTimeout(()=>{if(message?.isConnected)message.textContent='免費帳號服務可能正在喚醒，首次連線約需 1 分鐘，請稍候…';},5000);try{await action()}catch(e){errorAt('accountError',e)}finally{clearTimeout(waiting);if(el.isConnected){el.disabled=false;el.textContent=label;}}};}
 function authForm(mode='login'){
  wakeAccountService();
  const register=mode==='register',recover=mode==='recover';
  modal(register?'綁定帳號 · 建立雲端仙籍':recover?'使用救援碼重設密碼':'登入帳號',`<div class="account-form"><p>同一帳號可跨裝置管理 5 位人物。註冊不會覆蓋既有本機存檔。</p><label for="accountUsername">帳號</label><input id="accountUsername" autocomplete="username" maxlength="32" placeholder="4–32 位英文、數字或底線"><label for="accountPassword">${recover?'新密碼':'密碼'}</label><input id="accountPassword" type="password" autocomplete="${register||recover?'new-password':'current-password'}" minlength="10" maxlength="128" placeholder="至少 10 字元">${register?'<label for="accountConfirm">再次輸入密碼</label><input id="accountConfirm" type="password" autocomplete="new-password" maxlength="128">':''}${recover?'<label for="recoveryCode">救援碼</label><input id="recoveryCode" autocomplete="off" maxlength="48">':''}<p id="accountError" role="alert"></p><button id="accountSubmit" class="btn gold">${register?'建立帳號':recover?'重設並登入':'登入'}</button></div>`,[{text:'返回'},{text:register?'已有帳號':'建立帳號',fn:()=>authForm(register?'login':'register')},...(!register&&!recover?[{text:'忘記密碼',fn:()=>authForm('recover')}]:[])]);
  busyAction('accountSubmit',async()=>{
   const password=$('accountPassword').value;if(register&&password!==$('accountConfirm').value)throw Error('兩次密碼不一致');
   const result=await request('/api/auth/'+mode,'POST',{username:$('accountUsername').value,password,...(recover?{recoveryCode:$('recoveryCode').value}:{})});authStore({token:result.token,username:result.username});
   if(result.recoveryCode){modal('請保存帳號救援碼',`<p>忘記密碼時可用此碼重設。此碼只顯示這一次，請保存於安全位置。</p><code class="account-recovery">${result.recoveryCode}</code><p>本機角色仍然保留，接下來可選擇匯入。</p>`,[{text:'下載救援碼',fn:()=>download({username:result.username,recoveryCode:result.recoveryCode},'太虛仙途_帳號救援碼')},{text:'已保存，管理人物',style:'gold',fn:showCharacters}]);}else await showCharacters();
  });
 }
 function localRecord(){return !read(OWNER)?read(SAVE):read(GUEST);}
 function summary(row){const r=REALMS[Number(row.realm)];return (r?.name||'未知境界')+' · '+new Date(row.updated_at).toLocaleString('zh-TW');}
 async function showCharacters(){
  if(!session)return authForm();
  if(active&&p){save(true);await flush();}
  let rows,offline=false;try{rows=(await request('/api/characters')).characters;write(knownKey(),rows)}catch(e){rows=read(knownKey());if(!rows){note(e.message);return;}offline=true;}
  modal('續寫前緣 · '+session.username,`<p>${rows.length} / 5 位人物${offline?' · 離線資料，僅能繼續已下載的人物':''}</p><div class="account-characters">${rows.map(row=>`<button class="btn line" data-cloud-character="${row.id}"><b>人物 ${row.slot} · ${escapeHTML(row.name)}</b><small>${escapeHTML(summary(row))}</small></button>`).join('')||'<p>尚未建立人物，可匯入本機進度，或踏入仙途建立新人物。</p>'}</div><p id="accountError" role="alert"></p>`,[{text:'返回'},{text:'建立新人物',style:'gold',fn:()=>{if(offline)return note('請連線後建立人物');if(rows.length>=5)return note('帳號已有 5 位人物');closeModal();$('creator').classList.remove('hidden');}},{text:'匯入本機人物',fn:async()=>{const existing=localRecord();if(!existing)return note('此瀏覽器沒有可匯入的本機人物');if(!confirm('將本機「'+existing.name+'」複製到帳號的一個新人物欄位？原本機存檔會保留。'))return;try{await request('/api/characters','POST',{save:existing});note('本機人物已複製到雲端');await showCharacters()}catch(e){errorAt('accountError',e)}}},{text:'登出',fn:logout}]);
  document.querySelectorAll('[data-cloud-character]').forEach(el=>el.onclick=async()=>{el.disabled=true;try{await selectCharacter(el.dataset.cloudCharacter,offline)}catch(e){errorAt('accountError',e)}finally{el.disabled=false;}});
 }
 function enter(record){backupGuest();active=record;conflict=false;serial=Math.max(serial,record.serial||0);write(cacheKey(record.owner,record.id),record);write(OWNER,{owner:record.owner,id:record.id});storage.setItem(SAVE,JSON.stringify(record.save));if(load()){closeModal();startGame();save(true);}}
 async function selectCharacter(id,offline=false){
  const cached=read(cacheKey(session.username,id));let remote;
  if(offline){if(!cached)throw Error('此裝置尚未下載該人物，請先連線');enter(cached);return;}
  remote=await request('/api/characters/'+id);
  const fromCloud=()=>enter({owner:session.username,id,revision:remote.revision,save:remote.save,pending:false,serial:++serial});
  if(cached?.pending){
   const same=cached.revision===remote.revision;
   modal('本機有尚未同步的進度',`<p>${same?'可繼續本機進度並同步，或下載備份後改讀雲端。':'另一台裝置已更新雲端進度。為避免覆蓋，請先下載本機備份，再選擇讀取雲端。'}</p>`,[{text:'返回',fn:showCharacters},{text:'下載本機備份',fn:()=>download(cached.save) },...(same?[{text:'繼續本機並同步',style:'gold',fn:()=>enter(cached)}]:[]),{text:'改讀雲端進度',fn:()=>{if(confirm('確定改讀雲端？尚未同步的本機版本將保留為備份。')){write(cacheKey(session.username,id)+':conflict:'+Date.now(),cached);fromCloud();}}}]);
  }else fromCloud();
 }
 async function logout(){
  if(active&&p){save(true);await flush();if(active.pending&&!confirm('雲端尚未同步，進度會保留在本機，重新登入相同帳號可繼續。確定登出？'))return;}
  try{await request('/api/auth/logout','POST')}catch{}
  clearTimeout(timer);timer=null;active=null;conflict=false;authStore(null);p=null;const guest=read(GUEST);if(guest){storage.setItem(SAVE,JSON.stringify(guest));write(OWNER,null);}closeModal();startTitle();
 }
 const oldCreate=$('createCharacter').onclick;$('createCharacter').onclick=async()=>{
  if(!session){backupGuest();oldCreate();if($('creator').classList.contains('hidden')){write(OWNER,null);backupGuest();}return;}
  const el=$('createCharacter');el.disabled=true;try{
   const data=initialPlayer($('charName').value.trim().slice(0,12)||'青雲散人',selectedRoot),row=await request('/api/characters','POST',{save:data});
   $('creator').classList.add('hidden');enter({owner:session.username,id:row.id,revision:row.revision,save:data,pending:false,serial:++serial});
  }catch(e){note(e.message)}finally{el.disabled=false;}
 };
 $('continueGame').onclick=()=>session?showCharacters():showLocal();
 function showLocal(){const data=localRecord();if(!data)return authForm();modal('續寫前緣 · 本機人物',`<p><b>${escapeHTML(data.name)}</b></p><p>${escapeHTML(REALMS[data.realm]?.name||'')} · ${new Date(data.lastSeen||Date.now()).toLocaleString('zh-TW')}</p><p>尚未綁定帳號，此進度只保存在目前瀏覽器。綁定後可匯入雲端。</p>`,[{text:'返回'},{text:'綁定帳號',fn:()=>authForm('register')},{text:'繼續修行',style:'gold',fn:()=>{active=null;write(OWNER,null);storage.setItem(SAVE,JSON.stringify(data));if(load()){closeModal();startGame();}}}]);}
 button.onclick=()=>session?showCharacters():authForm();
 const oldSettings=$('settings').onclick;$('settings').onclick=()=>{oldSettings();const el=document.createElement('button');el.className='btn line';el.textContent='帳號／雲端人物管理';el.onclick=()=>session?showCharacters():authForm();$('modalActions').append(el);const label=document.createElement('p');label.id='cloudSaveStatus';label.setAttribute('role','status');label.textContent=active?'此人物已綁定 '+active.owner+'，每 15 秒自動同步雲端，手動儲存立即同步；離線時先保留本機進度。'+status.textContent:'此人物尚未綁定帳號，請登入後匯入本機人物。';$('modalContent').append(label);};
 window.addEventListener('online',()=>{if(!conflict)flush()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)flush()});
 // Reload never silently uploads the legacy SAVE buffer into a cloud character.
 wakeAccountService();authStore(session);const checkedSession=session;if(checkedSession)request('/api/me').catch(e=>{if(session!==checkedSession)return;if(e.status===401)authStore(null);else statusText(e.message)});
})();
