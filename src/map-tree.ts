import {nodes,type GraphNode} from './graph';
import {type Track} from './content';
export const TREE_W=320,TREE_H=108,TREE_STEP=172;
export interface TreeGroup {id:string;title:string;x:number;y:number;height:number;track?:Track}
const parent:Record<string,string>={
 'skill:go-contracts':'skill:go-basics','skill:go-files':'skill:go-contracts','skill:http-rest':'skill:go-files','skill:sql':'skill:http-rest','skill:auth':'skill:sql','skill:engineering':'skill:auth','skill:testing':'skill:engineering','skill:concurrency':'skill:testing','skill:docker-linux':'skill:testing','skill:redis-ci':'skill:concurrency','skill:frontend':'skill:go-basics','skill:react-ts':'skill:frontend',
 'skill:ml':'skill:python','skill:pytorch':'skill:ml','skill:evaluation':'skill:pytorch','skill:transformer':'skill:pytorch','skill:training-stages':'skill:transformer','skill:fine-tuning':'skill:training-stages','skill:ai-integration':'skill:fine-tuning',
 'skill:cpu':'skill:digital','skill:memory':'skill:cpu','skill:pipeline':'skill:memory','skill:gpu':'skill:memory','skill:c':'skill:memory','skill:gpu-measure':'skill:gpu',
 'project:go-small':'skill:git','project:go-cli':'project:go-small','project:python-script':'skill:git','project:task-api':'project:go-cli','project:docker-api':'project:task-api','project:react-panel':'project:task-api','project:mnist':'project:python-script','project:fine-tuning':'project:mnist','project:cpu-gpu':'project:fine-tuning','project:studioflow':'project:docker-api','skill:delivery':'project:studioflow','project:c-basics':'skill:git','project:cuda-optional':'project:c-basics'
};
const trackNames:Record<Track,string>={backend:'مسیر اصلی · Go Backend',ai:'مسیر مکمل · AI و ML',systems:'معماری کامپیوتر و GPU',project:'پروژه‌ها و آمادگی شغلی'};
export function buildTree(track:string){
 const selected=nodes.filter(n=>track==='all'||n.track===track);
 const groups:TreeGroup[]=[{id:'tree-root',title:track==='all'?'DevPath · درخت یادگیری':trackNames[track as Track],x:0,y:0,height:76}];
 if(track==='all')for(const t of ['backend','ai','systems','project'] as Track[])groups.push({id:'branch:'+t,title:trackNames[t],x:0,y:0,height:76,track:t});
 const ids=new Set(selected.map(n=>n.id)),children:Record<string,string[]>={},links:[string,string][]=[];
 for(const group of groups.slice(1))links.push(['tree-root',group.id]);
 for(const n of selected){const p=parent[n.id];links.push([p&&ids.has(p)?p:track==='all'?'branch:'+n.track:'tree-root',n.id])}
 for(const [from,to] of links)(children[from]??=[]).push(to);
 const widths:Record<string,number>={};
 function measure(id:string):number {const kids=children[id]??[];return widths[id]=Math.max(TREE_W,kids.reduce((sum,k)=>sum+measure(k),0)+Math.max(0,kids.length-1)*48)}
 const width=measure('tree-root')+160;
 const positions:Record<string,{x:number;y:number}>={};
 function place(id:string,left:number,depth:number){positions[id]={x:left+(widths[id]-TREE_W)/2,y:40+depth*TREE_STEP};let cursor=left;for(const kid of children[id]??[]){place(kid,cursor,depth+1);cursor+=widths[kid]+48}const kids=children[id]??[];if(kids.length)positions[id].x=(positions[kids[0]].x+positions[kids[kids.length-1]].x)/2}
 place('tree-root',80,0);
 const placed:(GraphNode&{index:number})[]=selected.map((n,i)=>({...n,...positions[n.id],index:i+1}));
 const placedGroups=groups.map(g=>({...g,...positions[g.id]}));
 const height=Math.max(...Object.values(positions).map(p=>p.y))+TREE_H+80;
 return {nodes:placed,groups:placedGroups,links,width,height,root:placedGroups[0]};
}
