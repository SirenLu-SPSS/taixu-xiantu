import sys,json,csv,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);out=root/'src/assets/quality-frames';out.mkdir(parents=True,exist_ok=True)
records=[]
def clean(im):
 a=np.array(im.convert('RGB'));v=a.max(2);ys,xs=np.where(v>45)
 if not len(xs): raise ValueError('Empty ComfyUI frame')
 im=im.crop((max(0,xs.min()-2),max(0,ys.min()-2),min(im.width,xs.max()+3),min(im.height,ys.max()+3))).convert('RGBA').resize((256,256),Image.Resampling.LANCZOS)
 a=np.array(im);v=a[:,:,:3].max(2).astype(float);a[:,:,3]=np.clip((v-12)*255/85,0,255).astype('uint8')
 im=Image.fromarray(a);ImageDraw.Draw(im).rectangle((32,32,223,223),fill=(0,0,0,0));return im
for name in ['white','blue','purple','gold','legend']:
 raw=Image.open(source/('basic.png' if name in ['white','blue','purple'] else name+'.png'))
 if name in ['white','blue','purple']:
  i=['white','blue','purple'].index(name);base=clean(raw.crop((i*raw.width//3,0,(i+1)*raw.width//3,raw.height)));frames=[]
  for phase in range(8):
   a=np.array(base);a[:,:,:3]=np.clip(a[:,:,:3].astype(float)*(.88+.12*np.sin(phase*np.pi/4)),0,255).astype('uint8');frames.append(Image.fromarray(a))
 else:
  base=clean(raw.crop((0,0,raw.width//(6 if name=='gold' else 4),raw.height//(5 if name=='gold' else 4))));frames=[]
  # Animate ComfyUI's ornamental perimeter without changing geometry between frames.
  yy,xx=np.mgrid[:256,:256];angle=np.arctan2(yy-127.5,xx-127.5)
  for phase in range(16):
   a=np.array(base);light=.72+.65*np.maximum(0,np.cos(angle-phase*np.pi/8))**8
   a[:,:,:3]=np.clip(a[:,:,:3].astype(float)*light[:,:,None],0,255).astype('uint8');frames.append(Image.fromarray(a))
 for i,f in enumerate(frames):f.save(out/(name+f'-master-{i:02}.png'))
 small=[f.resize((128,128),Image.Resampling.LANCZOS) for f in frames]
 small[0].save(out/(name+'.webp'),save_all=len(small)>1,append_images=small[1:],duration=150,loop=0,quality=90,method=6)
 small[0].save(out/(name+'-still.webp'),quality=90)
 records.append(dict(asset_id='quality_frame_'+name,file='src/assets/quality-frames/'+name+'.webp',frames=len(frames),duration_ms=len(frames)*150 if len(frames)>1 else 0,source='ComfyUI Qwen Image 2.1',sha256=hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()))
(root/'art/quality-frames.json').write_text(json.dumps(records,indent=2),encoding='utf8')
with (root/'art/quality-frames.csv').open('w',newline='',encoding='utf8') as f:
 w=csv.DictWriter(f,fieldnames=records[0].keys());w.writeheader();w.writerows(records)
print('Processed',len(records),'ComfyUI frame assets')

