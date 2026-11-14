import {useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {ArrowDown,ArrowLeft,Check,Focus,Minus,Plus,Search,X,MousePointer2,Move} from 'lucide-react';
import {connections,nodes,type GraphNode} from './graph';
import {projects,resources,type Track} from './content';
import {useStore} from './store';
import {fa} from './logic';
import {skillReport} from './learning';
import {External,Link,Meter,Tag,allActivities,tracks} from './components';
import {PageHeading} from './App';
import {zoomAt,panBy,type Camera} from './map-camera';
import {buildTree,TREE_W as NODE_W,TREE_H as NODE_H} from './map-tree';


const order:Track[]=['backend','ai','systems','project'];
const shortNames:Record<string,string>={'go-basics':'مبانی Go و داده‌ها','go-contracts':'Pointer، Method و Interface','go-files':'فایل، JSON و Package','http-rest':'HTTP و REST با Gin',sql:'SQL و PostgreSQL',auth:'احراز هویت و کنترل دسترسی',engineering:'ساختار پروژه و Validation',testing:'تست واحد و یکپارچه',concurrency:'Goroutine و Channel','docker-linux':'Docker و Linux','redis-ci':'Redis و CI',frontend:'HTML، CSS و JavaScript','react-ts':'React و TypeScript',python:'Python و Jupyter',ml:'داده و مبانی یادگیری ماشین',pytorch:'Tensor و شبکه عصبی',evaluation:'ارزیابی مدل و تفکیک داده',transformer:'Tokenizer و Transformer','training-stages':'مراحل آموزش مدل زبانی','fine-tuning':'Fine-tuning و LoRA','ai-integration':'اتصال AI به محصول',digital:'منطق دیجیتال',cpu:'CPU و اجرای دستور',memory:'ساختار حافظه و آدرس‌دهی',pipeline:'Pipeline و چند‌هسته‌ای',gpu:'معماری و حافظه GPU','gpu-measure':'اندازه‌گیری CPU و GPU',c:'C و مدیریت حافظه',git:'Git و مستندسازی',delivery:'پورتفولیو و آمادگی مصاحبه'};

export default function Diagram(){
 const {state}=useStore();
 const [track,setTrack]=useState('backend'),[selected,setSelected]=useState(''),[query,setQuery]=useState('');
 const [camera,setCamera]=useState<Camera>({x:0,y:0,scale:1}),[size,setSize]=useState({width:700,height:760});
 const [grabbing,setGrabbing]=useState(false),[focusId,setFocusId]=useState('');
 const viewport=useRef<HTMLDivElement>(null),drag=useRef<{id:number;x:number;y:number}|null>(null);
 const tree=useMemo(()=>buildTree(track),[track]);
 const laidOut=tree.nodes,{width,height}=tree;
 const chosen=nodes.find(n=>n.id===selected),relation=connections(selected),related=new Set([...relation.parents,...relation.children]);
 const activities=allActivities();
 const matches=query.trim()?nodes.filter(n=>n.title.toLowerCase().includes(query.trim().toLowerCase())):[];
 const nodeProgress=(n:GraphNode)=>{
  if(n.kind==='project'){const p=projects.find(p=>p.id===n.sourceId)!;return Math.round((state.projects[p.id]?.checks.filter(c=>c<p.checklist.length).length??0)/p.checklist.length*100)}
  return skillReport(n.sourceId,state).score;
 };
 const reset=()=>{
  const top=tree.root,items=[...tree.nodes,...tree.groups];let fork=top.id;
  while(tree.links.filter(e=>e[0]===fork).length===1)fork=tree.links.find(e=>e[0]===fork)![1];
  const children=tree.links.filter(e=>e[0]===fork).map(e=>items.find(n=>n.id===e[1])!);
  const left=Math.min(top.x,...children.map(n=>n.x)),right=Math.max(top.x+NODE_W,...children.map(n=>n.x+NODE_W));
  const scale=size.width<600?.85:Math.max(.4,Math.min(1,(size.width-48)/(right-left)));
  const center=size.width<600?top.x+NODE_W/2:(left+right)/2;
  setCamera({scale,x:size.width/2-center*scale,y:30-top.y*scale});
 };
 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const observer=new ResizeObserver(()=>setSize({width:element.clientWidth,height:element.clientHeight}));observer.observe(element);
  const wheel=(event:WheelEvent)=>{
   event.preventDefault();const rect=element.getBoundingClientRect(),units=event.deltaMode===1?16:event.deltaMode===2?element.clientHeight:1;
   const factor=Math.exp(-Math.max(-120,Math.min(120,event.deltaY*units))*.0025);
   setCamera(c=>zoomAt(c,{x:event.clientX-rect.left,y:event.clientY-rect.top},factor));
  };
  element.addEventListener('wheel',wheel,{passive:false});
  return()=>{observer.disconnect();element.removeEventListener('wheel',wheel)};
 },[]);
 useEffect(()=>{reset()},[track,size.width]);
 useEffect(()=>{
  if(!focusId)return;const n=laidOut.find(n=>n.id===focusId);if(!n)return;
  const scale=Math.min(1,(size.width-48)/NODE_W);
  setCamera({scale,x:(size.width-NODE_W*scale)/2-n.x*scale,y:100-n.y*scale});setFocusId('');
 },[focusId,laidOut,size.width]);
 const zoom=(factor:number)=>setCamera(c=>zoomAt(c,{x:size.width/2,y:size.height/2},factor));
 const jump=(n:GraphNode)=>{setSelected(n.id);if(track!=='all')setTrack(n.track);setFocusId(n.id);setQuery('')};
 const startDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const onControl=(event.target as Element).closest('button');
  if(event.button!==1&&(event.button!==0||onControl))return;
  event.preventDefault();drag.current={id:event.pointerId,x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);setGrabbing(true);
 };
 const moveDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==event.pointerId)return;const dx=event.clientX-d.x,dy=event.clientY-d.y;d.x=event.clientX;d.y=event.clientY;setCamera(c=>panBy(c,dx,dy))};
 const stopDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{if(drag.current?.id!==event.pointerId)return;drag.current=null;setGrabbing(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)};
 const changeTrack=(value:string)=>{setTrack(value);setSelected('');setQuery('')};
 const linkButtons=(ids:string[])=>ids.map(id=>{const n=nodes.find(n=>n.id===id)!;return <li key={id}><button aria-label={n.title} onClick={()=>jump(n)}><span>{shortNames[n.sourceId]??n.title}</span><small>{tracks[n.track]}</small><ArrowLeft size={14}/></button></li>});
 return <>
  <PageHeading eyebrow="هر بار یک مسیر؛ هر موضوع یک قدم مشخص" title="درخت یادگیری" description="از ریشه شروع کن و شاخه‌ها را دنبال کن. هر کادر یک موضوع است؛ درس‌ها، پیش‌نیازهای مشترک و قدم‌های بعدی را با انتخاب آن ببین." action={<Link className="outline" to="roadmap">برنامه ۲۶ هفته <ArrowLeft size={16}/></Link>}/>
  <section className="panel map-controls">
   <div className="map-track-tabs" role="group" aria-label="انتخاب مسیر نقشه">{order.map(t=><button key={t} aria-pressed={track===t} onClick={()=>changeTrack(t)}>{tracks[t]}<small>{fa(nodes.filter(n=>n.track===t).length)}</small></button>)}<button aria-pressed={track==='all'} onClick={()=>changeTrack('all')}>همه مسیرها<small>۴۲</small></button></div>
   <div className="map-toolbar"><div className="search-field"><Search size={18}/><input type="search" aria-label="جست‌وجوی موضوع در دیاگرام" value={query} onChange={e=>setQuery(e.target.value)} placeholder="پیداکردن موضوع در هر چهار مسیر…"/></div><div className="zoom-tools"><button aria-label="کوچک‌نمایی" onClick={()=>zoom(1/1.2)} disabled={camera.scale<=.4}><Minus size={17}/></button><output aria-label="درصد بزرگ‌نمایی">{fa(Math.round(camera.scale*100))}٪</output><button aria-label="بزرگ‌نمایی" onClick={()=>zoom(1.2)} disabled={camera.scale>=2}><Plus size={17}/></button><button onClick={reset}><Focus size={17}/>اندازه صفحه</button></div></div>
   {query&&<div className="graph-results" aria-live="polite"><span>{fa(matches.length)} موضوع پیدا شد.</span>{matches.map(n=><button key={n.id} onClick={()=>jump(n)}>{n.title}</button>)}</div>}
  </section>
  <div className="map-layout">
   <section className="panel map-board">
    <div className="map-board-header"><span><ArrowDown size={16}/>{track==='all'?'نمای کلی چهار مسیر':tracks[track as Track]}</span><small>{fa(laidOut.length)} موضوع · ترتیب پیشنهادی یادگیری</small></div>
    <div ref={viewport} className={'map-viewport '+(grabbing?'is-grabbing':'')} role="region" aria-label="بوم تعاملی نقشه" tabIndex={0} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={()=>{drag.current=null;setGrabbing(false)}} onAuxClick={e=>e.preventDefault()} onKeyDown={e=>{
     if(e.target!==e.currentTarget)return;const delta:Record<string,[number,number]>={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};
     if(delta[e.key]){e.preventDefault();setCamera(c=>panBy(c,...delta[e.key]))}else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.2)}else if(e.key==='-'){e.preventDefault();zoom(1/1.2)}else if(e.key==='Home'){e.preventDefault();reset()}
    }}>
     <div className="map-world" data-testid="map-world" data-scale={camera.scale} data-x={camera.x} data-y={camera.y} style={{width,height,transform:`translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`}}>
      {tree.groups.map(group=><div key={group.id} className={'map-root '+(group.id==='tree-root'?'main-root':'')} style={{left:group.x,top:group.y,width:NODE_W,height:group.height}}><strong>{group.title}</strong><small>{group.id==='tree-root'?'ریشه مسیر · شاخه‌ها را از بالا به پایین دنبال کن':'شاخه یادگیری'}</small></div>)}
      <svg className="map-connections" width={width} height={height} aria-hidden="true"><defs><marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#7188c6"/></marker><marker id="map-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#bba0ff"/></marker></defs>{tree.links.map(([from,to])=>{
       const all=[...tree.nodes,...tree.groups],a=all.find(n=>n.id===from)!,b=all.find(n=>n.id===to)!;
       const ah='height' in a?a.height:NODE_H,x1=a.x+NODE_W/2,x2=b.x+NODE_W/2,y1=a.y+ah,y2=b.y,mid=(y1+y2)/2;
       const active=from===selected||to===selected;
       return <path key={from+to} d={`M${x1},${y1} V${mid} H${x2} V${y2}`} className={'graph-edge map-edge '+(active?'active':'')} markerEnd={active?'url(#map-arrow-active)':'url(#map-arrow)'}/>;
      })}</svg>
      {laidOut.map(n=>{const pct=nodeProgress(n),isParent=relation.parents.includes(n.id),isChild=relation.children.includes(n.id);return <button key={n.id} className={`graph-node map-node ${n.track} ${n.kind} ${selected===n.id?'is-selected':''} ${related.has(n.id)?'is-related':''}`} style={{left:n.x,top:n.y,width:NODE_W,height:NODE_H}} aria-label={n.title+'؛ '+(n.kind==='project'?'پروژه':'مهارت')} aria-pressed={selected===n.id} onClick={()=>setSelected(n.id)}>
       <span className="map-node-order">{pct===100?<Check size={16}/>:fa(n.index)}</span><span className="map-node-body"><strong className="graph-node-title">{shortNames[n.sourceId]??n.title}</strong><span className="graph-node-meta">هفته {fa(Math.min(...n.weeks))}{n.weeks.length>1?' تا '+fa(Math.max(...n.weeks)):''}<span>{fa(pct)}٪</span></span></span>{(isParent||isChild)&&<small className="map-relationship">{isParent?'پیش‌نیاز':'قدم بعد'}</small>}
      </button>})}
     </div>
    </div>
    <div className="map-instructions"><span><MousePointer2 size={15}/>اسکرول: زوم روی نشانگر</span><span><Move size={15}/>دکمه وسط ماوس + کشیدن: جابه‌جایی</span><span>لمس و کشیدن فضای خالی · کلیدهای جهت</span></div>
    <p className="map-explanation">خط‌ها شاخه‌بندی پیشنهادی یادگیری را نشان می‌دهند. پیش‌نیازهای مشترک و ارتباط با شاخه‌های دیگر در پنل هر موضوع آمده‌اند. این ترتیب قفل اجباری ایجاد نمی‌کند.</p>
   </section>
   <aside className="map-detail graph-detail" aria-label="جزئیات موضوع انتخابی" aria-live="polite">
    {chosen?<section className="panel"><div className="split"><Tag track={chosen.track}/><button aria-label="پاک‌کردن انتخاب" onClick={()=>setSelected('')}><X size={16}/></button></div><h2>{chosen.title}</h2><p className="muted">{chosen.kind==='project'?'پروژه با معیار پذیرش و راهنمای ساخت':'مهارت مرتبط با درس‌ها و تمرین‌های مسیر'}</p><Meter value={nodeProgress(chosen)} label={chosen.kind==='project'?'پیشرفت تحویل پروژه':'شواهد یادگیری این مهارت'}/>{chosen.kind==='skill'&&<Link className="text-link" to={'skill/'+chosen.sourceId}>دیدن شواهد و درس‌های این مهارت ↗</Link>}{chosen.kind==='skill'&&<p className="muted">این امتیاز از تکمیل، مطالعه، تمرین و توضیح درس‌ها و خروجی پروژه‌های مرتبط به‌روز می‌شود؛ خودارزیابی شخصی جداست.</p>}
     <h3>پیش‌نیازهای مستقیم</h3>{relation.parents.length?<ul className="map-related">{linkButtons(relation.parents)}</ul>:<p className="muted">نقطه شروع این شاخه است.</p>}
     <h3>قدم‌های بعدی و کاربرد</h3>{relation.children.length?<ul className="map-related">{linkButtons(relation.children)}</ul>:<p className="muted">خروجی این بخش را در پروژه و پورتفولیو نشان بده.</p>}
     <h3>هفته‌های مرتبط</h3><div className="button-row">{chosen.weeks.map(n=><Link key={n} className="chip" to={'week/'+n}>هفته {fa(n)}</Link>)}</div><div className="graph-detail-actions"><Link className="primary full" to={chosen.kind==='project'?'project/'+chosen.sourceId:'week/'+chosen.weeks[0]}>{chosen.kind==='project'?'بازکردن راهنمای پروژه':'شروع درس‌های مرتبط'}<ArrowLeft size={15}/></Link>{chosen.kind==='skill'&&<Link className="outline full" to="skills">ثبت سطح و شاهد مهارت</Link>}</div>
     <h3>منابع مرتبط</h3>{resources.filter(r=>r.topic===chosen.track&&r.weeks.some(w=>chosen.weeks.includes(w))).slice(0,3).map(r=><div className="graph-resource" key={r.id}><External url={r.url}>{r.title}</External></div>)}
    </section>:<section className="panel map-empty"><span className="map-empty-icon"><MousePointer2 size={28}/></span><h2>از یک موضوع شروع کن</h2><p>روی هر کادر بزن تا توضیح مسیر، پیش‌نیازها و لینک درس‌هایش اینجا نمایش داده شود.</p><ol><li>مسیر را از بالا انتخاب کن.</li><li>با اسکرول نزدیک یا دور شو.</li><li>برای حرکت، دکمه وسط ماوس را نگه دار و بکش.</li></ol><p>ارتباط‌های بین مسیرها در همین پنل هم فهرست می‌شوند؛ برای دنبال‌کردنشان روی موضوع بزن.</p></section>}
   </aside>
  </div>
 </>;
}
