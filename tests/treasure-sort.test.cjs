const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/ui/desktop-treasure.js'),'utf8');
test('desktop treasure sort supports power, realm, quality and level in descending order',()=>{
 const ctx=vm.createContext({equipmentItemPower:it=>it.power,quality:e=>e.item.quality,level:e=>e.item.level});
 vm.runInContext('let sortIndex=0;'+source.match(/ function sortValues[^\n]+/)[0]+source.match(/ function sortEntries[^\n]+/)[0],ctx);
 ctx.rows=[{id:'power',item:{power:100,realm:0,quality:0,level:1}},{id:'realm',item:{power:1,realm:8,quality:0,level:1}},{id:'quality',item:{power:2,realm:0,quality:4,level:1}},{id:'level',item:{power:3,realm:0,quality:0,level:300}}];
 for(let i=0;i<4;i++)assert.equal(vm.runInContext('sortIndex='+i+';[...rows].sort(sortEntries)[0].id',ctx),['power','realm','quality','level'][i]);
 assert.equal(ctx.rows[0].id,'power');
});
test('sort control cycles four criteria and no longer filters for arts',()=>{
 assert.ok(source.includes('sortIndex=(sortIndex+1)%4'));
 assert.ok(source.includes('data-dt-sort'));
 assert.ok(!source.includes("['arts','神通']"));
});
