'use strict';
const SkillBooks=(()=>{
 const categories=[['attack','攻擊'],['defense','防禦'],['cultivation','修為'],['area','範圍'],['general','綜合']];
 function category(skill){if(['chain','burn','multi','slow','aoe','meteor','silence'].includes(skill.mode))return 'area';if(['shield','armor','cleanse','heal','revive'].includes(skill.mode))return 'defense';if(['cultivate','mana'].includes(skill.mode))return 'cultivation';if(['strike','dashStrike','pierce'].includes(skill.mode))return 'attack';return 'general';}
 function find(id,skills){return skills.find(s=>s.bookId===id||'v21_fragment_'+s.id.split('_').at(-1)===id);}
 function icon(id,skills){const s=find(id,skills);return s?'./src/assets/skill-books/'+(id.startsWith('v21_fragment_')?'fragment':'book')+'-'+category(s)+'.webp':null;}
 return {categories,category,find,icon};
})();
if(typeof module!=='undefined')module.exports=SkillBooks;
