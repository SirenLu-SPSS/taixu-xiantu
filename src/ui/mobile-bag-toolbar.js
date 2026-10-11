'use strict';
/* Label existing controls rather than cloning them: original handlers and state stay intact. */
(()=>{
 const heading=document.querySelector('.character-bag-heading');
 if(!heading)return;
 const icons=[[/萬寶|尋寶/,'shop','商店'],[/鍛造/,'forge','鍛造'],[/未領取/,'mail','領取'],[/販售/,'sell','販售'],[/拆解/,'dismantle','拆解'],[/整理/,'organize','整理'],[/殘卷/,'scroll','殘卷'],[/寶石/,'gem','寶石'],[/品階/,'promote','升階'],[/一鍵合成/,'merge','合成'],[/傳承/,'inherit','傳承']];
 function decorate(){
  heading.querySelectorAll(':scope > button,:scope > details > summary').forEach(b=>{
   const label=b.textContent.trim(),entry=icons.find(([pattern])=>pattern.test(label));
   b.dataset.mobileIcon=entry?.[1]||'merge';b.dataset.mobileLabel=entry?.[2]||label.slice(0,4);
   const asset=new URL('./src/assets/mobile-toolbar/'+b.dataset.mobileIcon+'.webp',document.baseURI);
   b.style.setProperty('--mobile-toolbar-art','url("'+asset.href+'")');
   b.setAttribute('aria-label',label);b.title=label;
   const count=label.match(/未領取匣\s*·\s*(\d+)/);b.dataset.mobileCount=count&&Number(count[1])?count[1]:'';
  });
 }
 decorate();new MutationObserver(decorate).observe(heading,{childList:true,characterData:true,subtree:true});
})();
