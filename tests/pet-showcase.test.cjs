const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Showcase=require('../src/data/pet-showcase.js'),Economy=require('../src/data/economy.js'),High=require('../src/data/high-realms.js');
test('every basic and high realm pet has its own high resolution artwork',()=>{
 const pets=[...Object.values(Economy.templates),...High.templates].filter(t=>t.type==='pet');assert.equal(pets.length,42);assert.equal(new Set(Showcase.ids).size,42);
 for(const t of pets){const asset=Showcase.asset(t.id);assert.equal(asset,'./src/assets/desktop-pets/'+t.id+'.webp');const bytes=fs.readFileSync(path.resolve(__dirname,'..',asset));assert.ok(bytes.length>10000,t.name);assert.equal(bytes.toString('ascii',8,12),'WEBP');}
});
test('legacy pet appearances map to matching species, unknown species never reuse another pet',()=>{
 for(const [id,target]of Object.entries({fox:0,turtle:6,falcon:3,dragon:10}))assert.equal(Showcase.asset(id),Showcase.asset('pet_'+target));assert.equal(Showcase.asset('future_pet'),null);
});
