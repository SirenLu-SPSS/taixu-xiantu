const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('hard invasion HUD disappears after two chests, retains unfinished archive and battle',()=>{
 const source=fs.readFileSync('src/ui/hard-invasion.js','utf8');const body=source.slice(source.indexOf('function hardUpdateHud()'),source.indexOf('\n',source.indexOf('function hardUpdateHud()')));
 const hud={hidden:false,dataset:{},innerHTML:'',insertAdjacentHTML(){}};let event;
 const ctx={hardUpdateCountdown(){},hardEvent:()=>event,p:{hardMode:true,hardInvasion:{rewards:[]}},mapIndex:4,enemies:[],hardHud:hud,$:()=>({}),showHardChests(){}};vm.createContext(ctx);vm.runInContext(body,ctx);
 const chests=n=>Array.from({length:5},(_,i)=>({opened:i<n}));
 event={id:'a',status:'cleared',chests:chests(1)};ctx.hardUpdateHud();assert.equal(hud.hidden,false);
 event.chests=chests(2);ctx.hardUpdateHud();assert.equal(hud.hidden,true);
 ctx.p.hardInvasion.rewards=[{id:'b',map:4,chests:chests(0)}];ctx.hardUpdateHud();assert.equal(hud.hidden,false);
 ctx.p.hardInvasion.rewards=[];event={id:'c',status:'battle',wave:30,chests:[]};ctx.hardUpdateHud();assert.equal(hud.hidden,false);
 event=null;ctx.hardUpdateHud();assert.equal(hud.hidden,true);
});
