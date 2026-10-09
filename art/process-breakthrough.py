from pathlib import Path
import json,hashlib,csv
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=root.parent/'comfy-art/breakthrough'
out=root/'src/assets/breakthrough';out.mkdir(parents=True,exist_ok=True)
assets=[]
for outcome in ['success','failure']:
 im=Image.open(source/(outcome+'.png')).convert('RGBA');w,h=im.size
 for i in range(12):
  if i>=9 and outcome=='failure':continue
  name=f'{outcome}-{i}' if i<9 else ['celestial-pill','thunder','shield'][i-9]
  tile=im.crop((i%4*w//4+3,i//4*h//3+3,(i%4+1)*w//4-3,(i//4+1)*h//3-3)).resize((256,256),Image.Resampling.LANCZOS)
  # ComfyUI effects remain on black for screen blending; pill uses alpha for UI.
  if name=='celestial-pill':
   data=list(tile.getdata());tile.putdata([(r,g,b,min(255,max(r,g,b)*5)) for r,g,b,a in data])
  file=out/(name+'.png');tile.save(file,optimize=True)
  assets.append(dict(asset_id='breakthrough_'+name,path=str(file.relative_to(root)).replace('\\','/'),generator='ComfyUI Qwen Image 2.1',workflow='art/workflows/breakthrough-'+outcome+'.json',cell=i,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
(root/'art/breakthrough-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
with (root/'art/breakthrough-assets.csv').open('w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f,fieldnames=assets[0].keys());writer.writeheader();writer.writerows(assets)
print('Processed',len(assets),'ComfyUI effects')
