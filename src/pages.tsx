import { tx, dateLocale } from "./locale";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, Bookmark, Check, Download, ExternalLink, FolderKanban, Search, Upload, CalendarDays, RotateCcw } from "lucide-react";
import { guidance, months, projects, resources, skills, tools, weeks, type Track } from "./content";
import { ActivityRow, Empty, External, Link, Meter, Notes, Sessions, Tag, allActivities, tracks } from "./components";
import { PageHeading } from "./App";
import LessonContent from "./lesson-loader";
import ActivityImpact from "./ActivityImpact";
import {saveBackup} from "./backup-export";
import LearningCalendar from './LearningCalendar';
import DailyAgenda from './DailyAgenda';
import InstallGuide from './InstallGuide';
import { Surface, trackTones, TrackMark } from "./ui";
import { projectTrack } from "./learning";
import { checklistGuides } from "./lessons";
import { useStore } from "./store";
import { addDays, blankActivity, buildSchedule, displayDate, fa, freshState, parseBackup, progress, saturday, todayISO, totalMinutes, type PersonalState } from "./logic";
function WeekOutput({
  target
}: {
  target: string;
}) {
  const {
    state,
    update
  } = useStore();
  const id = "output-" + target;
  const saved = state.notes.find(n => n.id === id)?.text ?? "";
  const [message, setMessage] = useState("");
  return <section className="panel"><h2>{tx("لینک خروجی هفته")}</h2><form onSubmit={e => {
      e.preventDefault();
      const text = String(new FormData(e.currentTarget).get("week-output") ?? "");
      if (text && !/^https?:\/\//i.test(text)) {
        setMessage("لینک باید با http یا https شروع شود.");
        return;
      }
      if (update(s => ({
        ...s,
        notes: [...s.notes.filter(n => n.id !== id), ...(text ? [{
          id,
          target,
          text,
          updatedAt: new Date().toISOString()
        }] : [])]
      }))) setMessage("لینک خروجی هفته ذخیره شد.");
    }}><label>{tx("لینک مخزن، تمرین یا گزارش هفته")}<input dir="ltr" type="url" name="week-output" defaultValue={saved} placeholder={tx("https://…")} /></label><button type="submit">{tx("ذخیره لینک هفته")}</button><span className="success" role="status">{tx(message)}</span></form>{saved && /^https?:\/\//i.test(saved) && <p><External url={saved}>{tx("بازکردن خروجی هفته")}</External></p>}<small className="muted">{tx("این لینک در یادداشت‌های همین هفته و نسخه پشتیبان نگهداری می‌شود.")}</small></section>;
}
export function WeekPage({
  number
}: {
  number: number;
}) {
  const w = weeks.find(w => w.number === number);
  const {
    state
  } = useStore();
  if (!w) return <Empty>{tx("هفته پیدا نشد. ")}<Link to="roadmap">{tx("نقشه راه")}</Link></Empty>;
  return <><PageHeading eyebrow={"ماه " + fa(w.month) + " · هفته " + fa(w.number) + (w.supplemental ? " · پیشنهاد تکمیلی" : "")} title={tx(w.title)} description={w.goal} action={<Link className="outline" to="roadmap">{tx("نقشه راه ")}<ArrowLeft size={17} /></Link>} /><section className="panel"><Meter value={progress(w.activities, state)} label="پیشرفت وزنی این هفته" /><div className="info-grid"><div><h2>{tx("پیش‌نیازها")}</h2><ul>{tx(w.prerequisites.map(p => <li key={p}>{tx(p)}</li>))}</ul>{tx(number > 1 && <Link to={"week/" + (number - 1)} className="text-link">{tx("مرور هفته قبل")}</Link>)}<p className="muted">{tx("وابستگی‌ها راهنمای یادگیری‌اند؛ هفته آینده قفل نیست.")}</p></div><div><h2>{tx("خروجی قابل تحویل")}</h2><p>{tx(w.deliverable)}</p><ul>{tx(w.criteria.map(p => <li key={p}>{tx(p)}</li>))}</ul></div></div></section><section className="panel"><div className="section-heading"><h2>{tx("درس‌ها و تمرین‌ها")}</h2><span className="muted">{tx("۱۵ ساعت محتوایی")}</span></div><p className="muted">{tx("زیر هر فعالیت «راهنمای درس» را باز کن؛ توضیح مفهوم، بخش منبع، مراحل اجرا و تمرین همان‌جا قرار دارد. برای ثبت زمان و شاهد روی نام درس بزن.")}</p>{tx(w.activities.map(a => <ActivityRow key={a.id} a={a} />))}<p className="muted">{tx("پیشنهاد تکمیلی: هدف قابل سنجش، پیش‌نیاز دقیق، پرسش‌ها، معیار تحویل و تقسیم زمان برای اجرایی‌کردن مباحث اصلی افزوده شده‌اند؛ هر زمان فقط یک بار شمرده می‌شود.")}</p></section><section className="panel"><h2>{tx("خودت را بسنج")}</h2><ol>{tx(w.questions.map(q => <li key={q}>{tx(q)}</li>))}</ol><p className="muted">{tx("پاسخ‌ها و لینک خروجی را در یادداشت ثبت کن؛ توانایی توضیح را جدا در صفحه مهارت‌ها بسنج.")}</p><div className="button-row"><Link className="outline" to="review">{tx("مرور هفتگی")}</Link><Link className="outline" to="skills">{tx("ارزیابی مهارت‌ها")}</Link>{tx(number < 26 && <Link className="primary" to={"week/" + (number + 1)}>{tx("هفته بعد ")}<ArrowLeft size={16} /></Link>)}</div></section><WeekOutput target={w.id} /><Notes target={w.id} /></>;
}
export function ActivityPage({
  id
}: {
  id: string;
}) {
  const {
    state,
    update
  } = useStore();
  const a = allActivities().find(a => a.id === id);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (a) update(s => s.lastActivity === id ? s : {
      ...s,
      lastActivity: id
    });
  }, [id]);
  if (!a) return <Empty>{tx("فعالیت پیدا نشد.")}</Empty>;
  const v = state.activities[id] ?? blankActivity;
  const patch = (p: Partial<typeof v>) => {
    if (update(s => ({
      ...s,
      lastActivity: id,
      activities: {
        ...s.activities,
        [id]: {
          ...(s.activities[id] ?? blankActivity),
          ...p
        }
      }
    }))) setMessage("تغییر ذخیره شد.");
  };
  return <><PageHeading eyebrow={"میز مطالعه · هفته " + fa(a.week)} title={tx(a.title)} description={a.description} action={<Link className="outline" to={"week/" + a.week}>{tx("برگشت به هفته ")}<ArrowLeft size={17} /></Link>} /><ActivityImpact id={id} /><LessonContent activityId={id} /><section className="panel"><h2>{tx("ثبت یادگیری و خروجی")}</h2><div className="split"><Tag track={a.track} /><span>{tx(fa(a.minutes))}{tx(" دقیقه · ")}{tx(a.optional ? "اختیاری" : "اجباری")}</span></div>{tx(a.supplemental && <p className="supplement">{tx("پیشنهاد تکمیلی: جزئیات اجرایی این فعالیت برای عملی‌کردن رودمپ افزوده شده است.")}</p>)}<h2>{tx("معیار اتمام")}</h2><p>{tx(a.acceptance)}</p><label>{tx("وضعیت فعالیت")}<select aria-label={tx("وضعیت فعالیت")} value={v.status} onChange={e => patch({
          status: e.target.value as typeof v.status
        })}><option value="todo">{tx("شروع‌نشده")}</option><option value="doing">{tx("در حال انجام")}</option><option value="done">{tx("انجام‌شده")}</option></select></label><div className="learning-checks">{tx(([["read", "مطالعه کردم"], ["practiced", "تمرین کردم"], ["explained", "می‌توانم توضیح بدهم"]] as const).map(([key, label]) => <label className="checkbox-label" key={key}><input type="checkbox" checked={v[key]} onChange={e => patch({
            [key]: e.target.checked
          })} />{tx(label)}</label>))}</div><p className="muted">{tx("این سه شاهد، جدا از وضعیت تکمیل ذخیره می‌شوند. بازکردن منبع هیچ‌کدام را تغییر نمی‌دهد.")}</p><form onSubmit={e => {
        e.preventDefault();
        const output = String(new FormData(e.currentTarget).get("output") ?? "");
        if (output && !/^https?:\/\//i.test(output)) {
          setMessage("لینک باید با http یا https شروع شود.");
          return;
        }
        patch({
          output
        });
      }}><label>{tx("لینک خروجی (https یا http)")}<input dir="ltr" name="output" type="url" defaultValue={v.output} placeholder={tx("https://github.com/…")} /></label><button type="submit">{tx("ذخیره لینک خروجی")}</button></form><span role="status" className="success">{tx(message)}</span>{tx(v.output && <External url={v.output}>{tx("بازکردن خروجی")}</External>)}</section><Sessions activityId={id} /><Notes target={id} /></>;
}
export function TodayPage() {
  const {
    state,
    update
  } = useStore();
  const activities = allActivities();
  const schedule = useMemo(() => buildSchedule(activities, state.settings), [state.settings]);
  const [selected, setSelected] = useState(todayISO()),
    [week, setWeek] = useState(1),
    [track, setTrack] = useState("all");
  const [dayStart,setDayStart]=useState(()=>{try{const value=localStorage.getItem('devpath.agenda.start')??'09:00';return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)?value:'09:00'}catch{return '09:00'}});
  const start = saturday(selected);
  const calendarDays=useMemo(()=>{
   const result:Record<string,{count:number;project:boolean}>={};
   for(const a of activities.filter(a=>!a.optional)){
    const dates=state.planned[a.id]?[state.planned[a.id]]:Object.keys(schedule.portions).filter(d=>schedule.portions[d].some(p=>p.id===a.id));
    for(const date of dates){const previous=result[date]??{count:0,project:false};result[date]={count:previous.count+1,project:previous.project||a.track==='project'};}
   }return result;
  },[state.planned,schedule]);
  const due = activities.filter(a => !a.optional && (state.planned[a.id] ? state.planned[a.id] === selected : (schedule.portions[selected] ?? []).some(p => p.id === a.id)));
  return <><PageHeading eyebrow="یک برنامه منعطف، با انتخاب تو" title={tx("برنامه امروز")} description="فعالیت‌ها طبق ظرفیت روزهای مطالعه پخش شده‌اند. می‌توانی تاریخ هر فعالیت را تغییر بدهی." /><section className="panel today-plan"><div className="today-calendar-layout"><LearningCalendar selected={selected} onSelect={setSelected} days={calendarDays}/><div className="today-date-summary"><div className="split"><label>{tx("روز مورد نظر")}<input type="date" value={selected} onChange={e => e.target.value && setSelected(e.target.value)} /></label><span className="today-full-date">{tx(displayDate(selected))}</span></div><div className="day-plan-stats"><span><strong>{fa(due.length)}</strong>{tx("فعالیت روز")}</span><span><strong>{fa(due.reduce((sum,a)=>sum+(state.planned[a.id]?a.minutes:schedule.portions[selected]?.find(p=>p.id===a.id)?.minutes??a.minutes),0))}</strong>{tx("دقیقه برنامه")}</span><label>{tx("آغاز مطالعه")}<input aria-label={tx("آغاز مطالعه")} type="time" value={dayStart} onChange={e=>{if(!e.target.value)return;setDayStart(e.target.value);try{localStorage.setItem('devpath.agenda.start',e.target.value)}catch{}}}/></label></div><p className="agenda-time-note">{tx("بازه‌ها از ساعت شروع و مدت فعالیت‌ها چیده می‌شوند؛ با تغییر ساعت شروع می‌توانی برنامهٔ روز را تنظیم کنی.")}</p></div></div><div className="calendar-week">{tx(Array.from({
          length: 7
        }, (_, i) => addDays(start, i)).map(d => <button data-has-work={activities.some(a => !a.optional && (state.planned[a.id] ? state.planned[a.id] === d : (schedule.portions[d] ?? []).some(p => p.id === a.id)))} className={selected === d ? "selected" : ""} key={d} onClick={() => setSelected(d)}><span>{tx(new Intl.DateTimeFormat(dateLocale(), {
              weekday: "short"
            }).format(new Date(d + "T12:00Z")))}</span><strong>{tx(new Intl.DateTimeFormat(dateLocale(), {
              day: "numeric"
            }).format(new Date(d + "T12:00Z")))}</strong><small>{tx(fa(totalMinutes(state, d, d)))}{tx(" دقیقه")}</small></button>))}</div><h2>{tx("فعالیت‌های ")}{tx(displayDate(selected))}</h2>{tx(due.length ? <DailyAgenda start={dayStart} focus={due.find(a=>state.activities[a.id]?.status!=="done")} items={due.map(a=>({activity:a,minutes:state.planned[a.id]?a.minutes:schedule.portions[selected]?.find(p=>p.id===a.id)?.minutes??a.minutes}))}/> : <Empty>{tx("فعالیتی برای این روز نیست. از فهرست پایین برنامه‌ریزی کن.")}</Empty>)}<p className="muted">{tx("فعالیت طولانی ممکن است در چند روز سهم زمانی داشته باشد. جابه‌جایی دستی، تمام فعالیت را به تاریخ انتخابی می‌برد.")}</p></section><section className="panel reschedule-panel"><h2>{tx("تقسیم و جابه‌جایی فعالیت‌ها")}</h2><div className="filters"><label>{tx("هفته")}<select aria-label={tx("هفته")} value={week} onChange={e => setWeek(Number(e.target.value))}>{tx(weeks.map(w => <option key={w.id} value={w.number}>{tx("هفته ")}{tx(fa(w.number))} · {tx(w.title)}</option>))}</select></label><label>{tx("مسیر")}<select aria-label={tx("مسیر")} value={track} onChange={e => setTrack(e.target.value)}><option value="all">{tx("همه مسیرها")}</option>{tx(Object.entries(tracks).map(([k, v]) => <option key={k} value={k}>{tx(v)}</option>))}</select></label></div>{tx(activities.filter(a => a.week === week && (track === "all" || a.track === track)).map(a => <div className="plan-row" data-tone={trackTones[a.track]} key={a.id}><div className="plan-controls"><label><CalendarDays size={16} aria-hidden="true"/><span>{tx("روز فعالیت")}</span><input type="date" value={state.planned[a.id] ?? schedule.dates[a.id] ?? selected} onChange={e => e.target.value && update(s => ({
            ...s,
            planned: {
              ...s.planned,
              [a.id]: e.target.value
            }
          }))} /></label>{tx(state.planned[a.id] && <button onClick={() => update(s => {
          const planned = {
            ...s.planned
          };
          delete planned[a.id];
          return {
            ...s,
            planned
          };
        })}><RotateCcw size={15} aria-hidden="true"/>{tx("برنامهٔ پیشنهادی")}</button>)}</div><ActivityRow a={a} /></div>))}</section><Sessions /></>;
}
const emptyProject = {
  checks: [] as number[],
  repo: "",
  demo: "",
  docs: "",
  notes: ""
};
export function ProjectsPage({
  id
}: {
  id?: string;
}) {
  const {
    state,
    update
  } = useStore();
  const p = projects.find(p => p.id === id);
  const [message, setMessage] = useState("");
  if (id && !p) return <Empty>{tx("پروژه پیدا نشد.")}</Empty>;
  if (!p) return <><PageHeading eyebrow="آنچه می‌سازی، شاهد یادگیری توست" title={tx("پروژه‌های من")} description="چک‌لیست تحویل، پیشرفت پروژه و شاهد تمرین مهارت‌های مرتبط را به‌روز می‌کند؛ درس‌های انجام‌نشده همچنان برای مطالعه باقی می‌مانند." /><div className="project-grid">{tx(projects.map((p, i) => {
        const v = state.projects[p.id] ?? emptyProject;
        return <Link to={"project/" + p.id} className="panel project-card" data-tone={trackTones[projectTrack(p.id)]} key={p.id}><div className="split"><TrackMark track={projectTrack(p.id)}/><Tag track={projectTrack(p.id)}/><span className="eyebrow">{tx("پروژه ")}{tx(fa(i + 1))}</span></div><h2>{tx(p.title)}</h2><p>{tx(p.description)}</p><small>{tx("هفته‌های ")}{tx(p.weeks.map(fa).join("، "))}</small><Meter value={Math.round(v.checks.filter(x => x < p.checklist.length).length / p.checklist.length * 100)} label="چک‌لیست تحویل" /><span className="text-link">{tx("جزئیات و ثبت خروجی ")}<ArrowUpLeft size={16} /></span></Link>;
      }))}</div></>;
  const v = state.projects[p.id] ?? emptyProject;
  const patch = (change: Partial<typeof v>) => update(s => ({
    ...s,
    projects: {
      ...s.projects,
      [p.id]: {
        ...(s.projects[p.id] ?? emptyProject),
        ...change
      }
    }
  }));
  return <><PageHeading eyebrow={"پروژه آموزشی · هفته‌های " + p.weeks.map(fa).join("، ")} title={tx(p.title)} description={p.description} action={<Link to="projects" className="outline">{tx("همه پروژه‌ها")}</Link>} /><section className="panel"><h2>{tx("پیش‌نیازها و هفته‌های مرتبط")}</h2><ul>{tx(p.prerequisites.map(x => <li key={x}>{tx(x)}</li>))}</ul><div className="button-row">{tx(p.weeks.map(n => <Link className="chip" key={n} to={"week/" + n}>{tx("هفته ")}{tx(fa(n))}</Link>))}</div><h2>{tx("مراحل ساخت")}</h2><ol>{tx(p.steps.map(x => <li key={x}>{tx(x)}</li>))}</ol><p className="supplement">{tx("پیشنهاد تکمیلی: مراحل اجرایی و معیارهای بررسی، بسط آموزشی پروژه‌های رودمپ هستند.")}</p></section><section className="panel"><h2>{tx("چک‌لیست تحویل")}</h2><Meter value={Math.round(v.checks.filter(x => x < p.checklist.length).length / p.checklist.length * 100)} label="پیشرفت پروژه" />{tx(p.checklist.map((x, i) => {
        const guide = checklistGuides[p.id][i];
        return <div className="project-check-guide" key={x}><label className="checklist-row"><input type="checkbox" checked={v.checks.includes(i)} onChange={e => patch({
              checks: e.target.checked ? [...v.checks, i] : v.checks.filter(c => c !== i)
            })} />{tx(x)}</label><details open={i === 0}><summary>{tx("چطور این مورد را بسازم و بررسی کنم؟")}</summary><p>{tx(guide.why)}</p><ol>{tx(guide.steps.map((step, index) => <li key={index}>{tx(step)}</li>))}</ol><div className="check-verification"><strong>{tx("روش بررسی: ")}</strong>{tx(guide.verify)}</div><div className="button-row">{tx(guide.lessonIds.map(id => <Link className="chip" key={id} to={"activity/" + id}>{tx(allActivities().find(a => a.id === id)?.title ?? id)}</Link>))}</div></details></div>;
      }))}<h2>{tx("معیار پذیرش قابل بررسی")}</h2><ul>{tx(p.acceptance.map(x => <li key={x}>{tx(x)}</li>))}</ul></section><section className="panel"><h2>{tx("لینک‌های تحویل و تصمیم‌ها")}</h2><form onSubmit={e => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const vals = {
          repo: String(data.get("repo") ?? ""),
          demo: String(data.get("demo") ?? ""),
          docs: String(data.get("docs") ?? ""),
          notes: String(data.get("notes") ?? "")
        };
        if (Object.values({
          repo: vals.repo,
          demo: vals.demo,
          docs: vals.docs
        }).some(x => x && !/^https?:\/\//i.test(x))) {
          setMessage("لینک باید با http یا https شروع شود.");
          return;
        }
        if (patch(vals)) setMessage("اطلاعات پروژه ذخیره شد.");
      }} key={p.id}><div className="form-grid">{tx(([["repo", "مخزن"], ["demo", "دمو"], ["docs", "مستندات"]] as const).map(([k, label]) => <label key={k}>{tx(label)}<input type="url" dir="ltr" name={k} defaultValue={v[k]} placeholder={tx("https://…")} />{tx(v[k] && <External url={v[k]}>{tx("بازکردن ")}{tx(label)}</External>)}</label>))}</div><label>{tx("مشکلات و تصمیم‌های فنی")}<textarea aria-label={tx("مشکلات و تصمیم‌های فنی")} name="notes" defaultValue={v.notes} maxLength={20000} /></label><button className="primary" type="submit">{tx("ذخیره اطلاعات پروژه")}</button><span role="status">{tx(message)}</span></form></section><Notes target={p.id} /></>;
}
export function ResourcesPage() {
  const {
    state,
    update
  } = useStore();
  const [search, setSearch] = useState(""),
    [topic, setTopic] = useState("all"),
    [month, setMonth] = useState("all"),
    [type, setType] = useState("all"),
    [status, setStatus] = useState("all");
  const list = resources.filter(r => (tx(r.title) + " " + tx(r.scope)).toLowerCase().includes(search.toLowerCase()) && (topic === "all" || r.topic === topic) && (month === "all" || r.weeks.some(n => weeks.find(w => w.number === n)?.month === Number(month))) && (type === "all" || r.type === type) && (status === "all" || (status === "bookmarked" ? state.resources[r.id]?.bookmark : (state.resources[r.id]?.status ?? "todo") === status)));
  return <><PageHeading eyebrow="منابع منتخب رودمپ، در جای درست مسیر" title={tx("کتابخانه منابع")} description="خواندن هدفمند: بخش مرتبط را انتخاب کن، تمرین کن و وضعیت مطالعه را خودت ثبت کن." /><section className="panel"><div className="search-field"><Search size={18} /><input aria-label={tx("جست‌وجوی منابع")} type="search" placeholder={tx("جست‌وجو در عنوان و توضیحات منابع…")} value={search} onChange={e => setSearch(e.target.value)} /></div><div className="filters"><label>{tx("موضوع")}<select aria-label={tx("موضوع")} value={topic} onChange={e => setTopic(e.target.value)}><option value="all">{tx("همه موضوع‌ها")}</option>{tx(Object.entries(tracks).map(([k, v]) => <option key={k} value={k}>{tx(v)}</option>))}</select></label><label>{tx("ماه")}<select aria-label={tx("ماه")} value={month} onChange={e => setMonth(e.target.value)}><option value="all">{tx("همه ماه‌ها")}</option>{tx(months.map(m => <option key={m.id} value={m.number}>{tx("ماه ")}{tx(fa(m.number))}</option>))}</select></label><label>{tx("نوع")}<select aria-label={tx("نوع")} value={type} onChange={e => setType(e.target.value)}><option value="all">{tx("همه انواع")}</option>{tx([...new Set(resources.map(r => r.type))].map(t => <option key={t} value={t}>{tx(t)}</option>))}</select></label><label>{tx("وضعیت")}<select aria-label={tx("وضعیت")} value={status} onChange={e => setStatus(e.target.value)}><option value="all">{tx("همه وضعیت‌ها")}</option><option value="todo">{tx("شروع‌نشده")}</option><option value="reading">{tx("در حال مطالعه")}</option><option value="read">{tx("مطالعه‌شده")}</option><option value="bookmarked">{tx("نشان‌شده")}</option></select></label></div><p className="muted">{tx(fa(list.length))}{tx(" منبع · صفحات ۱۹ منبع اصلی در ۲۳ آبان ۱۴۰۵ باز و عنوانشان بررسی شد؛ این بررسی تضمین دسترسی آینده نیست.")}</p></section><div className="resource-grid">{tx(list.map(r => {
        const v = state.resources[r.id] ?? {
          status: "todo",
          bookmark: false
        };
        return <Surface as="article" className="resource-card" tone={trackTones[r.topic]} key={r.id}><div className="split"><Tag track={r.topic} /><button aria-label={tx("نشان‌کردن " + r.title)} aria-pressed={v.bookmark} className={v.bookmark ? "bookmarked icon-button" : "icon-button"} onClick={() => update(s => ({
              ...s,
              resources: {
                ...s.resources,
                [r.id]: {
                  ...v,
                  bookmark: !v.bookmark
                }
              }
            }))}><Bookmark size={18} fill={v.bookmark ? "currentColor" : "none"} /></button></div><h2 dir="auto"><External url={r.url}>{tx(r.title)}</External></h2><p>{tx(r.scope)}</p><div className="row-meta"><span>{tx(r.language)}</span><span>{tx(r.type)}</span>{tx(r.supplemental && <span className="supplement">{tx("پیشنهاد تکمیلی")}</span>)}</div><div className="button-row">{tx(r.weeks.map(n => <Link className="chip" key={n} to={"week/" + n}>{tx(fa(n))}</Link>))}</div><label>{tx("وضعیت مطالعه")}<select aria-label={tx("وضعیت مطالعه")} value={v.status} onChange={e => update(s => ({
              ...s,
              resources: {
                ...s.resources,
                [r.id]: {
                  ...v,
                  status: e.target.value as typeof v.status
                }
              }
            }))}><option value="todo">{tx("شروع‌نشده")}</option><option value="reading">{tx("در حال مطالعه")}</option><option value="read">{tx("مطالعه‌شده")}</option></select></label></Surface>;
      }))}</div>{tx(!list.length && <Empty>{tx("منبعی با این فیلترها پیدا نشد.")}</Empty>)}</>;
}
export { default as SkillsPage } from "./SkillsPage";
export function ReviewPage() {
  const {
    state,
    update
  } = useStore();
  const [number, setNumber] = useState(1),
    [msg, setMsg] = useState("");
  const w = weeks[number - 1],
    v = state.reviews[String(number)] ?? {
      learned: "",
      built: "",
      blocked: "",
      review: "",
      focus: ""
    };
  const remaining = w.activities.filter(a => !a.optional && state.activities[a.id]?.status !== "done");
  const logged = state.sessions.filter(s => w.activities.some(a => a.id === s.activityId)).reduce((n, s) => n + s.minutes, 0);
  return <><PageHeading eyebrow="کمی مکث، برای قدم بعدی بهتر" title={tx("مرور هفتگی")} description="خروجی و دشواری‌ها را ثبت کن. گزارش هر هفته ذخیره می‌شود و قابل ویرایش است." /><section className="panel"><label>{tx("هفته")}<select aria-label={tx("هفته")} value={number} onChange={e => {
          setNumber(Number(e.target.value));
          setMsg("");
        }}>{tx(weeks.map(w => <option key={w.id} value={w.number}>{tx("هفته ")}{tx(fa(w.number))} · {tx(w.title)}</option>))}</select></label><div className="review-stats"><span>{tx("پیشرفت: ")}{tx(fa(progress(w.activities, state)))}{tx("٪")}</span><span>{tx("زمان واقعی فعالیت‌های هفته: ")}{tx(fa(logged / 60))}{tx(" ساعت")}</span><span>{tx("باقی‌مانده: ")}{tx(fa(remaining.length))}{tx(" فعالیت")}</span></div><form key={number} onSubmit={e => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (update(s => ({
          ...s,
          reviews: {
            ...s.reviews,
            [String(number)]: {
              learned: String(data.get("learned")),
              built: String(data.get("built")),
              blocked: String(data.get("blocked")),
              review: String(data.get("review")),
              focus: String(data.get("focus"))
            }
          }
        }))) setMsg("مرور هفته ذخیره شد.");
      }}>{tx(([["learned", "چه چیزی یاد گرفتم؟"], ["built", "چه خروجی‌ای ساختم؟"], ["blocked", "کجا گیر کردم؟"], ["review", "چه چیزی را باید مرور کنم؟"], ["focus", "هفته بعد روی چه چیزی تمرکز کنم؟"]] as const).map(([k, l]) => <label key={k}>{tx(l)}<textarea aria-label={tx(l)} name={k} defaultValue={v[k]} maxLength={20000} /></label>))}<p className="muted">{tx("زمان واقعی از نشست‌ها محاسبه می‌شود. برای اصلاح، از صفحه برنامه امروز استفاده کن.")}</p><button className="primary" type="submit">{tx("ذخیره مرور هفته")}</button><span className="success" role="status">{tx(msg)}</span></form></section><section className="panel"><h2>{tx("پیشنهاد تمرکز بعدی")}</h2><p className="muted">{tx("این پیشنهاد با قواعد ساده و از کارهای باقی‌مانده ساخته می‌شود.")}</p>{tx(remaining.length ? <><p>{tx("پیش از افزودن کار تازه، این فعالیت‌ها را مرور کن:")}</p>{tx(remaining.slice(0, 3).map(a => <ActivityRow a={a} key={a.id} />))}</> : <p>{tx("فعالیت‌های اجباری این هفته تمام شده‌اند؛ معیارهای خروجی را بررسی کن و مهارت‌ها را با شاهد بسنج.")}</p>)}<Link className="text-link" to={"week/" + Math.min(26, number + 1)}>{tx("برنامه هفته بعد ")}<ArrowLeft size={16} /></Link></section></>;
}
export function SettingsPage() {
  const {
    state,
    update,
    replace
  } = useStore();
  const [pending, setPending] = useState<PersonalState | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const schedule = buildSchedule(allActivities(), state.settings);
  const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const exportBackup=async()=>{try{await saveBackup(state);setMessage("فایل پشتیبان برای دانلود آماده شد.")}catch{setError("ذخیره یا اشتراک‌گذاری پشتیبان انجام نشد. دوباره تلاش کن.")}};
  return <><PageHeading eyebrow="برنامه‌ای که با زندگی تو هماهنگ است" title={tx("تنظیمات و پشتیبان")} description="اطلاعات فقط در همین مرورگر و دستگاه ذخیره می‌شوند. برای انتقال یا نگهداری امن، خروجی بگیر." /><section className="panel"><h2>{tx("زمان‌بندی مسیر")}</h2><form onSubmit={e => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const days = data.getAll("days").map(Number);
        if (!days.length) {
          setError("حداقل یک روز مطالعه انتخاب کن.");
          return;
        }
        const settings = {
          ...state.settings,
          startDate: String(data.get("startDate")),
          weeklyHours: Number(data.get("weeklyHours")),
          days
        };
        if (update(s => ({
          ...s,
          settings
        }))) {
          setError("");
          setMessage("زمان‌بندی ذخیره شد؛ محتوای برنامه ثابت ماند.");
        }
      }} key={state.settings.startDate + "-" + state.settings.weeklyHours + "-" + state.settings.days.join(",")}><div className="form-grid"><label>{tx("تاریخ شروع")}<input type="date" name="startDate" defaultValue={state.settings.startDate} min="1900-01-01" max="2200-12-31" required /></label><label>{tx("هدف ساعت هفتگی")}<input type="number" name="weeklyHours" defaultValue={state.settings.weeklyHours} min={1} max={80} step={0.5} required /></label></div><fieldset><legend>{tx("روزهای مطالعه (هفته از شنبه)")}</legend><div className="days-checks">{tx(dayNames.map((d, i) => <label className="checkbox-label" key={d}><input type="checkbox" name="days" value={(i + 6) % 7} defaultChecked={state.settings.days.includes((i + 6) % 7)} />{tx(d)}</label>))}</div></fieldset><button className="primary" type="submit">{tx("ذخیره زمان‌بندی")}</button></form><div className="schedule-summary"><span>{tx("پایان برنامه: ")}<strong>{tx(displayDate(schedule.end))}</strong></span><span>{tx("حدود ")}{tx(fa(schedule.calendarWeeks))}{tx(" هفته تقویمی · ۳۹۰ ساعت ثابت")}</span></div><p className="muted">{tx("۲۶ هفته محتوایی هرکدام ۱۵ ساعت‌اند. هدف هفتگی کمتر، مدت تقویمی را بیشتر می‌کند. زمان‌های اختیاری خارج از ۳۹۰ ساعت هستند.")}</p><label>{tx("ظاهر")}<select aria-label={tx("ظاهر")} value={state.settings.theme} onChange={e => update(s => ({
          ...s,
          settings: {
            ...s.settings,
            theme: e.target.value as "light" | "dark"
          }
        }))}><option value="light">{tx("روشن")}</option><option value="dark">{tx("تاریک")}</option></select></label></section><InstallGuide/><section className="panel"><h2>{tx("نسخه پشتیبان")}</h2><p>{tx("خروجی شامل تنظیمات، وضعیت فعالیت‌ها، زمان‌ها، یادداشت‌ها، مرورها، پروژه‌ها، منابع، مهارت‌ها و جابه‌جایی روزهاست. محتوای ثابت آموزشی در سورس برنامه قرار دارد.")}</p><div className="button-row"><button className="primary" onClick={() => {
          void exportBackup();
        }}><Download size={17} />{tx("خروجی JSON")}</button><label className="upload-button"><Upload size={17} />{tx("انتخاب فایل بازیابی")}<input aria-label={tx("فایل بازیابی JSON")} type="file" accept=".json,application/json" onChange={async e => {
            setError("");
            setPending(null);
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 5_000_000) throw new Error("فایل باید کمتر از ۵ مگابایت باشد.");
              setPending(parseBackup(await file.text()));
            } catch (err) {
              setError(err instanceof Error ? err.message : "فایل معتبر نیست.");
            }
            e.target.value = "";
          }} /></label></div>{pending && <div className="restore-preview" role="region" aria-label={tx("پیش‌نمایش بازیابی")}><h3>{tx("پیش از جایگزینی بررسی کن")}</h3><p>{tx("تمام داده‌های شخصی فعلی با فایل جایگزین می‌شوند؛ ادغام انجام نمی‌شود.")}</p><table><thead><tr><th>{tx("داده")}</th><th>{tx("فعلی")}</th><th>{tx("فایل ورودی")}</th></tr></thead><tbody>{([["یادداشت", state.notes.length, pending.notes.length], ["نشست", state.sessions.length, pending.sessions.length], ["فعالیت با وضعیت", Object.keys(state.activities).length, Object.keys(pending.activities).length], ["مرور هفتگی", Object.keys(state.reviews).length, Object.keys(pending.reviews).length], ["پروژه", Object.keys(state.projects).length, Object.keys(pending.projects).length], ["مهارت", Object.keys(state.skills).length, Object.keys(pending.skills).length], ["منبع", Object.keys(state.resources).length, Object.keys(pending.resources).length], ["تاریخ دستی", Object.keys(state.planned).length, Object.keys(pending.planned).length]] as const).map(([l, a, b]) => <tr key={l}><td>{tx(l)}</td><td>{tx(fa(a))}</td><td>{tx(fa(b))}</td></tr>)}</tbody></table><p>{tx("تنظیمات ورودی: شروع ")}{tx(displayDate(pending.settings.startDate))}، {tx(fa(pending.settings.weeklyHours))}{tx(" ساعت در هفته، ")}{tx(fa(pending.settings.days.length))}{tx(" روز؛ ظاهر ")}{tx(pending.settings.theme === "dark" ? "تاریک" : "روشن")}.</p><div className="button-row"><button className="danger" onClick={() => {
            if (replace(pending)) {
              setPending(null);
              setMessage("بازیابی با موفقیت انجام شد.");
            }
          }}>{tx("تأیید جایگزینی تمام داده‌ها")}</button><button onClick={() => setPending(null)}>{tx("لغو بازیابی")}</button><button onClick={()=>void exportBackup()}>{tx("ابتدا خروجی داده فعلی")}</button></div></div>}</section><section className="panel"><h2>{tx("محاسبه‌ها و حریم خصوصی")}</h2><ul><li>{tx("پیشرفت = مجموع دقیقه تخمینی فعالیت‌های اجباری انجام‌شده ÷ مجموع دقیقه تخمینی اجباری؛ فعالیت مشترک یک‌بار شمرده می‌شود.")}</li><li>{tx("زمان واقعی = مجموع نشست‌های ثبت‌شده. تغییر تیک فعالیت روی آن اثر ندارد.")}</li><li>{tx("پیشرفت پروژه از چک‌لیست تحویل و سطح مهارت از ارزیابی شخصی مستقل به دست می‌آیند.")}</li><li>{tx("یادداشت یا داده شخصی به سرویس خارجی ارسال نمی‌شود. منابع بیرونی فقط با اقدام تو باز می‌شوند.")}</li><li>{tx("ذخیره‌سازی localStorage نسخه ۱ است. پاک‌کردن داده سایت در مرورگر، پیشرفت را حذف می‌کند. در حالت خصوصی مرورگر، ماندگاری تضمین نیست.")}</li><li>{tx("نمایش تاریخ شمسی و محاسبه روز جاری بر اساس Asia/Tehran است؛ تاریخ داخلی ISO ذخیره می‌شود.")}</li></ul></section><section className="panel danger-zone"><h2>{tx("بازنشانی پیشرفت")}</h2><p>{tx("تمام داده‌های شخصی حذف می‌شوند و تنظیمات فعلی حفظ می‌شوند. ابتدا خروجی بگیر.")}</p><button className="danger" onClick={() => {
        if (confirm(tx("تمام پیشرفت، زمان‌ها، یادداشت‌ها، مرورها، پروژه‌ها و مهارت‌ها حذف شوند؟ این کار برگشت مستقیم ندارد."))) {
          const fresh = freshState();
          fresh.settings = state.settings;
          if (replace(fresh)) {
            setPending(null);
            setMessage("پیشرفت بازنشانی شد.");
          }
        }
      }}>{tx("بازنشانی با تأیید")}</button></section>{tx(message && <div className="toast" role="status"><span>{tx(message)}</span><button aria-label={tx("بستن پیام")} onClick={() => setMessage("")}>×</button></div>)}{tx(error && <div className="alert" role="alert">{tx(error)}</div>)}</>;
}
export function GuidePage() {
  return <><PageHeading eyebrow="منطق مسیر و توصیه‌های رودمپ" title={tx("راهنمای یادگیری")} description="هدف اصلی، آمادگی برای درخواست موقعیت Junior Backend با Go است. کیفیت پروژه و توانایی توضیح، معیار تصمیم‌اند." />{tx(guidance.map((g,i) => <Surface className="guide-section" tone={(["blue","violet","rose","amber"] as const)[i%4]} key={g.title}><h2><span className="guide-number" aria-hidden="true">{fa(i+1)}</span>{tx(g.title)}</h2><p className="preserve">{tx(g.body)}</p></Surface>))}<section className="panel"><h2>{tx("ابزارها در کجای مسیرند؟")}</h2><div className="table-scroll"><table><thead><tr><th>{tx("ابزار")}</th><th>{tx("کاربرد و سطح لازم")}</th><th>{tx("هفته‌ها")}</th></tr></thead><tbody>{tx(tools.map(t => <tr key={t.name}><td dir="auto">{tx(t.name)}</td><td>{tx(t.purpose)}</td><td>{tx(t.weeks.map(fa).join("، "))}</td></tr>))}</tbody></table></div></section><section className="panel"><h2>{tx("پوشش رودمپ")}</h2><table><thead><tr><th>{tx("بخش")}</th><th>{tx("جای آن در برنامه")}</th></tr></thead><tbody><tr><td>{tx("مبانی Go و Python و منطق دیجیتال")}</td><td>{tx("ماه ۱ · هفته ۱ تا ۴")}</td></tr><tr><td>{tx("HTTP، دیتابیس، هویت و ML")}</td><td>{tx("ماه ۲ · هفته ۵ تا ۸")}</td></tr><tr><td>{tx("مهندسی سرویس، حافظه و MNIST")}</td><td>{tx("ماه ۳ · هفته ۹ تا ۱۲")}</td></tr><tr><td>{tx("Frontend، CPU و GPU")}</td><td>{tx("ماه ۴ · هفته ۱۳ تا ۱۶")}</td></tr><tr><td>{tx("Transformer، Fine-tuning و سنجش GPU")}</td><td>{tx("ماه ۵ · هفته ۱۷ تا ۲۰")}</td></tr><tr><td>{tx("StudioFlow، C، استقرار و شغل")}</td><td>{tx("ماه ۶ · هفته ۲۱ تا ۲۴")}</td></tr><tr><td>{tx("رفع نقص و ارزیابی نهایی")}</td><td>{tx("هفته ۲۵ و ۲۶ · پیشنهاد تکمیلی")}</td></tr><tr><td>{tx("منابع، ابزارها، توصیه‌ها و مسیرهای بعدی")}</td><td>{tx("کتابخانه، پروژه‌ها و همین راهنما")}</td></tr></tbody></table></section></>;
}
