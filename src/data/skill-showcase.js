'use strict';
const SkillShowcase=(()=>{const ids=['attack','flame','sword','heal','heart',...Array.from({length:30},(_,i)=>'v21_skill_'+i)];const known=new Set(ids);return {ids,asset:id=>known.has(id)?'./src/assets/desktop-skills/'+id+'.webp':null};})();
if(typeof module!=='undefined')module.exports=SkillShowcase;
