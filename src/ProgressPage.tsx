import { tx } from "./locale";
import { useMemo, useState } from "react";
import { Activity, Anchor, BookOpen, ChartNoAxesCombined, Flag, GraduationCap, Ship, Target } from "lucide-react";
import { useStore } from "./store";
import { learningOverview, autoLabels } from "./learning";
import { PageHeading } from "./App";
import { fa, displayDate } from "./logic";
import { Link, Meter, tracks } from "./components";
import { StatCard, Surface, trackTones, TrackMark } from "./ui";
import Odyssey from "./Odyssey";
import { CompletionDonut, TrackRadar, StudyChart, WeeklyChart } from "./ProgressCharts";
import "./progress.css";
export default function ProgressPage() {
  const {
    state
  } = useStore();
  const report = useMemo(() => learningOverview(state), [state]);
  const [period, setPeriod] = useState(7);
  return <div className="progress-page">
  <PageHeading eyebrow="از تروا تا ایتاکا" title={tx("پیشرفت و سفر ادیسه")} description="آنچه آموخته‌ای، مسیری که پیموده‌ای و افقی که پیش رو داری." action={<Link className="outline" to="skills"><GraduationCap size={18} />{tx("دیدن مهارت‌ها")}</Link>} />
  <p className="sr-only" role="status" aria-live="polite">{tx(fa(report.completion))}{tx(" درصد تکمیل؛ ")}{tx(fa(report.learning))}{tx(" درصد شواهد؛ کشتی در هفته ")}{tx(fa(report.currentWeek))}.</p>
  <Odyssey report={report} />
  <div className="stat-grid"><StatCard tone="blue" label="تکمیل مسیر" icon={Flag} value={<>{tx(fa(report.completion))}<small>{tx("٪")}</small></>} progress={report.completion} detail={fa(report.done) + " فعالیت از " + fa(report.total)} /><StatCard tone="violet" label="شواهد یادگیری" icon={BookOpen} value={<>{tx(fa(report.learning))}<small>{tx("٪")}</small></>} detail="مطالعه، تمرین، خروجی و توضیح" /><StatCard tone="rose" label="مهارت با تمرین عملی" icon={Target} value={fa(report.practiced)} detail={fa(report.started) + " مهارت در حال یادگیری"} /><StatCard tone="amber" label="پروژه‌های تحویل‌شده" icon={Anchor} value={fa(report.delivered)} detail={fa(report.projectProgress) + "٪ چک‌لیست‌های اصلی"} /></div>
  <div className="progress-two-columns"><Surface tone="blue" className="chart-panel"><h2><ChartNoAxesCombined size={21} />{tx("تصویر کلی پیشرفت")}</h2><CompletionDonut report={report} /><p className="muted">{tx("تکمیل با زمان برنامه‌ریزی‌شده وزن می‌گیرد؛ آزمایش اختیاری CUDA در مخرج اصلی نیست.")}</p></Surface><Surface tone="violet" className="chart-panel"><h2><Target size={21} />{tx("تعادل مسیرهای یادگیری")}</h2><TrackRadar report={report} /></Surface></div>
  <Surface tone="violet" className="chart-panel"><div className="split"><h2><Activity size={21} />{tx("ریتم واقعی مطالعه")}</h2><div className="chart-tabs" aria-label={tx("بازه نمودار")}>{tx([7, 30].map(n => <button key={n} aria-pressed={period === n} onClick={() => setPeriod(n)}>{tx(fa(n))}{tx(" روز اخیر")}</button>))}</div></div><p className="muted">{tx("روزهایی که برای آموختن وقت گذاشته‌ای؛ بر پایهٔ زمان مطالعه‌ات.")}</p><StudyChart days={report.studyDays.slice(-period)} /><div className="study-heatmap" aria-label={tx("تقویم مطالعهٔ ۳۰ روز اخیر")}>{tx(report.studyDays.map(d => <span key={d.date} title={tx(displayDate(d.date) + " · " + fa(d.minutes) + " دقیقه")} aria-label={tx(displayDate(d.date) + " · " + fa(d.minutes) + " دقیقه")} data-level={d.minutes === 0 ? 0 : d.minutes < 30 ? 1 : d.minutes < 90 ? 2 : 3} />))}</div><small className="muted">{tx("۳۰ روز اخیر · رنگ پررنگ‌تر یعنی زمان ثبت‌شدهٔ بیشتر")}</small></Surface>
  <Surface tone="blue" className="chart-panel"><h2><Flag size={21} />{tx("۲۶ ایستگاه هفتگی")}</h2><WeeklyChart report={report} /></Surface>
  <div className="progress-two-columns"><Surface tone="rose" className="chart-panel"><h2><GraduationCap size={21} />{tx("مهارت‌هایی که در سفر ساخته‌ای")}</h2>{tx(report.reports.filter(s => s.score > 0).length ? report.reports.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 8).map(s => <Link to={"skill/" + s.id} key={s.id} className="progress-skill" data-tone={trackTones[s.track]}><div><strong>{tx(s.title)}</strong><span>{tx(autoLabels[s.autoLevel])}</span></div><b>{tx(fa(s.score))}{tx("٪ ↗")}</b></Link>) : <div className="empty"><BookOpen size={28} /><p>{tx("هنوز در ساحل تروا هستی.")}</p><Link className="primary" to="activity/w1-backend-study">{tx("شروع اولین درس")}</Link></div>)}<p className="muted">{tx(fa(report.selfSupported))}{tx(" خودارزیابی همراه با نمونهٔ کار")}</p><Link className="text-link" to="skills">{tx("همهٔ مهارت‌ها و شواهدشان ↗")}</Link></Surface><Surface tone="amber" className="chart-panel"><h2><Ship size={21} />{tx("قطب‌نمای قدم بعدی")}</h2>{tx(report.next ? <><span className="eyebrow">{tx("هفته ")}{tx(fa(report.next.week))} · {tx(tracks[report.next.track])}</span><h3>{tx(report.next.title)}</h3><p>{tx(report.next.description)}</p><Link className="primary" to={"activity/" + report.next.id}>{tx("ادامهٔ سفر از این درس ↗")}</Link></> : <p>{tx("همهٔ فعالیت‌های اصلی تکمیل شده‌اند؛ شواهد، پروژه‌ها و خودارزیابی را در مرور نهایی بررسی کن.")}</p>)}<div className="voyage-track-list">{tx(report.tracks.map(t => <div key={t.id} data-tone={trackTones[t.id]}><TrackMark track={t.id}/><Meter value={t.learning} label={tracks[t.id]} /></div>))}</div><p className="muted">{tx("جزیرهٔ کامل، پایان برنامهٔ آن مرحله است؛ مهارتِ قابل ادعا به تمرین، توضیح و نمونهٔ کار نیاز دارد.")}</p></Surface></div>
 </div>;
}
