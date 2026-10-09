"""Slice the ComfyUI atlases; remove only connected dark background pixels."""
from pathlib import Path
from PIL import Image
import numpy as np
from collections import deque
import hashlib,json,sys
source=Path(sys.argv[1]);target=Path(__file__).resolve().parents[1]/'src/assets/art'
manifest=[]
for name,columns,rows,prefix in [('icons',4,4,'item'),('companions',4,3,'companion')]:
 image=Image.open(source/(name+'.png')).convert('RGB');w,h=image.size
 for i in range(16 if name=='icons' else 8):
  x,y=i%columns,(i//columns if name=='icons' else (0 if i<4 else 2))
  crop=image.crop((x*w//columns+3,y*h//rows+3,(x+1)*w//columns-3,(y+1)*h//rows-3))
  data=np.array(crop);allowed=data.max(axis=2)<62
  seed=np.zeros(allowed.shape,dtype=bool);seed[0,:]=allowed[0,:];seed[-1,:]=allowed[-1,:];seed[:,0]=allowed[:,0];seed[:,-1]=allowed[:,-1]
  outside=seed&allowed;queue=deque(zip(*np.where(outside)))
  while queue:
   yy,xx=queue.popleft()
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    ny,nx=yy+dy,xx+dx
    if 0<=ny<allowed.shape[0] and 0<=nx<allowed.shape[1] and allowed[ny,nx] and not outside[ny,nx]:
     outside[ny,nx]=True;queue.append((ny,nx))
  alpha=np.full(allowed.shape,255,dtype=np.uint8);alpha[outside]=0
  crop=Image.fromarray(np.dstack((data,alpha)))
  bbox=crop.getbbox()
  if bbox:crop=crop.crop(bbox)
  crop.thumbnail((192,192))
  file=target/f'character-{prefix}-{i}.webp';crop.save(file,'WEBP',quality=88,method=6)
  manifest.append({'asset':file.name,'atlas':name,'cell':i,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
image=Image.open(source/'backdrop.png');image.thumbnail((1024,1024));file=target/'character-backdrop.webp';image.save(file,'WEBP',quality=85,method=6)
manifest.append({'asset':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
for atlas in ['bodies','outfits']:
 image=Image.open(source/(atlas+'.png')).convert('RGB');w,h=image.size
 for i,name in enumerate(['sword','jade','sage','moon']):
  x,y=i%2,i//2;crop=image.crop((x*w//2,y*h//2,(x+1)*w//2,(y+1)*h//2));data=np.array(crop)
  allowed=(data.min(axis=2)>238)&((data.max(axis=2)-data.min(axis=2))<24)
  outside=np.zeros(allowed.shape,dtype=bool);outside[0,:]=allowed[0,:];outside[-1,:]=allowed[-1,:];outside[:,0]=allowed[:,0];outside[:,-1]=allowed[:,-1];queue=deque(zip(*np.where(outside)))
  while queue:
   yy,xx=queue.popleft()
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    ny,nx=yy+dy,xx+dx
    if 0<=ny<allowed.shape[0] and 0<=nx<allowed.shape[1] and allowed[ny,nx] and not outside[ny,nx]:outside[ny,nx]=True;queue.append((ny,nx))
  alpha=np.full(allowed.shape,255,dtype=np.uint8);alpha[outside]=0;crop=Image.fromarray(np.dstack((data,alpha)));bbox=crop.getbbox()
  if bbox:crop=crop.crop(bbox)
  file=target/f'character-{"body" if atlas=="bodies" else "outfit"}-{name}.webp';crop.save(file,'WEBP',quality=90,method=6)
  manifest.append({'asset':file.name,'atlas':atlas,'cell':i,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(Path(__file__).parent/'character-art-manifest.json').write_text(json.dumps({'generator':'ComfyUI Qwen Image 2.1','assets':manifest},indent=2),encoding='utf-8')
print('Processed',len(manifest),'ComfyUI assets')
