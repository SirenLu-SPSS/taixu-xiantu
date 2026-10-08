const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const catalog=fs.readFileSync(path.join(root,'src/data/catalog.js'),'utf8');
const game=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
test('legacy v2 character survives loading with all progress and unknown fields',()=>{
 const context=vm.createContext({Date,Math,console});
 vm.runInContext(catalog,context);
 const initial=game.match(/function initialPlayer\(name,root\)\{[^\n]+/)[0];
 const load=game.match(/function load\(\)\{[^\n]+/)[0];
 vm.runInContext(initial,context);
 const player=vm.runInContext("initialPlayer('舊角色','sword')",context);
 Object.assign(player,{stones:9999,realm:2,stage:2,qi:1234,inventory:[{id:'ring',count:3}],equipment:{weapon:'sword',head:null,robe:'robe',boots:null,ring:'ring'},customFutureField:{keep:true}});
 context.raw=JSON.stringify(player);
 vm.runInContext("let p=null; const storage={getItem:()=>raw}; const SAVE='TAIXU_ASCEND_V2_SAVE'; const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)); const qiMax=()=>999999; const qps=()=>0; const note=()=>{};"+load,context);
 assert.equal(vm.runInContext('load()',context),true);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(p)',context)),JSON.parse(JSON.stringify(player)));
});
test('all extracted scripts parse and HTML loads catalog before game',()=>{
 new vm.Script(catalog); new vm.Script(game);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.ok(html.indexOf('./src/data/catalog.js')<html.indexOf('./src/game.js'));
 assert.match(game,/TAIXU_ASCEND_V2_SAVE/);
});
