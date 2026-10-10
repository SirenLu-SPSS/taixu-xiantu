from PIL import Image
import json, csv, os
from collections import deque
import numpy as np
base='art/v21'
assets=json.load(open(base+'/assets.json',encoding='utf-8'));jobs=json.load(open(base+'/jobs.json',encoding='utf-8'))
ready=[]
os.makedirs('src/assets/v21/master',exist_ok=True);os.makedirs('src/assets/v21/runtime',exist_ok=True)
for job in jobs:
 src=base+'/sources/'+job['name']+'.png'
 if not os.path.exists(src): continue
 image=Image.open(src).convert('RGBA')
 for i,a in enumerate(job['assets']):
  aid=a['asset_id']
  if job.get('floor'): tile=image.resize((1024,1024),Image.Resampling.LANCZOS)
  else:
   cell=i;atlas=image
   if job['name'].startswith('enemy_'):
    if i<8:cell=([0,1,3,4,5,6,7,15] if job['name']=='enemy_0' else [0,2,3,4,5,6,7,15])[i]
    if i%8==7:atlas=Image.open(base+'/sources/'+job['name'].replace('enemy_','boss_')+'.png').convert('RGBA');cell=i
   w,h=atlas.size;tile=atlas.crop(((cell%4)*w//4,(cell//4)*h//4,(cell%4+1)*w//4,(cell//4+1)*h//4)).resize((256,256),Image.Resampling.LANCZOS)
   ar=np.array(tile);rgb=ar[:,:,:3].astype(np.int16);white=(rgb.min(axis=2)>230)&((rgb.max(axis=2)-rgb.min(axis=2))<30);mask=np.zeros((256,256),dtype=bool);q=deque()
   for y in range(256):
    for x in [0,255]:
     if white[y,x] and not mask[y,x]:mask[y,x]=True;q.append((x,y))
   for x in range(256):
    for y in [0,255]:
     if white[y,x] and not mask[y,x]:mask[y,x]=True;q.append((x,y))
   while q:
    x,y=q.popleft()
    for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
     if 0<=nx<256 and 0<=ny<256 and white[ny,nx] and not mask[ny,nx]:mask[ny,nx]=True;q.append((nx,ny))
   ar[mask,3]=0;tile=Image.fromarray(ar)
   if np.count_nonzero(ar[:,:,3])<200:raise RuntimeError('Empty asset '+aid)
  tile.save('src/assets/v21/master/'+aid+'.png')
  size=a['runtime'];tile.resize((size,size),Image.Resampling.LANCZOS).save('src/assets/v21/runtime/'+aid+'.png')
  if a['category'] in ['treasure','pet','skill','material']:
   os.makedirs('src/assets/economy/runtime',exist_ok=True);tile.resize((64,64),Image.Resampling.LANCZOS).save('src/assets/economy/runtime/'+aid+'.png')
  ready.append(aid)
for a in assets:a['status']='validated' if a['asset_id'] in ready else 'pending'
with open(base+'/assets.csv','w',encoding='utf-8-sig',newline='') as f:
 fields=['asset_id','category','name','prompt','master_path','runtime_path','version','status'];out=csv.DictWriter(f,fieldnames=fields);out.writeheader()
 for a in assets:out.writerow(dict(asset_id=a['asset_id'],category=a['category'],name=a['name'],prompt=a['prompt'],master_path='src/assets/v21/master/'+a['asset_id']+'.png',runtime_path='src/assets/v21/runtime/'+a['asset_id']+'.png',version=1,status=a['status']))
open('src/data/v21-assets.js','w',encoding='utf-8').write('const V21Assets='+json.dumps(ready)+';\n')
print('Validated',len(ready),'of',len(assets))
