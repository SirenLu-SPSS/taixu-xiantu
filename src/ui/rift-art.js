'use strict';
// ComfyUI-generated artwork is a presentation layer; combat/save rules remain in encounters.js.
const RiftArt=(()=>{
 const images=new Map(),floors=new Map();
 for(const theme of Encounters.themes){for(const role of ['floor','mob','elite','boss','rage']){const key=theme.id+'-'+role,image=new Image();image.decoding='async';image.src='./src/assets/art/rift-'+key+'.webp';images.set(key,image)}}
 const ready=key=>{const image=images.get(key);return image?.complete&&image.naturalWidth>0?image:null};
 const role=e=>e.boss?(e.transformed?'rage':'boss'):e.elite?'elite':'mob';
 const enemy=e=>ready(Encounters.themes[p.rift.theme].id+'-'+role(e));
 const dimensions=(image,size)=>{const scale=Math.min(size*2.8/image.naturalWidth,size*2.45/image.naturalHeight);return {w:image.naturalWidth*scale,h:image.naturalHeight*scale}};
 const oldFloor=riftFloor;riftFloor=function(index){const theme=Encounters.themes[index],image=ready(theme.id+'-floor');if(!image)return oldFloor(index);if(!floors.has(theme.id)){if(typeof riftFloors!=='undefined')riftFloors.delete(index);const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=900;const g=canvas.getContext('2d');g.drawImage(image,0,0,1500,900);floors.set(theme.id,canvas)}return floors.get(theme.id)};
 const oldEnemy=paintRiftEnemy;paintRiftEnemy=function(g,e,t,index,size,time){const image=ready(t.id+'-'+role(e));if(!image)return oldEnemy(g,e,t,index,size,time);const {w,h}=dimensions(image,size);g.save();g.translate(e.x,e.y);g.fillStyle='#06141e66';g.beginPath();g.ellipse(0,7,w*.32,Math.max(5,size*.19),0,0,Math.PI*2);g.fill();if(e.boss||e.elite){g.strokeStyle=e.transformed?'#ff8d6dab':t.accent+'80';g.lineWidth=e.boss?2:1;g.beginPath();g.ellipse(0,7,w*.43,Math.max(7,size*.26),0,0,Math.PI*2);g.stroke()}if(e.hit>0)g.globalAlpha=.74;g.scale(e.x>p.position.x?-1:1,1);g.drawImage(image,-w/2,8-h,w,h);g.restore()};
 const journey=updateJourney;updateJourney=function(){journey();const banner=document.querySelector('.scene-top');if(riftRunning){const theme=Encounters.themes[p.rift.theme];banner.style.backgroundImage='linear-gradient(110deg,#0c282bea,#0b223b9c),url("./src/assets/art/rift-'+theme.id+'-floor.webp")';banner.style.backgroundSize='cover';banner.style.backgroundPosition='center'}else{banner.style.removeProperty('background-image');banner.style.removeProperty('background-size');banner.style.removeProperty('background-position')}};
 const journal=encounterJournal;encounterJournal=function(){journal();document.querySelectorAll('.rift-codex>div').forEach((card,index)=>{const theme=Encounters.themes[index],image=document.createElement('img');image.className='rift-codex-boss';image.src='./src/assets/art/rift-'+theme.id+'-boss.webp';image.alt=theme.boss;card.append(image);card.style.backgroundImage='linear-gradient(100deg,#0b252aec,#0b252aba),url("./src/assets/art/rift-'+theme.id+'-floor.webp")';card.style.backgroundSize='cover'})};
 return {ready,enemy,dimensions,role};
})();
function riftEnemyLabelY(e,size){const image=RiftArt.enemy(e);return image?e.y+8-RiftArt.dimensions(image,size).h-18:e.y-size*1.6-18}


