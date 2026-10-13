const {test}=require('node:test');
const assert=require('node:assert/strict');
const Export=require('../src/systems/save-export.js');
test('export removes histories and retired orphans without changing live progress or pending rewards',()=>{
 const p={version:2,realm:8,stage:44,stones:999,inventory:[{id:'xi_1',count:1}],equipment:{weapon:'xi_1'},levelPet:{xi_2:200},ownedTreasures:['xi_3'],breakthroughHistory:[{success:true}],future:{item:'xi_7'},economy:{sequence:99,claims:{reward:true},fragmentClaims:{fragment:true},mail:['xi_4'],synthesisLog:[],drops:[{rewards:['xi_5']}],forgeLog:[{id:'xi_5'}],instances:{xi_1:{sockets:['gem_1'],affixes:[{value:2}],source:'inherited xi_8'},xi_2:{level:200},xi_3:{level:50},xi_4:{dismantled:true},xi_5:{dismantled:true},xi_6:{mergedInto:'xi_1'},xi_7:{dismantled:true},xi_8:{mergedInto:'xi_1'},xi_9:{level:1}}}};
 const before=JSON.stringify(p),result=JSON.parse(Export.stringify(p));
 assert.equal(JSON.stringify(p),before);
 assert.deepEqual(Object.keys(result.economy.instances),['xi_1','xi_2','xi_3','xi_4','xi_7','xi_8','xi_9']);
 for(const id of Object.keys(result.economy.instances))assert.deepEqual(result.economy.instances[id],p.economy.instances[id]);
 for(const key of ['realm','stage','stones','inventory','equipment','levelPet','ownedTreasures','future'])assert.deepEqual(result[key],p[key]);
 for(const key of ['sequence','claims','fragmentClaims','mail'])assert.deepEqual(result.economy[key],p.economy[key]);
 assert.deepEqual(result.economy.drops,[]);assert.deepEqual(result.breakthroughHistory,[]);
 assert.equal(Export.stringify(result),Export.stringify(p));
});
test('export preserves pending legacy synthesis repairs and their consumed source items',()=>{
 const p={economy:{synthesisLog:[{success:true,ids:['xi_1'],result:'xi_2'},{success:true,inheritanceVersion:1},{success:false}],instances:{xi_1:{mergedInto:'xi_2'},xi_2:{quality:4},xi_3:{dismantled:true}}}};
 const result=Export.compact(p);
 assert.equal(result.economy.synthesisLog.length,1);
 assert.deepEqual(Object.keys(result.economy.instances),['xi_1','xi_2']);
});
test('legacy save without economy retains its data',()=>{
 const p={version:2,realm:3,inventory:[],equipment:{},custom:{enabled:true}};
 assert.deepEqual(Export.compact(p),p);
});
