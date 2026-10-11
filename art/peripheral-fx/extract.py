from PIL import Image
import json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'src/assets/peripheral-fx';out.mkdir(parents=True,exist_ok=True)
im=Image.open(root/'art/peripheral-fx/source.png').convert('RGBA');names=['sword','tracking','frost','thunder','burn','shield','heal','mana','domain'];entries=[]
for i,name in enumerate(names):
 x=i%3*im.width//3;y=i//3*im.height//3;cell=im.crop((x,y,x+im.width//3,y+im.height//3)).resize((256,256),Image.Resampling.LANCZOS);pixels=[]
 for n,(r,g,b,a) in enumerate(cell.getdata()):
  m=max(r,g,b);dx=n%256-127.5;dy=n//256-127.5
  alpha=0 if m<12 or dx*dx+dy*dy<74*74 else m
  pixels.append((min(255,round(r*255/m)),min(255,round(g*255/m)),min(255,round(b*255/m)),alpha) if alpha else (0,0,0,0))
 cell.putdata(pixels);cell.save(out/(name+'.webp'),lossless=True);entries.append({'asset_id':'peripheral_fx_'+name,'file':name+'.webp','sha256':hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps({'version':1,'generator':'ComfyUI Qwen Image 2.1','workflow':'art/peripheral-fx/workflow.json','animation':{'duration':.45,'start_scale':.72,'end_scale':1.27,'opacity':.5,'center_clear_radius':74,'world_space':True},'effects':entries},indent=2),encoding='utf8')
