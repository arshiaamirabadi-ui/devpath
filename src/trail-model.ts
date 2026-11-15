import {weeks} from './content';
export const trailPoints=weeks.map((w,i)=>({x:200+Math.sin(i*.95)*88,y:200+i*138+(w.month-1)*100}));
export const voyageStops=[0,4,8,12,16,25].map(i=>trailPoints[i]);
const segment=(a:{x:number;y:number},b:typeof a)=>`C ${a.x} ${(a.y+b.y)/2} ${b.x} ${(a.y+b.y)/2} ${b.x} ${b.y}`;
export function voyageGeometry(percent:number){
 const distance=Math.max(0,Math.min(100,percent))/100*(trailPoints.length-1),i=Math.min(trailPoints.length-2,Math.floor(distance)),t=distance-i;
 const a=trailPoints[i],b=trailPoints[i+1],c={x:a.x,y:(a.y+b.y)/2},d={x:b.x,y:c.y};
 const lerp=(u:typeof a,v:typeof a)=>({x:u.x+(v.x-u.x)*t,y:u.y+(v.y-u.y)*t});
 const ac=lerp(a,c),cd=lerp(c,d),db=lerp(d,b),q=lerp(ac,cd),r=lerp(cd,db),position=lerp(q,r);
 const completed=trailPoints.slice(0,i).map((p,n)=>segment(p,trailPoints[n+1])).join(' ');
 return {position,path:`M ${trailPoints[0].x} ${trailPoints[0].y} ${trailPoints.slice(0,-1).map((p,n)=>segment(p,trailPoints[n+1])).join(' ')}`,traveled:`M ${trailPoints[0].x} ${trailPoints[0].y} ${completed} C ${ac.x} ${ac.y} ${q.x} ${q.y} ${position.x} ${position.y}`};
}
