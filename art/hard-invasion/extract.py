from PIL import Image
from pathlib import Path
import json,hashlib
im=Image.open('art/hard-invasion/source.png').convert('RGBA');out=Path('src/assets/hard-invasion');out.mkdir(parents=True,exist_ok=True);names=['portal0','portal1','portal2','portal3','cultivator','beast','elite','boss','minion','chest','spell','panel'];manifest={'version':1,'generator':'ComfyUI Qwen Image 2.1','prompt_id':'67e683c1-4093-4b35-a42f-9eb29acfb243','portal_animation':{'frames':names[:4],'fps':4},'assets':[]}
for i,name in enumerate(names):
 cell=im.crop(((i%4)*im.width//4,(i//4)*im.height//3,(i%4+1)*im.width//4,(i//4+1)*im.height//3));pixels=[]
 for r,g,b,a in cell.getdata():
  m=max(r,g,b);alpha=min(255,m*3) if m>15 else 0;pixels.append((min(255,round(r*255/alpha)),min(255,round(g*255/alpha)),min(255,round(b*255/alpha)),alpha) if alpha else (0,0,0,0))
 cell.putdata(pixels);cell.thumbnail((256,256),Image.Resampling.LANCZOS);master=Image.new('RGBA',(256,256));master.alpha_composite(cell,((256-cell.width)//2,(256-cell.height)//2));master.save(out/(name+'.webp'),lossless=True);manifest['assets'].append({'asset_id':'hard_invasion_'+name,'file':name+'.webp','sha256':hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
