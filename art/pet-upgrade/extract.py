from PIL import Image
from pathlib import Path
import json
root=Path('.');source=Image.open('art/pet-upgrade/source.png').convert('RGBA');sheet=Image.new('RGBA',(1024,512));out=Path('src/assets/pet-upgrade');out.mkdir(parents=True,exist_ok=True)
for i in range(8):
 cell=source.crop(((i%4)*source.width//4,(i//4)*source.height//2,(i%4+1)*source.width//4,(i//4+1)*source.height//2));pixels=[]
 for r,g,b,a in cell.getdata():
  m=max(r,g,b);pixels.append((round(r*255/m),round(g*255/m),round(b*255/m),m) if m>18 else (0,0,0,0))
 cell.putdata(pixels);cell.thumbnail((256,256),Image.Resampling.LANCZOS);sheet.alpha_composite(cell,((i%4)*256+(256-cell.width)//2,(i//4)*256+(256-cell.height)//2))
sheet.save(out/'upgrade-sheet.webp',lossless=True);(out/'manifest.json').write_text(json.dumps({'asset_id':'pet_upgrade_v1','version':1,'generator':'ComfyUI Qwen Image 2.1','prompt_id':'06c434ce-e8d8-4b3c-9057-076598d37698','sheet':'upgrade-sheet.webp','columns':4,'rows':2,'cell':256,'train':{'row':0,'frames':4},'evolve':{'row':1,'frames':4},'duration_ms':1600}),encoding='utf8')
