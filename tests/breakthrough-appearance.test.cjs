const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const B=require('../src/systems/breakthrough.js');
test('breakthrough portrait follows all four current appearance genders across nine realms',()=>{
 const source=fs.readFileSync('src/ui/v3.js','utf8');const list=source.match(/const PORTRAITS=(\[[^;]+\]);/)[1];const portraits=vm.runInNewContext(list);
 const genders={sword:'male',sage:'male',jade:'female',moon:'female'};
 for(const p of portraits){assert.equal(p.gender,genders[p.id]);for(let realm=0;realm<9;realm++)assert.equal(B.portraitAsset(p,realm),'./src/assets/breakthrough/meditation-'+(p.gender==='male'?'male-':'')+realm+'.webp');}
 assert.equal(B.portraitAsset(portraits.find(p=>p.id==='sword'),3),'./src/assets/breakthrough/meditation-male-3.webp');
 assert.equal(B.portraitAsset(portraits.find(p=>p.id==='moon'),3),'./src/assets/breakthrough/meditation-3.webp');
});
