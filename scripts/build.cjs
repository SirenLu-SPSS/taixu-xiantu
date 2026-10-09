const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const file of ['src/data/catalog.js','src/data/economy.js','src/systems/economy.js','src/ui/economy.js','src/ui/economy-drops.js','src/systems/character.js','src/ui/character.js','src/systems/progression.js','src/systems/companions.js','src/ui/companions.js','src/systems/encounters.js','src/ui/encounters.js','src/ui/rift-art.js','src/game.js','src/ui/v3.js','src/ui/battle-art.js']) new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
for(const name of ['portrait-sword','portrait-jade','portrait-sage','portrait-moon','mountains','icon-sword','icon-fire','icon-herb','icon-cauldron','icon-taiji','icon-bag','icon-fox','icon-pearl','icon-map','hero-sword','hero-jade','hero-sage','hero-moon','creature-wolf','creature-treant','creature-fox','prop-bamboo','prop-rock','prop-pavilion','prop-grass','forest-floor']){const asset=path.join(root,'src/assets/art',name+'.webp');if(!fs.existsSync(asset)||fs.statSync(asset).size<100)throw new Error('Missing artwork: '+name);}
for(const theme of ['ember','frost','grove','sand','void'])for(const role of ['floor','mob','elite','boss','rage']){const asset=path.join(root,'src/assets/art','rift-'+theme+'-'+role+'.webp');if(!fs.existsSync(asset)||fs.statSync(asset).size<100)throw Error('Missing rift artwork: '+asset);}
for(const name of ['character-backdrop',...['sword','jade','sage','moon'].flatMap(id=>['character-body-'+id,'character-outfit-'+id]),...Array.from({length:16},(_,i)=>'character-item-'+i),...Array.from({length:8},(_,i)=>'character-companion-'+i)])if(!fs.existsSync(path.join(root,'src/assets/art',name+'.webp')))throw Error('Missing character art '+name);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'dist/index.html'));
fs.cpSync(path.join(root,'src'),path.join(root,'dist/src'),{recursive:true});
console.log('Built static game in dist/');

