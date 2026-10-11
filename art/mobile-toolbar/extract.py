from PIL import Image
import json, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2]; out=root/'src/assets/mobile-toolbar';out.mkdir(parents=True,exist_ok=True)
im=Image.open(root/'art/mobile-toolbar/source.png').convert('RGBA')
names=['sort','shop','forge','mail','sell','dismantle','organize','scroll','gem','merge','promote','inherit','save','back','left','right']
manifest={'version':1,'generator':'ComfyUI Qwen Image 2.1','prompt_id':'ddc542a4-2ce0-4071-8569-5767938da299','workflow':'art/mobile-toolbar/workflow.json','icons':[]}
for i,name in enumerate(names):
 x=(i%4)*im.width//4;y=(i//4)*im.height//4
 cell=im.crop((x,y,x+im.width//4,y+im.height//4));px=[]
 for r,g,b,a in cell.getdata():
  m=max(r,g,b);alpha=0 if m<18 else m
  px.append((min(255,round(r*255/m)),min(255,round(g*255/m)),min(255,round(b*255/m)),alpha) if alpha else (0,0,0,0))
 cell.putdata(px);box=cell.getbbox();cell=cell.crop(box);cell.thumbnail((204,204),Image.Resampling.LANCZOS)
 master=Image.new('RGBA',(256,256));master.alpha_composite(cell,((256-cell.width)//2,(256-cell.height)//2))
 master.save(out/(name+'-master.png'));master.resize((64,64),Image.Resampling.LANCZOS).save(out/(name+'.webp'),lossless=True)
 manifest['icons'].append({'asset_id':'mobile_toolbar_'+name,'master':name+'-master.png','runtime':name+'.webp','sha256':hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
