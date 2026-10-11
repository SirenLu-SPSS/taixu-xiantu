'use strict';
/* Label existing controls rather than cloning them: original handlers and state stay intact. */
(()=>{
 const heading=document.querySelector('.character-bag-heading');
 if(!heading)return;
 const icons=[[/萬寶|尋寶/,'⌂','商店'],[/鍛造/,'⚒','鍛造'],[/未領取/,'✉','領取'],[/販售/,'◇','販售'],[/拆解/,'⚙','拆解'],[/整理/,'▦','整理'],[/殘卷/,'▤','殘卷'],[/寶石/,'◆','寶石'],[/品階/,'✦','升階'],[/一鍵合成/,'✧','合成'],[/傳承/,'⇄','傳承']];
 function decorate(){
  heading.querySelectorAll(':scope > button,:scope > details > summary').forEach(b=>{
   const label=b.textContent.trim(),entry=icons.find(([pattern])=>pattern.test(label));
   b.dataset.mobileIcon=entry?.[1]||'✧';b.dataset.mobileLabel=entry?.[2]||label.slice(0,4);
   b.setAttribute('aria-label',label);b.title=label;
   const count=label.match(/未領取匣\s*·\s*(\d+)/);b.dataset.mobileCount=count&&Number(count[1])?count[1]:'';
  });
 }
 decorate();new MutationObserver(decorate).observe(heading,{childList:true,characterData:true,subtree:true});
})();
