from PIL import Image
import numpy as np
from pathlib import Path
import json,hashlib,math
out=Path('src/assets/treasure-arts');out.mkdir(parents=True,exist_ok=True)
manifest={'version':'2.2.0','generator':'ComfyUI Qwen Image 2.1','icons':[],'effects':[]}
def tile(source,x,y,cols,rows):
 im=source.crop((round(x*source.width/cols),round(y*source.height/rows),round((x+1)*source.width/cols),round((y+1)*source.height/rows))).resize((256,256),Image.Resampling.LANCZOS)
 rgb=np.asarray(im.convert('RGB')).astype(float);alpha=np.clip((rgb.max(axis=2)-12)/243,0,1);rgb=np.clip(rgb/np.maximum(alpha[:,:,None],.001),0,255)
 return Image.fromarray(np.dstack((rgb,alpha*255)).astype('uint8'),'RGBA')
source=Image.open('art/treasure-arts/icons-source.png')
for i in range(60):
 aid=f'treasure_art_{i+1}';im=tile(source,i%10,i//10,10,6);im.save(out/f'{aid}-256.png');im.resize((64,64),Image.Resampling.LANCZOS).save(out/f'{aid}-64.png');manifest['icons'].append({'asset_id':aid,'version':1,'master':f'{aid}-256.png','runtime':f'{aid}-64.png','sha256':hashlib.sha256((out/f'{aid}-256.png').read_bytes()).hexdigest()})
source=Image.open('art/treasure-arts/effects-source.png')
for i,name in enumerate(['sword','tracking','frost','thunder','burn','shield','heal','mana','domain']):
 im=tile(source,i%3,i//3,3,3);im.save(out/f'fx-{name}.png');sheet=Image.new('RGBA',(512,512))
 for f in range(16):
  size=round(100+20*math.sin(f/15*math.pi));frame=Image.new('RGBA',(128,128));small=im.resize((size,size),Image.Resampling.LANCZOS);frame.alpha_composite(small,((128-size)//2,(128-size)//2));sheet.alpha_composite(frame,((f%4)*128,(f//4)*128))
 sheet.save(out/f'fx-{name}-sheet.png');manifest['effects'].append({'asset_id':'fx_'+name,'version':1,'sheet':f'fx-{name}-sheet.png','frames':16,'columns':4,'frame_width':128,'frame_height':128,'fps':20,'loop':name in ['tracking','burn','shield','domain'],'anchor':'center','coordinates':'world','blend':'source-over'})
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('60 transparent master/runtime icons and 9 animated sheets processed')
