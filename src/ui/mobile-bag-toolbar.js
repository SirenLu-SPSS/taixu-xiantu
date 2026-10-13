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
   if(b.tagName==='SUMMARY'&&['sell','dismantle'].includes(entry?.[1])&&!b.dataset.mobileQualityPicker){
    b.dataset.mobileQualityPicker='true';b.addEventListener('click',event=>{
     if(!window.matchMedia('(max-width:760px)').matches)return;
     event.preventDefault();b.parentElement.open=false;
     const selling=entry[1]==='sell',menu=b.parentElement,selected=Array.from(menu.querySelectorAll('input:checked'),input=>Number(input.value));
     modal(selling?'批量販售 · 選擇品階':'批量拆解 · 選擇品階','<p>勾選要'+(selling?'販售':'拆解')+'的裝備品階，可複選。</p><div class="mobile-quality-picker">'+[0,1,2,3,4].map(q=>'<label><input type="checkbox" data-mobile-bulk-quality="'+q+'" '+(selected.includes(q)?'checked':'')+'><span>'+characterQuality(q)+'</span></label>').join('')+'</div><p>鎖定與穿戴中的裝備會保留。</p>',[{text:'取消'},{text:selling?'一次販售':'一次拆解',style:'gold',fn:()=>{
      const qualities=Array.from(document.querySelectorAll('[data-mobile-bulk-quality]:checked'),input=>Number(input.dataset.mobileBulkQuality));
      if(!qualities.length)return note('請至少勾選一種品階');
      for(const input of menu.querySelectorAll('input'))input.checked=qualities.includes(Number(input.value));
      if(selling)bagBulkSale(qualities);else showBulkDismantle(qualities);
     }}]);
    });
   }

   const count=label.match(/未領取匣\s*·\s*(\d+)/);b.dataset.mobileCount=count&&Number(count[1])?count[1]:'';
  });
 }
 decorate();new MutationObserver(decorate).observe(heading,{childList:true,characterData:true,subtree:true});
})();
