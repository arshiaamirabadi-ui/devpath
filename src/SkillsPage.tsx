import {useState} from 'react';
import {ArrowUpLeft,BookOpen,Check,Link2,Sparkles,Target} from 'lucide-react';
import {skills,projects} from './content';
import {useStore} from './store';
import {PageHeading} from './App';
import {Link,Meter,Tag,tracks} from './components';
import {Surface,trackTones,StatCard} from './ui';
import {skillReport,autoLabels} from './learning';
import {fa} from './logic';

export default function SkillsPage({id}:{id?:string}){
 const {state,update}=useStore();const focused=skills.find(s=>s.id===id);
 const [track,setTrack]=useState(focused?.track??'all'),[filter,setFilter]=useState('all');
 const reports=skills.map(s=>({...s,...skillReport(s.id,state)}));
 const levels=['هنوز شروع نکرده‌ام','با راهنما انجام می‌دهم','مستقل انجام می‌دهم','می‌توانم توضیح بدهم و اشکال‌زدایی کنم'];
 const list=reports.filter(s=>(!focused||s.id===focused.id)&&(track==='all'||s.track===track)&&(filter==='all'||(filter==='active'?s.score>0:s.autoLevel>=2)));
 return <>
  <PageHeading eyebrow="از درس تا توانایی قابل نمایش" title="مهارت‌ها و ارزیابی" description="آنچه می‌دانی را تمرین کن، نتیجه‌اش را نشان بده و با زبان خودت توضیح بده." action={<Link className="primary" to="progress">سفر و نمودار پیشرفت <ArrowUpLeft size={17}/></Link>}/>
  <div className="stat-grid skill-summary">
   <StatCard tone="blue" icon={BookOpen} label="در حال یادگیری" value={fa(reports.filter(s=>s.score>0).length)} detail="مهارت‌هایی که آغاز کرده‌ای"/>
   <StatCard tone="violet" icon={Target} label="توانایی عملی" value={fa(reports.filter(s=>s.autoLevel>=2).length)} detail="دانش همراه با تمرین و خروجی"/>
   <StatCard tone="rose" icon={Sparkles} label="آمادهٔ توضیح" value={fa(reports.filter(s=>s.autoLevel===3).length)} detail="فهمی که می‌توانی بیانش کنی"/>
  </div>
  <Surface tone="violet" className="connection-explainer"><Link2 size={24}/><div><h2>دانستن، انجام‌دادن، توضیح‌دادن</h2><p>یک مهارت زمانی محکم می‌شود که بتوانی آن را به کار ببری، نتیجه‌اش را نشان بدهی و توضیحش بدهی.</p><details><summary>راهنمای ارزیابی</summary><p>۵۰٪ تکمیل درس‌ها، ۱۵٪ شاهد مطالعه، ۲۵٪ تمرین یا خروجی مرتبط، ۱۰٪ توانایی توضیح. چک‌لیست‌های مشخص پروژه به شاهد تمرین کمک می‌کنند. این امتیاز، شواهد ثبت‌شدهٔ توست و آزمون مستقل تسلط نیست.</p><small>برداشتن هر تیک، اثر همان شاهد را برمی‌گرداند. ثبت زمان و بازکردن منبع امتیاز یادگیری نمی‌سازد.</small></details></div></Surface>
  <section className="panel skill-filters"><div className="filters"><label>مسیر<select aria-label="مسیر" value={track} onChange={e=>setTrack(e.target.value)}><option value="all">همه مسیرها</option>{Object.entries(tracks).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>نمایش مهارت‌ها<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">همه مهارت‌ها</option><option value="active">دارای پیشرفت</option><option value="practiced">دارای تمرین عملی</option></select></label>{focused&&<Link className="outline" to="skills">همه مهارت‌ها</Link>}</div></section>
  <div className="skills-grid">{list.map(s=>{
   const v=state.skills[s.id]??{level:0,evidence:'',levels:{} as Record<string,string>};
   const next=s.activities.find(a=>state.activities[a.id]?.status!=='done');
   return <Surface tone={trackTones[s.track]} key={s.id} className="skill-card" data-testid={'skill-'+s.id}>
    <div className="split"><Tag track={s.track}/><span className="auto-status"><Sparkles size={14}/>{autoLabels[s.autoLevel]}</span></div><h2>{s.title}</h2>
    <Meter value={s.score} label="پیشرفت یادگیری"/>
    <div className="evidence-grid"><span><strong>{fa(s.completion)}٪</strong>تکمیل درس</span><span><strong>{fa(s.read)}٪</strong>مطالعه</span><span><strong>{fa(s.practice)}٪</strong>تمرین / خروجی</span><span><strong>{fa(s.explained)}٪</strong>توضیح</span></div>
    {next&&<Link className="skill-next" to={'activity/'+next.id}><BookOpen size={17}/><span>قدم بعدی<strong>{next.title}</strong></span><ArrowUpLeft size={17}/></Link>}
    <details className="skill-connections"><summary><Link2 size={16}/>درس‌ها و تمرین‌های مرتبط <span>{fa(s.activities.length)} درس</span></summary><ul>{s.activities.map(a=><li key={a.id}><Link to={'activity/'+a.id}>{state.activities[a.id]?.status==='done'?<Check size={15}/>:<BookOpen size={15}/>}<span>هفته {fa(a.week)} · {a.title}</span></Link></li>)}</ul>{s.projects.map(ref=>{const project=projects.find(p=>p.id===ref.projectId)!;return <div className="skill-project-evidence" key={ref.projectId}><Link to={'project/'+ref.projectId}>{project.title} ↗</Link><ul>{ref.checks.map(i=><li key={i}>{state.projects[ref.projectId]?.checks.includes(i)?'✓':'○'} {project.checklist[i]}</li>)}</ul></div>})}</details>
    <div className="self-assessment"><h3>خودارزیابی شخصی</h3><p className="muted">برای توانایی‌ای که انتخاب می‌کنی یک تمرین، پروژه یا نمونهٔ کار معرفی کن.</p><label>سطح فعلی<select aria-label="سطح فعلی" value={v.level} onChange={e=>update(x=>({...x,skills:{...x.skills,[s.id]:{...v,level:Number(e.target.value),levels:{...v.levels,[String(v.level)]:v.evidence},evidence:v.levels?.[e.target.value]??''}}}))}>{levels.map((l,i)=><option key={l} value={i}>{l}</option>)}</select></label><label>شاهد این سطح (پروژه، تمرین یا یادداشت)<textarea aria-label="شاهد این سطح (پروژه، تمرین یا یادداشت)" value={v.evidence} maxLength={20000} onChange={e=>update(x=>({...x,skills:{...x.skills,[s.id]:{...v,evidence:e.target.value,levels:{...v.levels,[String(v.level)]:e.target.value}}}}))} placeholder="چه کاری را مستقل انجام دادی؟ لینک یا شرح نمونه…"/></label>{Object.entries(v.levels??{}).filter(([level,evidence])=>Number(level)!==v.level&&evidence.trim()).map(([level,evidence])=><p className="muted" key={level}>{levels[Number(level)]}: {evidence}</p>)}{v.level>0&&!v.evidence.trim()&&<small className="warning">برای این سطح هنوز شاهدی ثبت نشده است.</small>}</div>
   </Surface>;
  })}</div>{!list.length&&<div className="empty">مهارتی با این فیلتر پیدا نشد؛ یک درس یا تمرین مرتبط را انجام بده.</div>}
 </>;
}
