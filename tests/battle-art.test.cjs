const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const renderer=fs.readFileSync(path.join(__dirname,'../src/ui/battle-art.js'),'utf8');
test('battle presentation renders all maps and effects without changing gameplay state',()=>{
 let draws=0;
 const finite=args=>args.filter(value=>typeof value==='number').forEach(value=>assert.ok(Number.isFinite(value)));
 const gradient={addColorStop(){}};
 const g=new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='createLinearGradient'||key==='createRadialGradient')return (...args)=>{finite(args);return gradient};if(key==='arc')return (...args)=>{finite(args);assert.ok(args[2]>=0)};if(key==='ellipse')return (...args)=>{finite(args);assert.ok(args[2]>=0&&args[3]>=0)};if(key==='drawImage')return (...args)=>{finite(args);draws++};return (...args)=>finite(args)},set(target,key,value){target[key]=value;return true}});
 class Image {constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=160}}
 const p={position:{x:460,y:355},portrait:'jade',activePet:'fox',hp:188,mp:90,stones:500,exploration:{visited:{}}};
 const enemies=[{x:490,y:350,hp:40,maxHp:125,name:'翠林山精',hit:.18}];
 const effects=['sword','fire','heal','break','cast'].map(kind=>({x:480,y:350,t:1.4,kind}));
 const context=vm.createContext({Image,Map,Math,console,p,enemies,effects,projectiles:[{x:460,y:340,target:enemies[0],kind:'fire'},{x:460,y:340,target:enemies[0],kind:'sword'}],mapIndex:0,cam:{x:0,y:0},destination:{x:740,y:500},document:{createElement:()=>({getContext:()=>g})},window:{matchMedia:()=>({matches:false})},clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),seeded:n=>(Math.sin(n)*.5+.5),selectedPortrait:()=>({id:'jade'}),currentPoints:()=>[{id:'spring',kind:'spring',name:'泉',x:460,y:260},{id:'herbs',kind:'herbs',name:'草',x:740,y:500},{id:'ore',kind:'ore',name:'礦',x:280,y:610},{id:'ruins',kind:'ruins',name:'秘',x:1130,y:425}],drawCharacter(){},drawCreature(){},drawPet(){},drawScene(){},drawGround(){},drawLandmarks(){}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/systems/progression.js'),'utf8'),context);
 vm.runInContext(renderer,context);
 const before=JSON.stringify({p,enemies,effects});context.g=g;
 for(let map=0;map<5;map++){context.mapIndex=map;vm.runInContext('drawScene(g,335,324,2);drawScene(g,1000,460,3)',context)}
 assert.equal(JSON.stringify({p,enemies,effects}),before);
 assert.ok(draws>0);
});
