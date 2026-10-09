from pathlib import Path
from collections import deque
from PIL import Image
import numpy as np,json,csv,hashlib
root=Path(__file__).resolve().parents[1];source=root.parent/'comfy-art/dark'
jobs=json.loads((root/'art/dark-art-jobs.json').read_text(encoding='utf-8-sig'));assets=[]
for job in jobs:
 im=Image.open(source/(job['name']+'.png')).convert('RGB');w,h=im.size
 for i,c in enumerate(job['cells']):
  tile=im.crop((i%4*w//4+2,i//4*h//3+2,(i%4+1)*w//4-2,(i//4+1)*h//3-2));a=np.array(tile)
  white=(a.min(axis=2)>235)&((a.max(axis=2)-a.min(axis=2))<25);outside=np.zeros(white.shape,dtype=bool)
  outside[0,:]=white[0,:];outside[-1,:]=white[-1,:];outside[:,0]=white[:,0];outside[:,-1]=white[:,-1];queue=deque(zip(*np.where(outside)))
  while queue:
   y,x=queue.popleft()
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    yy,xx=y+dy,x+dx
    if 0<=yy<white.shape[0] and 0<=xx<white.shape[1] and white[yy,xx] and not outside[yy,xx]:outside[yy,xx]=True;queue.append((yy,xx))
  alpha=np.where(outside,0,255).astype(np.uint8);tile=Image.fromarray(np.dstack((a,alpha)));box=tile.getbbox()
  if not box:raise ValueError(c['id'])
  tile=tile.crop(box);tile.thumbnail((232,232),Image.Resampling.LANCZOS);master=Image.new('RGBA',(256,256));master.alpha_composite(tile,((256-tile.width)//2,(256-tile.height)//2));files=[]
  if c['id'].startswith('dark_legend_'):
   for folder,size in [('master',256),('runtime',64)]:
    file=root/'src/assets/economy'/folder/(c['id']+'.png');master.resize((size,size),Image.Resampling.LANCZOS).save(file,optimize=True);files.append(file)
  else:
   file=root/'src/assets/art'/(c['id']+'.webp');master.save(file,lossless=True);files.append(file)
  for file in files:assets.append(dict(asset_id=c['id'],path=str(file.relative_to(root)).replace('\\','/'),workflow='art/workflows/'+job['name']+'.json',cell=i,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
(root/'art/dark-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
with (root/'art/dark-assets.csv').open('w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f,fieldnames=assets[0].keys());writer.writeheader();writer.writerows(assets)
print('Processed 43 ComfyUI assets /',len(assets),'files')
