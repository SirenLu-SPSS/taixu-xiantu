from pathlib import Path
from PIL import Image
import numpy as np
from scipy.ndimage import binary_propagation,binary_dilation,label
import sys
root=Path(__file__).resolve().parent.parent
sources=Path(sys.argv[1]) if len(sys.argv)>1 else root/'art/source-rifts'
assets=root/'src/assets/art'
def cutout(image):
 data=np.array(image.convert('RGB'));rgb=data.astype(float)
 allowed=(rgb.min(axis=2)>228)&((rgb.max(axis=2)-rgb.min(axis=2))<28)
 seed=np.zeros(allowed.shape,dtype=bool);seed[0,:]=allowed[0,:];seed[-1,:]=allowed[-1,:];seed[:,0]=allowed[:,0];seed[:,-1]=allowed[:,-1]
 outside=binary_propagation(seed,mask=allowed)
 alpha=np.full(allowed.shape,255,dtype=np.uint8);alpha[outside]=0
 edge=binary_dilation(outside)&~outside
 alpha[edge]=np.clip((255-rgb.min(axis=2))[edge]*3,0,255).astype(np.uint8)
 a=alpha.astype(float)/255
 for c in range(3):
  corrected=(rgb[:,:,c]-255*(1-a))/np.maximum(a,.001)
  data[:,:,c]=np.where(edge,np.clip(corrected,0,255),data[:,:,c]).astype(np.uint8)
 components,count=label(alpha>8,np.ones((3,3),dtype=int))
 sizes=np.bincount(components.ravel());sizes[0]=0;main=int(sizes.argmax());ys,xs=np.where(components==main)
 if len(xs):
  bounds=(xs.min()-15,xs.max()+15,ys.min()-15,ys.max()+15);keep=np.zeros(count+1,dtype=bool);keep[main]=True
  for k in range(1,count+1):
   if sizes[k]<5:continue
   cy,cx=np.where(components==k)
   if bounds[0]<=cx.mean()<=bounds[1] and bounds[2]<=cy.mean()<=bounds[3]:keep[k]=True
  alpha[~keep[components]]=0
 result=Image.fromarray(np.dstack((data,alpha)),'RGBA');bbox=result.getbbox()
 if not bbox:raise RuntimeError('Empty creature sprite')
 return result.crop((max(0,bbox[0]-3),max(0,bbox[1]-3),min(result.width,bbox[2]+3),min(result.height,bbox[3]+3)))
for theme in ['ember','frost','grove','sand','void']:
 floor=sources/(theme+'-floor.png')
 if floor.exists():
  image=Image.open(floor).convert('RGB');image.thumbnail((1024,1024),Image.Resampling.LANCZOS);image.save(assets/('rift-'+theme+'-floor.webp'),quality=89,method=6)
 actors=sources/(theme+'-actors.png')
 if actors.exists():
  image=Image.open(actors);w,h=image.size;boxes=[(0,0,w//2,h//2),(w//2,0,w,h//2),(0,h//2,w//2,h),(w//2,h//2,w,h)]
  for role,box in zip(['mob','elite','boss','rage'],boxes):
   asset=cutout(image.crop(box));asset.thumbnail((360,360),Image.Resampling.LANCZOS);asset.save(assets/('rift-'+theme+'-'+role+'.webp'),quality=91,method=6)
   alpha=np.asarray(asset.getchannel('A'));print(theme,role,asset.size,'transparent',round(float((alpha==0).mean()),3))
