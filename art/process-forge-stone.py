from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
root=Path(__file__).resolve().parents[1];im=Image.open(root/'art/forge-stone-source.png').convert('RGB');a=np.array(im);white=(a.min(2)>180)&((a.max(2).astype(int)-a.min(2).astype(int))<100);bg=np.zeros(white.shape,dtype=bool)
from collections import deque
queue=deque([(10,im.width//2)]);bg[10,im.width//2]=True
while queue:
 y,x=queue.popleft()
 for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
  if 0<=yy<im.height and 0<=xx<im.width and white[yy,xx] and not bg[yy,xx]:
   bg[yy,xx]=True;queue.append((yy,xx))
alpha=np.full(a.shape[:2],255,dtype='uint8');alpha[bg]=0
rgba=np.dstack([a,alpha]);im=Image.fromarray(rgba);box=im.getbbox();im=im.crop(box);im.thumbnail((224,224),Image.Resampling.LANCZOS);master=Image.new('RGBA',(256,256));master.alpha_composite(im,((256-im.width)//2,(256-im.height)//2));out=root/'src/assets/materials';out.mkdir(parents=True,exist_ok=True);master.save(out/'forge-stone-master.png');master.resize((128,128),Image.Resampling.LANCZOS).save(out/'forge-stone.webp',quality=93,method=6);master.resize((64,64),Image.Resampling.LANCZOS).save(out/'forge-stone-64.png');print('Prepared transparent ComfyUI forge stone icon')

