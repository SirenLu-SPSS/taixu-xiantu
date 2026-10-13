'use strict';
const SaveExport=(()=>{
 const histories=['drops','forgeLog','dismantleLog','masterForgeLog','mergeLog','inheritanceLog'];
 function compact(player){
  const copy=JSON.parse(JSON.stringify(player)),e=copy.economy;
  if('breakthroughHistory' in copy)copy.breakthroughHistory=[];
  if(!e)return copy;
  for(const key of histories)if(key in e)e[key]=[];
  // Old successful synthesis records may still be needed by LegendForge.repair.
  if(Array.isArray(e.synthesisLog))e.synthesisLog=e.synthesisLog.filter(r=>r.success&&r.inheritanceVersion!==1);
  const instances=e.instances;
  if(!instances)return copy;
  const keep=new Set(),seen=new WeakSet();
  function visit(value){
   if(typeof value==='string'){
    if(Object.hasOwn(instances,value))keep.add(value);
    for(const id of value.match(/xi_\d+/g)||[])if(Object.hasOwn(instances,id))keep.add(id);
   }else if(value&&typeof value==='object'&&!seen.has(value)){
    seen.add(value);
    for(const [key,entry]of Object.entries(value)){visit(key);visit(entry);}
   }
  }
  // Trace ownership, pending mail and unknown future fields without the archive.
  delete e.instances;visit(copy);e.instances=instances;
  for(const [id,item]of Object.entries(instances))if(!item.dismantled&&!item.mergedInto)keep.add(id);
  // Set iteration includes newly discovered references, preserving their closure.
  for(const id of keep)visit(instances[id]);
  e.instances=Object.fromEntries(Object.entries(instances).filter(([id])=>keep.has(id)));
  return copy;
 }
 function stringify(player){return JSON.stringify(compact(player));}
 return {compact,stringify};
})();
if(typeof module!=='undefined')module.exports=SaveExport;
