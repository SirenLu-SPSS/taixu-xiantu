from PIL import Image
import numpy as np
from pathlib import Path
import hashlib,json
source=Image.open('art/realm-auras/source.png').convert('RGB')
out=Path('src/assets/realm-auras');out.mkdir(parents=True,exist_ok=True)
manifest=[]
for i in range(9):
 x,y=i%3,i//3
 tile=source.crop((round(x*source.width/3),round(y*source.height/3),round((x+1)*source.width/3),round((y+1)*source.height/3))).resize((256,256),Image.Resampling.LANCZOS)
 rgb=np.asarray(tile).astype(float);v=rgb.max(axis=2);alpha=np.clip((v-15)/240,0,1)
 # Unpremultiply the black backdrop to retain soft emitted light without dark rectangles.
 color=np.clip(rgb/np.maximum(alpha[:,:,None],.001),0,255)
 rgba=np.dstack((color,alpha*255)).astype('uint8');im=Image.fromarray(rgba,'RGBA');path=out/f'realm-{i}.webp';im.save(path,lossless=True)
 manifest.append({'realm':i,'path':str(path).replace('\\','/'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
Path('art/realm-auras/manifest.json').write_text(json.dumps(manifest,indent=2))
print('Processed 9 transparent realm aura textures')
