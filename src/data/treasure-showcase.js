'use strict';
const TreasureShowcase=(()=>{
 const ids=[...Array.from({length:12},(_,i)=>'treasure_'+i),...Array.from({length:30},(_,i)=>'v21_treasure_'+i)];
 const available=new Set(ids),aliases={mirror:'treasure_5',dagger:'treasure_0',bell:'treasure_2',gourd:'treasure_7'};
 function asset(baseId){const id=aliases[baseId]||baseId;return available.has(id)?'./src/assets/desktop-treasure/'+id+'.webp':null;}
 return {ids,asset};
})();
if(typeof module!=='undefined')module.exports=TreasureShowcase;
