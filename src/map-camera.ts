export interface Camera {x:number;y:number;scale:number}
export function zoomAt(camera:Camera,point:{x:number;y:number},factor:number):Camera {
 const scale=Math.max(.4,Math.min(2,camera.scale*factor));
 return {scale,x:point.x-(point.x-camera.x)*scale/camera.scale,y:point.y-(point.y-camera.y)*scale/camera.scale};
}
export function panBy(camera:Camera,dx:number,dy:number):Camera{return {...camera,x:camera.x+dx,y:camera.y+dy}}
