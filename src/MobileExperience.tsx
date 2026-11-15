import {House,CalendarDays,Ship,Medal,Grid2X2,ArrowLeft,Star} from 'lucide-react';
import {Link} from './components';
import {tx} from './locale';
import {VoyagerArt} from './JourneyArt';
import {StreakBadge} from './Streak';
export function MobileDock({route,onMore}:{route:string;onMore:(button:HTMLButtonElement)=>void}){
 const tabs=[{path:'',label:'خانه',Icon:House,active:route===''}, {path:'today',label:'امروز',Icon:CalendarDays,active:route==='today'||route.startsWith('activity/')}, {path:'progress',label:'سفر',Icon:Ship,active:route==='progress'||route.startsWith('week/')||route==='roadmap'||route==='diagram'}, {path:'skills',label:'توانایی‌ها',Icon:Medal,active:route==='skills'||route.startsWith('skill/')||route==='streak'}];
 return <nav className="mobile-dock" aria-label={tx('ناوبری پایین')}>{tabs.map(({path,label,Icon,active})=><Link key={path} to={path} aria-label={tx(label)} aria-current={active?'page':undefined}><span><Icon size={22}/></span><small>{tx(label)}</small></Link>)}<button onClick={e=>onMore(e.currentTarget)} aria-label={tx('بخش‌های بیشتر')}><span><Grid2X2 size={22}/></span><small>{tx('بیشتر')}</small></button></nav>;
}
export function MobileGreeting(){return <div className="mobile-greeting"><span className="mobile-avatar"><Star size={20} fill="currentColor"/></span><div><strong>{tx('سلام، دریانورد!')}</strong><small>{tx('هر روز، یک قدم جلوتر')}</small></div><StreakBadge/></div>}
export function MobileHero({week}:{week:number}){return <section className="mobile-hero"><div><span className="mobile-hero-tag">DevPath Odyssey</span><h2>{tx('آماده‌ای برای')}<br/><mark>{tx('قدم بعدی؟')}</mark></h2><p>{tx('از اولین خط کد، تا ایتاکای تو.')}</p><Link to={'week/'+week} className="mobile-hero-action">{tx('شروع کنیم')}<span><ArrowLeft size={21}/></span></Link></div><VoyagerArt/><span className="hero-spark spark-one">✦</span><span className="hero-spark spark-two">✧</span></section>}
