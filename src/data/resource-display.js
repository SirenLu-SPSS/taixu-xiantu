'use strict';
const ResourceDisplay=(()=>{
 function format(raw){const n=Number(String(raw).replace(/,/g,''));if(!Number.isFinite(n))return String(raw);if(n>=100000000)return (n/100000000).toLocaleString('zh-TW',{maximumFractionDigits:2})+'億';return n>=10000?(n/10000).toLocaleString('zh-TW',{maximumFractionDigits:2})+'萬':Math.floor(n).toLocaleString('zh-TW');}
 function set(node,value,label){const full=Math.floor(value).toLocaleString('zh-TW');node.dataset.fullValue=full;node.textContent=format(value);node.title=label+' '+full;node.setAttribute('aria-label',label+' '+full+'，查看完整數值');if(!node.dataset.resourceBound){node.dataset.resourceBound='1';node.style.cursor='pointer';node.tabIndex=0;node.setAttribute('role','button');node.onclick=()=>modal(label+'完整數值','<p>'+node.dataset.fullValue+'</p>',[{text:'返回'}]);node.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();node.click();}};}}
 return {format,set};
})();
if(typeof module!=='undefined')module.exports=ResourceDisplay;
