/* Reuse the existing settings and action handlers without changing save behavior. */
(()=>{
 const actions=document.querySelector('.top-actions');if(!actions)return;
 const button=document.createElement('button');button.id='mobileHeaderMenu';button.type='button';button.setAttribute('aria-label','開啟設定與功能');button.title='設定與功能';
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 3-.7 3-2 .9-2.7-.9-2 3.5 2.1 2.1v2.3L1.6 16l2 3.5 2.7-.9 2 .9.7 3h4l.7-3 2-.9 2.7.9 2-3.5-2.1-2.1v-2.3l2.1-2.1-2-3.5-2.7.9-2-.9L13 3Z" transform="translate(1 -1) scale(.95)"/><circle cx="12" cy="12" r="3"/></svg>';
 button.onclick=()=>{
  document.getElementById('settings').click();
  document.getElementById('modalTitle').textContent='設定與功能';
  const save=document.createElement('button');save.className='btn gold';save.textContent='儲存進度';save.onclick=()=>document.getElementById('save').click();
  const home=document.createElement('button');home.className='btn line';home.textContent='返回主畫面';home.onclick=()=>{document.getElementById('modal').classList.add('hidden');document.getElementById('home').click();};
  document.getElementById('modalActions').prepend(save,home);
 };
 actions.append(button);
})();
