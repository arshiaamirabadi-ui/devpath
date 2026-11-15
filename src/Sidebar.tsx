import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {Code2,UserRound,X,type LucideIcon} from 'lucide-react';
import {Link,Meter} from './components';
import {tx} from './locale';
import type {Tone} from './ui';

type Item=readonly [string,string,LucideIcon];
const tones:Tone[]=['blue','violet','blue','violet','rose','amber','violet','rose','amber','violet','blue','blue'];
function NavEntry({item,active,collapsed,tone,onNavigate}:{item:Item;active:boolean;collapsed:boolean;tone:Tone;onNavigate:()=>void}){
 const [tip,setTip]=useState<{x:number;y:number;side:'left'|'right'}|null>(null);const id=useId();
 const [path,label,Icon]=item;
 const reveal=(element:HTMLAnchorElement)=>{if(!collapsed)return;const rect=element.getBoundingClientRect(),rtl=document.documentElement.dir==='rtl';setTip({x:rtl?rect.left-12:rect.right+12,y:rect.top+rect.height/2,side:rtl?'left':'right'})};
 return <>
  <Link to={path} className={'nav-link '+(active?'active':'')} data-tone={tone} aria-label={tx(label)} aria-current={active?'page':undefined} aria-describedby={collapsed&&tip?id:undefined}
   onMouseEnter={e=>reveal(e.currentTarget)} onMouseLeave={()=>setTip(null)} onFocus={e=>reveal(e.currentTarget)} onBlur={()=>setTip(null)} onKeyDown={e=>{if(e.key==='Escape')setTip(null)}} onClick={()=>{setTip(null);onNavigate()}}>
   <span className="nav-icon" aria-hidden="true"><Icon size={20}/></span><span className="nav-label">{tx(label)}</span>{path==='roadmap'&&<small className="nav-count" aria-hidden="true">{tx('۲۶')}</small>}
  </Link>
  {collapsed&&tip&&createPortal(<div id={id} role="tooltip" className={'nav-tooltip tooltip-'+tip.side} style={{left:tip.x,top:tip.y}}>{tx(label)}</div>,document.body)}
 </>;
}

export default function Sidebar({items,route,open,collapsed,mobile,progress,onClose,onNavigate}:{items:readonly Item[];route:string;open:boolean;collapsed:boolean;mobile:boolean;progress:number;onClose:()=>void;onNavigate:()=>void}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(open)ref.current?.querySelector<HTMLElement>('.nav-link[aria-current="page"]')?.focus()},[open]);
 const keyboard=(event:KeyboardEvent<HTMLElement>)=>{
  if(!mobile||!open)return;
  if(event.key==='Escape'){event.preventDefault();onClose();return}
  if(event.key!=='Tab')return;
  const items=[...ref.current!.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
 };
 return <aside ref={ref} id="learning-sidebar" className={'sidebar '+(open?'is-open':'')} aria-label={tx('ناوبری اصلی')} role={mobile&&open?'dialog':undefined} aria-modal={mobile&&open?true:undefined} inert={mobile&&!open} onKeyDown={keyboard}>
  <div className="sidebar-header"><Link to="" className="brand" aria-label="DevPath" onClick={onNavigate}><span className="brand-symbol"><Code2 size={25}/></span><span className="brand-label">DevPath<small>{tx('هر روز، یک قدم جلوتر')}</small></span></Link><button className="mobile-close" aria-label={tx('بستن منو')} onClick={onClose}><X size={20}/></button></div>
  <div className="workspace-label">{tx('فضای یادگیری من')}</div>
  <nav className="sidebar-nav" aria-label={tx('ناوبری اصلی')}>{items.map((item,index)=>{
   const path=item[0],active=route===path||(path==='roadmap'&&route.startsWith('week/'))||(path==='skills'&&route.startsWith('skill/'));
   return <NavEntry key={path} item={item} active={active} collapsed={collapsed} tone={tones[index]} onNavigate={onNavigate}/>;
  })}</nav>
  <div className="sidebar-bottom"><div className="mini-path"><span className="eyebrow">{tx('هدف این مسیر')}</span><strong>Junior Backend Developer</strong><span>Go · PostgreSQL · REST · Docker</span><Meter value={progress} label="پیشرفت مسیر"/></div><div className="profile" title={tx('مسیر شخصی من')}><span className="avatar"><UserRound size={18} aria-hidden="true"/></span><span className="profile-copy">{tx('مسیر شخصی من')}<small>{tx('ذخیره روی همین دستگاه')}</small></span><span className="live-dot" title={tx('ذخیره محلی')}/></div></div>
 </aside>;
}
