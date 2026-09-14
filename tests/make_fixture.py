"""Generate an independent 240fps sphere video. Requires numpy and ffmpeg only.
This script is for developer validation; the app has no Python dependency."""
import numpy as np, subprocess, pathlib, json
HERE=pathlib.Path(__file__).resolve().parent
W,H,FPS,N=640,360,240,360
out=HERE/'synthetic-240fps.mp4'
axis=np.array([.45,.7794228634059948,.4358898943540673])
cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
y,x=np.mgrid[0:H,0:W]
for i in range(N):
    cx,cy,r=250+i*.13,184-i*.024,73-i*.025
    xx=(x+.5-cx)/r; yy=-(y+.5-cy)/r; rr=xx*xx+yy*yy
    mask=rr<1; zz=np.sqrt(np.maximum(0,1-rr))
    points=np.stack([xx,yy,zz],axis=-1)
    a=-2*np.pi*5*i/FPS; c,s=np.cos(a),np.sin(a)
    q=points*c+np.cross(axis,points)*s+np.sum(points*axis,axis=-1)[...,None]*axis*(1-c)
    u,v,w=np.moveaxis(q,-1,0)
    f=np.sin(8*u+2*v)*np.cos(7*v-3*w)+.65*np.sin(10*w+2*u)
    t=np.tanh(f*5)
    col=np.where((t>.28)[...,None],[248,191,45],np.where((t<-.28)[...,None],[28,97,184],[235,235,218]))
    detail=1-.10*np.sin(19*u+13*v-7*w)*np.sin(17*w-3*v)
    ball=col*((.76+.24*zz)*detail)[...,None]
    img=np.empty((H,W,3),dtype=np.uint8);img[:]=[22,53,73]
    img[(x%40==0)|(y%40==0)]=[36,72,91]
    img[mask]=np.clip(ball[mask],0,255)
    p.stdin.write(img.tobytes())
p.stdin.close();code=p.wait();assert code==0
(HERE/'fixture-ground-truth.json').write_text(json.dumps({'fps':FPS,'frames':N,'hz':5,'axis_image_degrees':60,'axis_vector_xyz':axis.tolist(),'width':W,'height':H,'center_x':'250 + frame*0.13','center_y':'184 - frame*0.024','radius':'73 - frame*0.025','synthetic':True},indent=2)+'\n')
print(out)
