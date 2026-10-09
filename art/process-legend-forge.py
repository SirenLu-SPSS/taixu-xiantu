from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
root=Path(__file__).resolve().parents[1];src=root/'art/legend-forge-source.png';raw=Image.open(src).convert('RGB');out=root/'src/assets/legend-forge';out.mkdir(parents=True,exist_ok=True);rows=[]
for i,name in enumerate(['success','failure','ore','furnace']):
 c,r=i%2,i//2;im=raw.crop((c*raw.width//2,r*raw.height//2,(c+1)*raw.width//2,(r+1)*raw.height//2)).convert('RGBA');a=np.array(im);v=a[:,:,:3].max(2).astype(float);a[:,:,3]=np.clip((v-6)*255/30,0,255).astype('uint8');im=Image.fromarray(a);im.resize((256,256),Image.Resampling.LANCZOS).save(out/(name+'-master.png'));size=128 if name=='ore' else 256 if name=='furnace' else 512;im.resize((size,size),Image.Resampling.LANCZOS).save(out/(name+'.webp'),quality=92,method=6);rows.append(dict(asset_id='legend_forge_'+name,file='src/assets/legend-forge/'+name+'.webp',sha256=hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()))
(root/'art/legend-forge-assets.json').write_text(json.dumps(rows,indent=2),encoding='utf8');print('ComfyUI forge assets:',len(rows))
