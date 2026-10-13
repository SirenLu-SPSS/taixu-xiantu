'use strict';
const PetShowcase=(()=>{
 const ids=[...Array.from({length:12},(_,i)=>'pet_'+i),...Array.from({length:30},(_,i)=>'v21_pet_'+i)];
 const available=new Set(ids),aliases={fox:'pet_0',turtle:'pet_6',falcon:'pet_3',dragon:'pet_10'};
 function asset(baseId){const id=aliases[baseId]||baseId;return available.has(id)?'./src/assets/desktop-pets/'+id+'.webp':null;}
 return {ids,asset};
})();
if(typeof module!=='undefined')module.exports=PetShowcase;
