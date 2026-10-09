from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'art/economy-art-manifest.json').read_text(encoding='utf-8'))
assert len(manifest['assets'])==222
for asset in manifest['assets']:
 for kind,size in [('master',256),('runtime',64)]:
  image=Image.open(root/asset[kind]['path'])
  assert image.mode=='RGBA' and image.size==(size,size),asset['asset_id']
  assert image.getchannel('A').getextrema()==(0,255),asset['asset_id']
print('Verified 444 RGBA PNG files, dimensions and transparency')
