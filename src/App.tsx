import { tx, dateLocale } from "./locale";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, Ship, ArrowLeft, ArrowUpLeft, BookOpen, CalendarDays, Check, ChevronLeft, ClipboardCheck, Code2, Compass, Flag, FolderKanban, GraduationCap, LayoutDashboard, Menu, Moon, NotebookPen, Settings, Sun, Target, X } from "lucide-react";
import { months, weeks, resources, projects, skills } from "./content";
import { useStore } from "./store";
import { useLanguage } from "./LanguageProvider";
import { addDays, buildSchedule, displayDate, fa, progress, saturday, todayISO, totalMinutes } from "./logic";
import { ActivityRow, Empty, Link, Meter, Notes, Tag, allActivities, tracks } from "./components";
import { StatCard } from "./ui";
import { learningOverview } from "./learning";
const ProgressPage = lazy(() => import("./ProgressPage"));
const Diagram = lazy(() => import("./Diagram"));
const loadPages = () => import("./pages");
const ActivityPage = lazy(() => loadPages().then(m => ({
  default: m.ActivityPage
})));
const WeekPage = lazy(() => loadPages().then(m => ({
  default: m.WeekPage
})));
const TodayPage = lazy(() => loadPages().then(m => ({
  default: m.TodayPage
})));
const ProjectsPage = lazy(() => loadPages().then(m => ({
  default: m.ProjectsPage
})));
const ResourcesPage = lazy(() => loadPages().then(m => ({
  default: m.ResourcesPage
})));
const SkillsPage = lazy(() => loadPages().then(m => ({
  default: m.SkillsPage
})));
const ReviewPage = lazy(() => loadPages().then(m => ({
  default: m.ReviewPage
})));
const SettingsPage = lazy(() => loadPages().then(m => ({
  default: m.SettingsPage
})));
const GuidePage = lazy(() => loadPages().then(m => ({
  default: m.GuidePage
})));
const nav = [["", "داشبورد", LayoutDashboard], ["progress", "پیشرفت و ادیسه", ChartNoAxesCombined], ["today", "برنامه امروز", CalendarDays], ["roadmap", "نقشه راه", Compass], ["diagram", "نقشه دیاگرامی", Code2], ["projects", "پروژه‌ها", FolderKanban], ["resources", "کتابخانه منابع", BookOpen], ["skills", "مهارت‌ها", Target], ["review", "مرور هفتگی", ClipboardCheck], ["notes", "یادداشت‌ها", NotebookPen], ["guide", "راهنمای مسیر", GraduationCap], ["settings", "تنظیمات و پشتیبان", Settings]] as const;
export default function App() {
  const {
    language,
    loading,
    changeLanguage
  } = useLanguage();
  const [route, setRoute] = useState(location.hash.replace(/^#\/?/, ""));
  const [open, setOpen] = useState(false);
  const {
    state,
    update,
    error,
    clearError
  } = useStore();
  useEffect(() => {
    const h = () => {
      setRoute(location.hash.replace(/^#\/?/, ""));
      setOpen(false);
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus();
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const journey = useMemo(() => learningOverview(state), [state]);
  const activities = allActivities(),
    pct = progress(activities, state);
  const title = nav.find(n => n[0] === route)?.[1] ?? (route.startsWith("week/") ? "برنامه هفتگی" : route.startsWith("activity/") ? "میز مطالعه" : route.startsWith("skill/") ? "مهارت و شواهد" : "جزئیات پروژه");
  return <div className="app-shell"><a className="skip" href="#main" onClick={e => {
      e.preventDefault();
      document.getElementById("main")?.focus();
    }}>{tx("رفتن به محتوا")}</a><aside className={"sidebar " + (open ? "is-open" : "")}><Link to="" className="brand"><span className="brand-symbol"><Code2 size={25} /></span><span>DevPath<small>{tx("هر روز، یک قدم جلوتر")}</small></span></Link><button className="mobile-close" aria-label={tx("بستن منو")} onClick={() => setOpen(false)}><X /></button><div className="workspace-label">{tx("فضای یادگیری من")}</div><nav aria-label={tx("ناوبری اصلی")}>{tx(nav.map(([path, label, Icon]) => <Link key={path} to={path} className={(route === path || path === "roadmap" && route.startsWith("week/") || path === "skills" && route.startsWith("skill/") ? "active " : "") + "nav-link"}><Icon size={19} /><span>{tx(label)}</span>{tx(path === "roadmap" && <small>{tx("۲۶")}</small>)}</Link>))}</nav><div className="sidebar-bottom"><div className="mini-path"><span className="eyebrow">{tx("هدف این مسیر")}</span><strong>Junior Backend Developer</strong><span>Go · PostgreSQL · REST · Docker</span><Meter value={pct} label="پیشرفت مسیر" /></div><div className="profile"><span className="avatar">{tx("م")}</span><span>{tx("مسیر شخصی من")}<small>{tx("ذخیره روی همین دستگاه")}</small></span><span className="live-dot" title={tx("ذخیره محلی")} /></div></div></aside>{tx(open && <button className="scrim" aria-label={tx("بستن منو")} onClick={() => setOpen(false)} />)}
 <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu" aria-label={tx("بازکردن منو")} onClick={() => setOpen(true)}><Menu /></button><span>{tx("فضای یادگیری")}</span><ChevronLeft size={14} /><strong>{tx(title)}</strong></div><div className="top-actions"><span className="date-today">{tx(new Intl.DateTimeFormat(dateLocale(), {
              timeZone: "Asia/Tehran",
              weekday: "long",
              day: "numeric",
              month: "long"
            }).format(new Date()))}</span><button className="icon-button language-toggle" aria-label={language === "fa" ? "Switch to English" : "Switch to Persian"} title={language === "fa" ? "English" : "Persian"} disabled={loading} aria-busy={loading} onClick={() => void changeLanguage(language === "fa" ? "en" : "fa")}>{language === "fa" ? "EN" : "FA"}</button><button className="icon-button" aria-label={tx("تغییر حالت روشن و تاریک")} onClick={() => update(s => ({
            ...s,
            settings: {
              ...s.settings,
              theme: s.settings.theme === "light" ? "dark" : "light"
            }
          }))}>{tx(state.settings.theme === "light" ? <Moon size={18} /> : <Sun size={18} />)}</button></div></header><div className="voyage-statusbar"><span><Ship size={18} />{tx("سفر ادیسه ")}<strong>{tx("هفته ")}{tx(fa(journey.currentWeek))}</strong></span><progress max={100} value={journey.voyage} aria-label={tx("سفر پیوسته ادیسه")} /><Link to="progress">{tx(fa(journey.voyage))}{tx("٪ · دیدن سفر ↗")}</Link></div>
 <main id="main" data-page={route.split("/")[0] || "dashboard"} tabIndex={-1}>{tx(error && <div role="alert" className="alert">{tx(error)}<button onClick={clearError} aria-label={tx("بستن پیام")}><X size={15} /></button></div>)}<Suspense fallback={<div className="content-loading" role="status"><span />{tx("در حال آماده‌کردن این بخش…")}</div>}>{tx(route === "" ? <Dashboard /> : route === "progress" ? <ProgressPage /> : route === "roadmap" ? <Roadmap /> : route === "diagram" ? <Diagram /> : route === "today" ? <TodayPage /> : route.startsWith("week/") ? <WeekPage key={route} number={Number(route.split("/")[1])} /> : route.startsWith("activity/") ? <ActivityPage key={route} id={route.split("/")[1]} /> : route === "projects" || route.startsWith("project/") ? <ProjectsPage key={route} id={route.startsWith("project/") ? route.split("/")[1] : undefined} /> : route === "resources" ? <ResourcesPage /> : route === "skills" || route.startsWith("skill/") ? <SkillsPage key={route} id={route.split("/")[1]} /> : route === "review" ? <ReviewPage /> : route === "notes" ? <><PageHeading eyebrow="برای مرور دوباره" title={tx("یادداشت‌های من")} description="فکرها، سؤال‌ها و آموخته‌هایی که می‌خواهی نگه داری." /><Notes /></> : route === "settings" ? <SettingsPage /> : route === "guide" ? <GuidePage /> : <Empty>{tx("این صفحه پیدا نشد. ")}<Link to="">{tx("برگشت به داشبورد")}</Link></Empty>)}</Suspense></main><footer>{tx("DevPath · یادگیری با تمرین و شاهد ")}<span>{tx("۲۶ هفته محتوایی · ۳۹۰ ساعت · منطقه زمانی تهران")}</span></footer></div></div>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return <div className="page-heading"><div><div className="eyebrow">{tx(eyebrow)}</div><h1>{tx(title)}</h1><p>{tx(description)}</p></div>{tx(action)}</div>;
}
function Dashboard() {
  const {
    state
  } = useStore();
  const activities = allActivities();
  const schedule = useMemo(() => buildSchedule(activities, state.settings), [state.settings]);
  const today = todayISO();
  const pct = progress(activities, state);
  const current = learningOverview(state).currentWeek;
  const week = weeks[current - 1];
  if (!week) return null;
  const next = activities.find(a => !a.optional && state.activities[a.id]?.status !== "done");
  const weekActs = week.activities;
  const wStart = saturday(today);
  const logged = totalMinutes(state, wStart, addDays(wStart, 6));
  const todayActs = activities.filter(a => !a.optional && (state.planned[a.id] ? state.planned[a.id] === today : (schedule.portions[today] ?? []).some(p => p.id === a.id)));
  const overdue = activities.filter(a => !a.optional && (state.planned[a.id] ?? schedule.dates[a.id]) < today && state.activities[a.id]?.status !== "done");
  const done = activities.filter(a => !a.optional && state.activities[a.id]?.status === "done").length;
  const last = activities.find(a => a.id === state.lastActivity) ?? next;
  return <><PageHeading eyebrow="مسیرت را با قدم‌های کوچک بساز" title={tx("سلام، به مسیرت خوش آمدی")} description="لازم نیست همه‌چیز را امروز یاد بگیری. کافی است قدم بعدی را برداری." action={<Link to="today" className="primary">{tx("برنامه امروز ")}<ArrowLeft size={17} /></Link>} />
 <section className="journey-banner"><div className="journey-copy"><span className="banner-tag"><span className="live-dot" />{tx("مسیر اصلی یادگیری")}</span><h2>{tx("از اولین خط Go،")}<br />{tx("تا ساختن یک بک‌اند واقعی.")}</h2><p>{tx("یک برنامه روشن برای یادگیری، تمرین و ساختن.")}<br />{tx("با تمرکز روی مهارت‌هایی که می‌توانی نشان بدهی.")}</p><Link className="banner-link" to={"week/" + current}>{tx("ادامه هفته ")}{tx(fa(current))} <ArrowLeft size={18} /></Link></div><div className="journey-visual" aria-hidden="true"><span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="visual-dot dot-a" /><span className="visual-dot dot-b" /><div className="code-window"><div className="window-bar"><i /><i /><i /><span>my-learning.go</span></div><pre><span className="code-muted">// one step at a time</span>{tx("\n")}<span className="code-pink">func</span> <span className="code-yellow">main</span>() {tx("{\n")}{tx("    ")}learn(<span className="code-green">"Go"</span>){tx("\n")}{tx("    ")}practice(){tx("\n")}{tx("    ")}build(<span className="code-green">"something real"</span>){tx("\n")}{tx("}")}</pre><div className="code-caption"><Check size={14} /> progress, not perfection</div></div><span className="float-label"><Code2 size={17} /> Go Backend</span></div></section>
 <section className="stat-grid" aria-label={tx("آمار واقعی پیشرفت")}>
 <StatCard label="پیشرفت کل مسیر" icon={Compass} tone="blue" progress={pct} value={<>{tx(fa(pct))}<small>{tx("٪")}</small></>}><Meter value={pct} label="فعالیت‌های اجباری" /></StatCard>
 <StatCard label="مطالعه این هفته" icon={CalendarDays} tone="violet" value={<>{tx(fa(logged / 60))}<small> / {tx(fa(state.settings.weeklyHours))}{tx(" ساعت")}</small></>} detail="شنبه تا جمعه · زمان ثبت‌شده" />
 <StatCard label="فعالیت‌های تمام‌شده" icon={ClipboardCheck} tone="rose" value={<>{tx(fa(done))}<small> / {tx(fa(activities.filter(a => !a.optional).length))}</small></>} detail="هر قدم، با انتخاب خودت" />
 <StatCard label="ایستگاه فعلی" icon={Flag} tone="amber" value={<>{tx("هفته ")}{tx(fa(current))}<small>{tx(" از ۲۶")}</small></>} detail={<>{tx("ماه ")}{tx(fa(week.month))} · {tx(months[week.month - 1]?.title)}</>} />
 </section>
 <div className="dashboard-columns"><div className="wide-column"><section className="panel today-panel"><div className="section-heading"><div><span className="eyebrow">{tx("روی قدم بعدی تمرکز کن")}</span><h2>{tx("برنامه امروز")}</h2></div><Link to="today" className="text-link">{tx("مشاهده برنامه ")}<ArrowUpLeft size={16} /></Link></div><div className="daily-context"><CalendarDays size={17} /><span>{tx(displayDate(today))}</span><small>{tx(fa(todayActs.length))}{tx(" فعالیت برنامه‌ریزی‌شده")}</small></div>{tx(todayActs.length ? todayActs.slice(0, 4).map(a => <ActivityRow key={a.id} a={a} minutes={state.planned[a.id] ? undefined : schedule.portions[today]?.find(p => p.id === a.id)?.minutes} />) : <Empty>{tx("برای امروز فعالیتی برنامه‌ریزی نشده است. روزهای مطالعه را در تنظیمات تغییر بده یا فعالیتی را جابه‌جا کن.")}</Empty>)}{tx(!todayActs.length && next && <ActivityRow a={next} />)}<div className="panel-foot">{tx("بازکردن درس به معنی تکمیل آن نیست. وضعیت یادگیری را خودت ثبت کن.")}</div></section>
 <section className="panel month-overview"><div className="section-heading"><h2>{tx("نقشه مسیر تو")}</h2><Link to="roadmap" className="text-link">{tx("همه ۲۶ هفته ")}<ArrowUpLeft size={16} /></Link></div><div className="month-line">{tx(months.map(m => {
              const p = progress(weeks.filter(w => w.month === m.number).flatMap(w => w.activities), state);
              return <Link to={"week/" + (weeks.find(w => w.month === m.number)?.number ?? 1)} className={week.month === m.number ? "month-stop current" : "month-stop"} key={m.id}><span className="stop-circle">{tx(p === 100 ? <Check size={18} /> : fa(m.number))}</span><strong>{tx("ماه ")}{tx(fa(m.number))}</strong><small>{tx(m.title)}</small><span>{tx(fa(p))}{tx("٪")}</span></Link>;
            }))}</div></section>
 {tx(overdue.length > 0 && <section className="panel"><h2>{tx("کارهای عقب‌افتاده · ")}{tx(fa(overdue.length))}</h2><p className="muted">{tx("برای این فعالیت‌ها زمان تازه‌ای در برنامه‌ات در نظر بگیر.")}</p>{tx(overdue.slice(0, 4).map(a => <ActivityRow a={a} key={a.id} />))}</section>)}</div>
 <div className="narrow-column"><section className="panel current-week"><span className="eyebrow">{tx("خروجی این هفته")}</span><div className="week-number">{tx(fa(current).padStart(2, "۰"))}<span>{tx("هفته جاری")}</span></div><h2>{tx(week.title)}</h2><p>{tx(week.goal)}</p><Meter value={progress(weekActs, state)} label="پیشرفت هفته" /><div className="deliverable"><Flag size={17} /><span>{tx(week.deliverable)}</span></div><Link to={"week/" + current} className="outline full">{tx("دیدن برنامه هفته ")}<ChevronLeft size={16} /></Link></section>
 <section className="panel track-panel"><h2>{tx("چهار مسیر، یک هدف")}</h2>{tx(Object.entries(tracks).map(([key, label]) => <div className="track-progress" key={key}><Tag track={key as keyof typeof tracks} /><Meter value={progress(activities.filter(a => a.track === key), state)} label={label} /></div>))}</section>
 {tx(last && <Link to={"activity/" + last.id} className="resume-card"><BookOpen size={19} /><span><small>{tx("میز مطالعه‌ات منتظر توست")}</small><strong>{tx("ادامه آخرین فعالیت")}</strong></span><ArrowUpLeft size={20} /></Link>)}</div></div>
 <section className="panel"><div className="section-heading"><h2>{tx("آخرین یادداشت‌ها")}</h2><Link to="notes" className="text-link">{tx("دفتر یادداشت ")}<ArrowUpLeft size={16} /></Link></div>{state.notes.length ? [...state.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3).map(n => <p className="note-preview" key={n.id}>{n.text}</p>) : <p className="muted">{tx("هنوز چیزی ننوشته‌ای. یک نکته کوتاه از اولین درس، شروع خوبی است.")}</p>}</section></>;
}
function Roadmap() {
  const {
    state
  } = useStore();
  return <><PageHeading eyebrow="۲۶ هفته · ۳۹۰ ساعت یادگیری" title={tx("نقشه راه من")} description="۲۴ هفته مسیر اصلی؛ هفته ۲۵ رفع نقص و هفته ۲۶ ارزیابی و پورتفولیو. همه هفته‌ها در دسترس‌اند." action={<Link className="primary" to="diagram">{tx("نقشه دیاگرامی ")}<ArrowUpLeft size={17} /></Link>} /><div className="legend">{tx(Object.keys(tracks).map(t => <Tag track={t as keyof typeof tracks} key={t} />))}</div>{tx(months.map(m => <section className="panel month-card" data-tone={(["blue", "violet", "rose", "blue", "violet", "amber"] as const)[m.number - 1]} key={m.id}><div className="section-heading"><div><span className="eyebrow">{tx("ماه ")}{tx(fa(m.number))}</span><h2>{tx(m.title)}</h2><p>{tx(m.goal)}</p></div><span className="month-index">{tx(fa(m.number).padStart(2, "۰"))}</span></div><div className="skill-chips">{tx(m.skills.map(s => <span key={s}>{tx(s)}</span>))}</div><Meter value={progress(weeks.filter(w => w.month === m.number).flatMap(w => w.activities), state)} label="پیشرفت ماه" /><div className="weeks-grid">{tx(weeks.filter(w => w.month === m.number).map(w => <Link to={"week/" + w.number} key={w.id} className="week-tile" data-complete={progress(w.activities, state) === 100}><div className="split"><span>{tx("هفته ")}{tx(fa(w.number))}</span><ArrowUpLeft size={17} /></div><h3>{tx(w.title)}</h3><p>{tx(w.goal)}</p>{tx(w.supplemental && <small className="supplement">{tx("پیشنهاد تکمیلی")}</small>)}<Meter value={progress(w.activities, state)} label="پیشرفت هفته" /></Link>))}</div><div className="month-outcome"><p><strong>{tx("خروجی ماه: ")}</strong>{tx(m.output)}</p><p><strong>{tx("معیار عبور: ")}</strong>{tx(m.gate)}</p></div></section>))}</>;
}
