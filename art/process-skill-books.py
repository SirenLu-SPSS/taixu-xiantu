from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import numpy as np,json
root=Path(__file__).resolve().parents[1];out=root/'src/assets/skill-books';out.mkdir(parents=True,exist_ok=True)
categories=['attack','defense','cultivation','area','general'];manifest=[]
for kind in ['book','fragment']:
 atlas=Image.open(root/f'art/skill-books/{kind}-source.png').convert('RGB')
 for i,cat in enumerate(categories):
  x=i%3;y=i//3;im=atlas.crop((round(x*atlas.width/3),round(y*atlas.height/2),round((x+1)*atlas.width/3),round((y+1)*atlas.height/2)));a=np.array(im);white=(a.min(2)>232)&((a.max(2).astype(int)-a.min(2).astype(int))<24);bg=np.zeros(white.shape,dtype=bool);q=deque()
  for yy in range(im.height):
   for xx in [0,im.width-1]:
    if white[yy,xx]:bg[yy,xx]=True;q.append((yy,xx))
  for xx in range(im.width):
   for yy in [0,im.height-1]:
    if white[yy,xx] and not bg[yy,xx]:bg[yy,xx]=True;q.append((yy,xx))
  while q:
   yy,xx=q.popleft()
   for yn,xn in [(yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)]:
    if 0<=yn<im.height and 0<=xn<im.width and white[yn,xn] and not bg[yn,xn]:bg[yn,xn]=True;q.append((yn,xn))
  alpha=np.full(white.shape,255,dtype='uint8');alpha[bg]=0;im=Image.fromarray(np.dstack([a,alpha]));im=im.crop(im.getbbox());im.thumbnail((224,224),Image.Resampling.LANCZOS);master=Image.new('RGBA',(256,256));master.alpha_composite(im,((256-im.width)//2,(256-im.height)//2));master.save(out/f'{kind}-{cat}-master.png');master.resize((128,128),Image.Resampling.LANCZOS).save(out/f'{kind}-{cat}.webp',quality=93,method=6);manifest.append({'kind':kind,'category':cat,'generator':'ComfyUI','workflow':f'art/skill-books/{kind}-workflow.json','source':f'art/skill-books/{kind}-source.png','runtime':f'src/assets/skill-books/{kind}-{cat}.webp'})
(root/'art/skill-books/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
preview=Image.new('RGB',(5*160,2*180),'#123238');draw=ImageDraw.Draw(preview)
for j,kind in enumerate(['book','fragment']):
 for i,cat in enumerate(categories):
  im=Image.open(out/f'{kind}-{cat}.webp');preview.paste(im,(i*160+16,j*180+10),im);draw.text((i*160+12,j*180+145),kind+' '+cat,fill='#eed4a2')
preview.save(root/'art/skill-books/preview.png')
print('Prepared 10 transparent ComfyUI book / fragment icons')
