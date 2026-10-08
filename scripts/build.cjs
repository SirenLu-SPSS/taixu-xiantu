const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const file of ['src/data/catalog.js','src/game.js']) new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'dist/index.html'));
fs.cpSync(path.join(root,'src'),path.join(root,'dist/src'),{recursive:true});
console.log('Built static game in dist/');
