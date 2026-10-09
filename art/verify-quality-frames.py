from pathlib import Path
from PIL import Image
p=Path(__file__).resolve().parents[1]/'src/assets/quality-frames'
for name in ['white','blue','purple','gold','legend']:
 im=Image.open(p/(name+'.webp'));assert im.size==(128,128)
 assert im.n_frames==(16 if name in ['gold','legend'] else 8)
 for i in range(im.n_frames):
  im.seek(i);assert im.convert('RGBA').getpixel((64,64))[3]==0
 print(name,im.n_frames,(p/(name+'.webp')).stat().st_size)

