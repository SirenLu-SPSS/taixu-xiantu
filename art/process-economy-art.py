"""Slice approved ComfyUI atlases. Remove connected white background only.
Keep master/runtime RGBA PNGs, reproducible hashes and a full asset manifest.
"""
from pathlib import Path
from collections import deque
import json,hashlib,sys
import numpy as np
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
jobs=json.loads((root/'art/economy-art-jobs.json').read_text(encoding='utf-8'))['jobs']
jewelry_only='--jewelry-only' in sys.argv
def jewelry(asset_id):return any(asset_id.startswith('gear_'+slot+'_') for slot in ['necklace','bracelet','ring'])
manifest=json.loads((root/'art/economy-art-manifest.json').read_text(encoding='utf-8'))['assets'] if jewelry_only else []
if jewelry_only:manifest=[entry for entry in manifest if not jewelry(entry['asset_id'])]
for job in jobs:
 file=source/(job['name']+'.png')
 if not file.exists():
  if '--partial' in sys.argv:continue
  raise FileNotFoundError(file)
 image=Image.open(file).convert('RGB');w,h=image.size
 for i,asset_id in enumerate(job['ids']):
  if jewelry_only and not jewelry(asset_id):continue
  x,y=i%4,i//4
  tile=image.crop((x*w//4+2,y*h//3+2,(x+1)*w//4-2,(y+1)*h//3-2))
  pixels=np.array(tile)
  allowed=(pixels.min(axis=2)>237)&((pixels.max(axis=2)-pixels.min(axis=2))<25)
  outside=np.zeros(allowed.shape,dtype=bool)
  outside[0,:]=allowed[0,:];outside[-1,:]=allowed[-1,:]
  outside[:,0]=allowed[:,0];outside[:,-1]=allowed[:,-1]
  queue=deque(zip(*np.where(outside)))
  while queue:
   yy,xx=queue.popleft()
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    ny,nx=yy+dy,xx+dx
    if 0<=ny<allowed.shape[0] and 0<=nx<allowed.shape[1] and allowed[ny,nx] and not outside[ny,nx]:
     outside[ny,nx]=True;queue.append((ny,nx))
  alpha=np.full(allowed.shape,255,dtype=np.uint8);alpha[allowed if jewelry(asset_id) else outside]=0
  tile=Image.fromarray(np.dstack((pixels,alpha)))
  bbox=tile.getbbox()
  if not bbox:raise ValueError('Empty asset '+asset_id)
  tile=tile.crop(bbox);tile.thumbnail((224,224),Image.Resampling.LANCZOS)
  master=Image.new('RGBA',(256,256),(0,0,0,0));master.alpha_composite(tile,((256-tile.width)//2,(256-tile.height)//2))
  # Gem tier notation supplements the model's own increasing glow; functional color stays untouched.
  if asset_id.startswith('gem_'):
   tier=int(asset_id.rsplit('_',1)[1]);draw=ImageDraw.Draw(master)
   for star in range(tier):
    cx=128+(star-(tier-1)/2)*20
    draw.polygon([(cx,232),(cx+5,238),(cx,244),(cx-5,238)],fill=(239,224,172,255))
  files={}
  for folder,size in [('master',256),('runtime',64)]:
   target=root/'src/assets/economy'/folder/(asset_id+'.png');target.parent.mkdir(parents=True,exist_ok=True)
   output=master if size==256 else master.resize((64,64),Image.Resampling.LANCZOS)
   output.save(target,optimize=True)
   files[folder]={'path':str(target.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'size':[size,size],'mode':output.mode}
  manifest.append({'asset_id':asset_id,'version':'economy-v2.0','workflow':'art/workflows/economy-'+job['name']+'-api.json','atlas':job['name'],'cell':i,**files})
  print(asset_id,flush=True)
(root/'art/economy-art-manifest.json').write_text(json.dumps({'generator':'ComfyUI Qwen Image 2.1','version':'economy-v2.0','assets':manifest},ensure_ascii=False,indent=2),encoding='utf-8')
if len(manifest)==222:
 preview=Image.new('RGB',(16*100,14*112),'#102b30');draw=ImageDraw.Draw(preview)
 for i,entry in enumerate(manifest):
  icon=Image.open(root/entry['master']['path']).resize((88,88),Image.Resampling.LANCZOS)
  x=(i%16)*100+6;y=(i//16)*112+3;preview.paste(icon,(x,y),icon)
  draw.text((x,y+88),entry['asset_id'].replace('gear_','').replace('gem_','')[:16],fill='#e5d1a3')
 outputs=root.parents[1]/'outputs';outputs.mkdir(exist_ok=True);preview.save(outputs/'economy-icons-preview.png')
print('Processed',len(manifest),'unique ComfyUI assets')
