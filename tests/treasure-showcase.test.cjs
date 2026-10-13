const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Showcase=require('../src/data/treasure-showcase.js'),Economy=require('../src/data/economy.js'),High=require('../src/data/high-realms.js');
test('every basic and high realm treasure has its own high resolution showcase',()=>{
 const treasures=[...Object.values(Economy.templates),...High.templates].filter(t=>t.type==='treasure');
 assert.equal(treasures.length,42);assert.equal(new Set(Showcase.ids).size,42);
 for(const t of treasures){const asset=Showcase.asset(t.id);assert.equal(asset,'./src/assets/desktop-treasure/'+t.id+'.webp',t.name);const bytes=fs.readFileSync(path.resolve(__dirname,'..',asset));assert.ok(bytes.length>10000,t.name+' image must not be an icon placeholder');assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
});
test('legacy treasure aliases remain recognizable and unknown art never uses a mismatched treasure',()=>{
 for(const [id,target]of Object.entries({mirror:5,dagger:0,bell:2,gourd:7}))assert.equal(Showcase.asset(id),Showcase.asset('treasure_'+target));
 assert.equal(Showcase.asset('v21_treasure_7'),'./src/assets/desktop-treasure/v21_treasure_7.webp');
 assert.equal(Showcase.asset('unknown_future_treasure'),null);
});
