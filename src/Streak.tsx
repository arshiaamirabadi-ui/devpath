import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ChevronLeft,ChevronRight,Flame,Check,Star,Trophy,CalendarDays} from 'lucide-react';
import {useStore} from './store';
import {Link} from './components';
import {fa,addDays,displayDate,saturday} from './logic';
import {tx,dateLocale} from './locale';
import {streakReport,calendarMonth} from './streak-model';
import {useLearningClock} from './useLearningClock';
import {FlameArt} from './JourneyArt';
import {PageHeading} from './App';
export function StreakBadge(){
 const {state}=useStore(),{today}=useLearningClock(),report=streakReport(state,today);
 return <Link to="streak" className={'streak-badge '+(report.todayDone?'is-lit':'')} aria-label={tx('زنجیرهٔ یادگیری')+' · '+fa(report.current)+' '+tx('روز پیاپی')}><Flame size={18}/><strong>{fa(report.current)}</strong><span>{tx('روز پیاپی')}</span></Link>;
}
export function StreakCard(){
 const {state}=useStore(),{today}=useLearningClock(),report=streakReport(state,today);
 return <section className={'streak-card '+(report.todayDone?'is-lit':'')} aria-label={tx('زنجیرهٔ یادگیری')}><div><span className="eyebrow"><Flame size={16}/>{tx('شعلهٔ یادگیری')}</span><h2><b>{fa(report.current)}</b> {tx('روز پیاپی')}</h2><p>{tx(report.todayDone?'قدم امروزت ثبت شد. فردا دوباره می‌بینمت!':report.current?'شعله‌ات را روشن نگه دار.':'از یک قدم کوچک شروع کن.')}</p><Link to="streak" className="streak-detail">{tx('دیدن زنجیره')}<ArrowLeft size={16}/></Link></div><FlameArt lit={report.todayDone||report.current>0}/><div className="streak-week">{Array.from({length:7},(_,i)=>addDays(saturday(today),i)).map(d=><span key={d} className={(report.dates.includes(d)?'earned ':'')+(d===today?'today':'')}><small>{new Intl.DateTimeFormat(dateLocale(),{weekday:'narrow'}).format(new Date(d+'T12:00:00Z'))}</small><i>{report.dates.includes(d)?<Check size={14}/>:new Intl.DateTimeFormat(dateLocale(),{day:'numeric'}).format(new Date(d+'T12:00:00Z'))}</i></span>)}</div></section>;
}
export function StreakPage(){
 const {state}=useStore(),{today,remaining}=useLearningClock(),report=streakReport(state,today);
 const [anchor,setAnchor]=useState(today),month=calendarMonth(anchor,dateLocale());
 const countdown=fa(Math.floor(remaining/60))+':'+fa(remaining%60).padStart(2,tx('۰'));
 return <div className="streak-page"><PageHeading eyebrow="یک روز، یک قدم" title={tx('شعلهٔ یادگیری')} description="قرارهای کوچک، مسیرهای بلند می‌سازند."/>
 <section className={'streak-hero '+(report.todayDone?'is-lit':'')}><FlameArt lit={report.current>0}/><span className="streak-orbit orbit-one"/><span className="streak-orbit orbit-two"/><h2><strong data-testid="streak-current">{fa(report.current)}</strong><span>{tx('روز پیاپی')}</span></h2><p>{tx(report.todayDone?'قدم امروزت ثبت شد. فردا دوباره می‌بینمت!':report.current?'شعله‌ات را روشن نگه دار.':'از یک قدم کوچک شروع کن.')}</p><Link className="streak-start" to="today">{tx(report.todayDone?'ادامهٔ یادگیری':'قدم امروز')}<span><ArrowLeft size={20}/></span></Link></section>
 <div className="streak-numbers"><div><Trophy size={22}/><strong>{fa(report.best)}</strong><span>{tx('بهترین زنجیره')}</span></div><div><CalendarDays size={22}/><strong>{fa(report.totalDays)}</strong><span>{tx('روزهای یادگیری')}</span></div></div>
 <section className="panel streak-goal"><div className="split"><h2>{tx('قرار امروز')}</h2><span>{report.todayDone?<Check size={22}/>:<Flame size={22}/>}</span></div><p>{tx('یک درس یا ۱۰ دقیقه مطالعه؛ یک روز دیگر در مسیر.')}</p><progress max="100" value={report.goal} aria-label={tx('هدف روزانه')}/><div className="split"><small>{fa(report.minutesToday)} {tx('دقیقه مطالعه')} · {fa(report.lessonsToday)} {tx('درس کامل')}</small><small>{tx(report.todayDone?'امروز روشن است':'تا پایان امروز')} {!report.todayDone&&<b dir="ltr">{countdown}</b>}</small></div></section>
 <section className="panel streak-calendar"><div className="split"><h2>{tx('تقویم زنجیره')}</h2><button onClick={()=>setAnchor(today)}>{tx('امروز')}</button></div><div className="streak-month"><button aria-label={tx('ماه قبل')} onClick={()=>setAnchor(month.previous)}><ChevronRight size={20}/></button><strong>{new Intl.DateTimeFormat(dateLocale(),{month:'long',year:'numeric'}).format(new Date(anchor+'T12:00:00Z'))}</strong><button aria-label={tx('ماه بعد')} onClick={()=>setAnchor(month.next)}><ChevronLeft size={20}/></button></div><div className="streak-calendar-grid" role="list" aria-label={tx('روزهای ماه')}>{Array.from({length:7},(_,i)=>addDays('2026-11-14',i)).map(d=><span className="weekday" key={d}>{new Intl.DateTimeFormat(dateLocale(),{weekday:'short'}).format(new Date(d+'T12:00:00Z'))}</span>)}{Array.from({length:month.offset},(_,i)=><span key={'empty'+i} aria-hidden="true"/>)}{month.dates.map(d=><div role="listitem" key={d} title={displayDate(d)} aria-label={displayDate(d)+' · '+tx(report.dates.includes(d)?'روز یادگیری':d>today?'پیش رو':'بدون فعالیت ثبت‌شده')} className={'streak-day '+(report.dates.includes(d)?'earned ':'')+(d===today?'today ':'')+(d>today?'future':'')}><span>{new Intl.DateTimeFormat(dateLocale(),{day:'numeric'}).format(new Date(d+'T12:00:00Z'))}</span>{report.dates.includes(d)&&<Star size={9} fill="currentColor"/>}</div>)}</div><p className="streak-legend"><span><i/>{tx('روز یادگیری')}</span><span><i/>{tx('امروز')}</span></p></section>
 <section className="panel streak-milestones"><h2>{tx('نشان‌های پشتکار')}</h2><div>{[3,7,14,30,50,100].map(n=><span key={n} className={report.best>=n?'earned':''}><span><Star size={24} fill={report.best>=n?'currentColor':'none'}/><b>{fa(n)}</b></span><small>{fa(n)} {tx('روز')}</small></span>)}</div></section><p className="streak-footnote">{tx('روزها با ساعت تهران حساب می‌شوند. برداشتن تیک درس یا حذف زمان، اثر همان فعالیت را برمی‌گرداند. روزهای قدیمیِ بدون تاریخ تکمیل شمرده نمی‌شوند.')}</p></div>;
}
export function StreakCelebration(){
 const {state}=useStore(),{today}=useLearningClock(),report=streakReport(state,today),previous=useRef({today,done:report.todayDone});const [show,setShow]=useState(false);
 useEffect(()=>{if(previous.current.today===today&&!previous.current.done&&report.todayDone)setShow(true);previous.current={today,done:report.todayDone}},[today,report.todayDone]);
 useEffect(()=>{if(!show)return;const timer=setTimeout(()=>setShow(false),5500);return()=>clearTimeout(timer)},[show]);
 if(!show)return null;
 return <div className="streak-celebration" role="status"><FlameArt/><div><strong>{fa(report.current)} {tx('روز پیاپی')}</strong><span>{tx('یک قدم دیگر؛ آفرین به پشتکارت!')}</span></div><button onClick={()=>setShow(false)} aria-label={tx('بستن پیام')}><Check size={20}/></button></div>;
}
