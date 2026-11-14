import {useMemo,useState} from 'react';
import {Activity,Anchor,BookOpen,ChartNoAxesCombined,Flag,GraduationCap,Ship,Target} from 'lucide-react';
import {useStore} from './store';
import {learningOverview,autoLabels} from './learning';
import {PageHeading} from './App';
import {fa,displayDate} from './logic';
import {Link,Meter,tracks} from './components';
import {StatCard,Surface,trackTones} from './ui';
import Odyssey from './Odyssey';
import {CompletionDonut,TrackRadar,StudyChart,WeeklyChart} from './ProgressCharts';
import './progress.css';

export default function ProgressPage(){
 const {state}=useStore();const report=useMemo(()=>learningOverview(state),[state]);const [period,setPeriod]=useState(7);
 return <div className="progress-page">
  <PageHeading eyebrow="از تروا تا ایتاکا" title="پیشرفت و سفر ادیسه" description="آنچه آموخته‌ای، مسیری که پیموده‌ای و افقی که پیش رو داری." action={<Link className="outline" to="skills"><GraduationCap size={18}/>دیدن مهارت‌ها</Link>}/>
  <p className="sr-only" role="status" aria-live="polite">{fa(report.completion)} درصد تکمیل؛ {fa(report.learning)} درصد شواهد؛ کشتی در هفته {fa(report.currentWeek)}.</p>
  <Odyssey report={report}/>
  <div className="stat-grid"><StatCard tone="blue" label="تکمیل مسیر" icon={Flag} value={<>{fa(report.completion)}<small>٪</small></>} progress={report.completion} detail={fa(report.done)+' فعالیت از '+fa(report.total)}/><StatCard tone="violet" label="شواهد یادگیری" icon={BookOpen} value={<>{fa(report.learning)}<small>٪</small></>} detail="مطالعه، تمرین، خروجی و توضیح"/><StatCard tone="rose" label="مهارت با تمرین عملی" icon={Target} value={fa(report.practiced)} detail={fa(report.started)+' مهارت در حال یادگیری'}/><StatCard tone="amber" label="پروژه‌های تحویل‌شده" icon={Anchor} value={fa(report.delivered)} detail={fa(report.projectProgress)+'٪ چک‌لیست‌های اصلی'}/></div>
  <div className="progress-two-columns"><Surface tone="blue" className="chart-panel"><h2><ChartNoAxesCombined size={21}/>تصویر کلی پیشرفت</h2><CompletionDonut report={report}/><p className="muted">تکمیل با زمان برنامه‌ریزی‌شده وزن می‌گیرد؛ آزمایش اختیاری CUDA در مخرج اصلی نیست.</p></Surface><Surface tone="violet" className="chart-panel"><h2><Target size={21}/>تعادل مسیرهای یادگیری</h2><TrackRadar report={report}/></Surface></div>
  <Surface tone="violet" className="chart-panel"><div className="split"><h2><Activity size={21}/>ریتم واقعی مطالعه</h2><div className="chart-tabs" aria-label="بازه نمودار">{[7,30].map(n=><button key={n} aria-pressed={period===n} onClick={()=>setPeriod(n)}>{fa(n)} روز اخیر</button>)}</div></div><p className="muted">روزهایی که برای آموختن وقت گذاشته‌ای؛ بر پایهٔ زمان مطالعه‌ات.</p><StudyChart days={report.studyDays.slice(-period)}/><div className="study-heatmap" aria-label="تقویم مطالعهٔ ۳۰ روز اخیر">{report.studyDays.map(d=><span key={d.date} title={displayDate(d.date)+' · '+fa(d.minutes)+' دقیقه'} aria-label={displayDate(d.date)+' · '+fa(d.minutes)+' دقیقه'} data-level={d.minutes===0?0:d.minutes<30?1:d.minutes<90?2:3}/>)}</div><small className="muted">۳۰ روز اخیر · رنگ پررنگ‌تر یعنی زمان ثبت‌شدهٔ بیشتر</small></Surface>
  <Surface tone="blue" className="chart-panel"><h2><Flag size={21}/>۲۶ ایستگاه هفتگی</h2><WeeklyChart report={report}/></Surface>
  <div className="progress-two-columns"><Surface tone="rose" className="chart-panel"><h2><GraduationCap size={21}/>مهارت‌هایی که در سفر ساخته‌ای</h2>{report.reports.filter(s=>s.score>0).length?report.reports.filter(s=>s.score>0).sort((a,b)=>b.score-a.score).slice(0,8).map(s=><Link to={'skill/'+s.id} key={s.id} className="progress-skill" data-tone={trackTones[s.track]}><div><strong>{s.title}</strong><span>{autoLabels[s.autoLevel]}</span></div><b>{fa(s.score)}٪ ↗</b></Link>):<div className="empty"><BookOpen size={28}/><p>سفر هنوز در بندر آغاز است.</p><Link className="primary" to="activity/w1-backend-study">شروع اولین درس</Link></div>}<p className="muted">{fa(report.selfSupported)} خودارزیابی همراه با نمونهٔ کار</p><Link className="text-link" to="skills">همهٔ مهارت‌ها و شواهدشان ↗</Link></Surface><Surface tone="amber" className="chart-panel"><h2><Ship size={21}/>قطب‌نمای قدم بعدی</h2>{report.next?<><span className="eyebrow">هفته {fa(report.next.week)} · {tracks[report.next.track]}</span><h3>{report.next.title}</h3><p>{report.next.description}</p><Link className="primary" to={'activity/'+report.next.id}>ادامهٔ سفر از این درس ↗</Link></>:<p>همهٔ فعالیت‌های اصلی تکمیل شده‌اند؛ شواهد، پروژه‌ها و خودارزیابی را در مرور نهایی بررسی کن.</p>}<div className="voyage-track-list">{report.tracks.map(t=><div key={t.id} data-tone={trackTones[t.id]}><Meter value={t.learning} label={tracks[t.id]}/></div>)}</div><p className="muted">جزیرهٔ کامل، پایان برنامهٔ آن مرحله است؛ مهارتِ قابل ادعا به تمرین، توضیح و نمونهٔ کار نیاز دارد.</p></Surface></div>
 </div>;
}
