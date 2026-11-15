import {useEffect,useId,useRef,useState,type MouseEvent,type FocusEvent} from 'react';
import {createPortal} from 'react-dom';
import {ArrowUpLeft,X,BookOpen} from 'lucide-react';
import {weeks} from './content';
import {COMPACT_NAVIGATION} from './navigation-layout';
import {Link} from './components';
import {fa} from './logic';
import {tx} from './locale';
export function TrailStars({completion}:{completion:number}){
 const id=useId().replaceAll(':','');
 return <span className="trail-stars" aria-hidden="true">{[1,2,3].map(n=>{const filled=completion>=[33.3,66.7,100][n-1];return <span key={n} className={'trail-star star-'+n+(filled?' earned':'')}><svg viewBox="0 0 32 32"><defs><linearGradient id={id+n} x2="0" y2="1"><stop stopColor="#fff4b2"/><stop offset=".45" stopColor="#ffdb68"/><stop offset="1" stopColor="#e9a62f"/></linearGradient></defs><path d="m16 2 4.4 8.9 9.8 1.4-7.1 6.9 1.7 9.8-8.8-4.6L7.2 29l1.7-9.8-7.1-6.9 9.8-1.4Z" fill={filled?`url(#${id+n})`:'currentColor'} stroke={filled?'#ae792b':'currentColor'} strokeWidth="1.4" strokeLinejoin="round"/>{filled&&<path d="m16 5 3.4 7 6.2.9" fill="none" stroke="#fff9d9" strokeWidth="1.6" strokeLinecap="round"/>}</svg></span>})}</span>;
}
export function useTrailPeek(){
 const [peek,setPeek]=useState<{number:number;x:number;y:number;width:number;trigger:HTMLAnchorElement}|null>(null),cardRef=useRef<HTMLDivElement>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),tap=useRef<number|null>(null),suppress=useRef(false),id=useId();
 const keep=()=>{clearTimeout(timer.current)};
 const hide=(restore=false)=>{keep();if(restore&&peek){suppress.current=true;peek.trigger.focus({preventScroll:true});requestAnimationFrame(()=>{suppress.current=false})}setPeek(null);tap.current=null};
 const reveal=(trigger:HTMLAnchorElement,number:number)=>{
  if(suppress.current)return;keep();const rect=trigger.getBoundingClientRect(),main=trigger.closest('.main-shell')!.getBoundingClientRect(),low=Math.max(16,main.left+16),high=Math.min(innerWidth-16,main.right-16),width=Math.min(280,high-low),right=high-rect.right,left=rect.left-low;
  const x=right>=width+16?rect.right+16:left>=width+16?rect.left-width-16:Math.max(low,Math.min(high-width,rect.x+rect.width/2-width/2));
  const beside=right>=width+16||left>=width+16,y=beside?rect.top-18:rect.bottom+16;
  setPeek({number,x,y:Math.max(16,Math.min(innerHeight-(matchMedia(COMPACT_NAVIGATION).matches?340:270),y)),width,trigger});
 };
 const leave=()=>{keep();timer.current=setTimeout(()=>hide(),180)};
 const blur=(event:FocusEvent<HTMLElement>)=>{if(cardRef.current?.contains(event.relatedTarget as Node))return;leave()};
 const activate=(event:MouseEvent<HTMLAnchorElement>,number:number)=>{
  if(matchMedia(COMPACT_NAVIGATION).matches&&!event.ctrlKey&&!event.metaKey&&tap.current!==number){event.preventDefault();tap.current=number;reveal(event.currentTarget,number);requestAnimationFrame(()=>cardRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true}))}else hide();
 };
 useEffect(()=>{if(!peek)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();hide(true)}};const outside=(event:PointerEvent)=>{const target=event.target as Element;if(!cardRef.current?.contains(target)&&!target.closest('.trail-stop'))hide()};const scroll=(event:Event)=>{if((event.target as Element)?.closest?.('.trail-peek'))return;hide()};document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);window.addEventListener('scroll',scroll,true);const resize=()=>hide();window.addEventListener('resize',resize);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);window.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',resize)}},[peek?.number]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const week=peek?weeks[peek.number-1]:undefined;
 const card=peek&&week?createPortal(<div ref={cardRef} id={id} className="trail-peek" role="dialog" aria-label={tx('جزئیات مرحله')} style={{left:peek.x,top:peek.y,width:peek.width}} onMouseEnter={keep} onMouseLeave={leave} onFocus={keep} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))leave()}}><div className="trail-peek-top"><span><BookOpen size={15}/>{tx('هفته ')}{fa(week.number)}</span><button aria-label={tx('بستن پیام')} onClick={()=>hide(true)}><X size={16}/></button></div><h3>{tx(week.title)}</h3><p id={id+'-description'}>{tx(week.goal)}</p><Link className="trail-peek-action" to={'week/'+week.number} onClick={()=>hide()}>{tx('دیدن برنامه هفته')}<ArrowUpLeft size={17}/></Link></div>,document.body):null;
 return {reveal,leave,blur,activate,card,number:peek?.number,descriptionId:id+'-description',id,hide};
}
