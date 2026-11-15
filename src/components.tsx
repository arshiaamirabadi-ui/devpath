import { tx } from "./locale";
import { useState, type ReactNode, type AnchorHTMLAttributes } from "react";
import { ChevronDown, ArrowUpLeft, Check, Clock, ExternalLink, Trash2 } from "lucide-react";
import { useStore } from "./store";
import { blankActivity, displayDate, fa, recordSession, todayISO, type Session } from "./logic";
import { weeks, type Activity, type Track } from "./content";
import LessonContent from "./lesson-loader";
import { trackTones } from "./ui";
export const tracks: Record<Track, string> = {
  backend: "برنامه‌نویسی و Backend",
  ai: "هوش مصنوعی و ML",
  systems: "معماری و GPU",
  project: "پروژه و مرور"
};
export const allActivities = () => weeks.flatMap(w => w.activities);
export function Tag({
  track
}: {
  track: Track;
}) {
  return <span className={"tag " + track}>{tx(tracks[track])}</span>;
}
export function Link({
  to,
  children,
  className = "",
  ...props
}: {
  to: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return <a {...props} className={className} href={"#/" + to}>{tx(children)}</a>;
}
export function External({
  url,
  children
}: {
  url: string;
  children: ReactNode;
}) {
  return <a href={url} target="_blank" rel="noreferrer" className="external">{tx(children)}<ExternalLink size={14} /></a>;
}
export function Meter({
  value,
  label
}: {
  value: number;
  label: string;
}) {
  return <div className="meter-wrap"><div className="meter-label"><span>{tx(label)}</span><strong>{tx(fa(value))}{tx("٪")}</strong></div><progress max={100} value={value} aria-label={tx(label)} /></div>;
}
export function Empty({
  children
}: {
  children: ReactNode;
}) {
  return <div className="empty">{tx(children)}</div>;
}
export function ActivityRow({
  a,
  minutes
}: {
  a: Activity;
  minutes?: number;
}) {
  const {
    state,
    update
  } = useStore();
  const done = state.activities[a.id]?.status === "done";
  const [guideOpen, setGuideOpen] = useState(false);
  return <div data-tone={trackTones[a.track]} className={"activity-row " + (done ? "completed" : "")}><button className="check-circle" aria-label={tx((done ? "برگرداندن " : "تکمیل ") + a.title)} aria-pressed={done} onClick={() => update(s => ({
      ...s,
      lastActivity: a.id,
      activities: {
        ...s.activities,
        [a.id]: {
          ...(s.activities[a.id] ?? blankActivity),
          status: done ? "todo" : "done"
        }
      }
    }))}>{tx(done && <Check size={16} />)}</button><div className="activity-summary"><div className="activity-kind"><span>{tx(a.track === "project" ? "تسک اجرایی" : "درس و تمرین")}</span><span>{tx(done ? "انجام‌شده" : state.activities[a.id]?.status === "doing" ? "در حال انجام" : "شروع‌نشده")}</span></div><Link to={"activity/" + a.id}>{tx(a.title)}</Link><p className="activity-description">{tx(a.description)}</p><div className="row-meta"><Tag track={a.track} /><span><Clock size={13} />{tx(fa(minutes ?? a.minutes))}{tx(" دقیقه")}{tx(minutes && minutes < a.minutes ? " از فعالیت" : "")}</span>{tx(a.optional && <span>{tx("اختیاری")}</span>)}</div></div><Link to={"activity/" + a.id} className="icon-link"><ArrowUpLeft size={18} /><span className="sr-only">{tx("جزئیات")}</span></Link><details className="activity-lesson-preview" onToggle={e => setGuideOpen(e.currentTarget.open)}><summary><span>{tx("راهنمای درس")}</span><ChevronDown size={17} aria-hidden="true" /></summary>{tx(guideOpen && <LessonContent activityId={a.id} compact />)}<Link to={"activity/" + a.id} className="primary">{tx("رفتن به میز مطالعه و ثبت خروجی")}</Link></details></div>;
}
export function Notes({
  target
}: {
  target?: string;
}) {
  const {
    state,
    update
  } = useStore();
  const [text, setText] = useState(""),
    [editing, setEditing] = useState(""),
    [search, setSearch] = useState(""),
    [targetValue, setTarget] = useState(target ?? "general"),
    [message, setMessage] = useState("");
  const filtered = state.notes.filter(n => (!target || n.target === target) && n.text.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const save = () => {
    if (!text.trim()) return;
    const note = {
      id: editing || crypto.randomUUID(),
      target: target ?? targetValue,
      text: text.trim(),
      updatedAt: new Date().toISOString()
    };
    if (update(s => ({
      ...s,
      notes: [...s.notes.filter(n => n.id !== note.id), note]
    }))) {
      setText("");
      setEditing("");
      setMessage("یادداشت ذخیره شد.");
    }
  };
  return <section className="panel"><h2>{tx(target ? "یادداشت‌های این بخش" : "دفتر یادداشت")}</h2><div className="note-form">{tx(!target && <label>{tx("مرتبط با")}<select value={targetValue} onChange={e => setTarget(e.target.value)}><option value="general">{tx("عمومی")}</option>{tx(weeks.map(w => <option value={w.id} key={w.id}>{tx("هفته ")}{tx(fa(w.number))} · {tx(w.title)}</option>))}</select></label>)}<label>{tx(editing ? "ویرایش یادداشت" : "یادداشت تازه")}<textarea aria-label={tx(editing ? "ویرایش یادداشت" : "یادداشت تازه")} value={text} onChange={e => setText(e.target.value)} maxLength={20000} placeholder={tx("چه چیزی یاد گرفتی؟ کجا نیاز به تمرین داری؟")} /></label><div className="button-row"><button className="primary" onClick={save} disabled={!text.trim()}>{tx(editing ? "ذخیره ویرایش" : "ذخیره یادداشت")}</button>{tx(editing && <button onClick={() => {
          setEditing("");
          setText("");
        }}>{tx("لغو ویرایش")}</button>)}</div><span role="status" className="success">{tx(message)}</span></div><label>{tx("جست‌وجو در یادداشت‌ها")}<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={tx("کلمه‌ای از یادداشت…")} /></label>{tx(!filtered.length && <Empty>{tx("هنوز یادداشتی در این بخش نیست.")}</Empty>)}{filtered.map(n => <article className="note" key={n.id}><div className="split"><small>{tx(n.target)} · {tx(displayDate(n.updatedAt.slice(0, 10)))}</small><div className="button-row"><button onClick={() => {
            setEditing(n.id);
            setTarget(n.target);
            setText(n.text);
            setMessage("");
          }}>{tx("ویرایش")}</button><button aria-label={tx("حذف یادداشت")} onClick={() => {
            if (confirm(tx("این یادداشت حذف شود؟"))) update(s => ({
              ...s,
              notes: s.notes.filter(x => x.id !== n.id)
            }));
          }}><Trash2 size={15} /></button></div></div><p>{n.text}</p></article>)}</section>;
}
export function Sessions({
  activityId
}: {
  activityId?: string;
}) {
  const {
    state,
    update
  } = useStore();
  const acts = allActivities();
  const [draft, setDraft] = useState<Session>({
    id: crypto.randomUUID(),
    activityId: activityId ?? acts[0]?.id ?? "general",
    date: todayISO(),
    minutes: 30
  });
  const [msg, setMsg] = useState("");
  const entries = state.sessions.filter(s => !activityId || s.activityId === activityId).sort((a, b) => b.date.localeCompare(a.date));
  return <section className="panel"><h2>{tx("ثبت زمان مطالعه")}</h2><p className="muted">{tx("زمان واقعی مستقل از تکمیل فعالیت است. نشست‌های ثبت‌شده قابل اصلاح و حذف‌اند.")}</p><form onSubmit={e => {
      e.preventDefault();
      if (update(s => recordSession(s, draft))) {
        setDraft({
          ...draft,
          id: crypto.randomUUID()
        });
        setMsg("زمان ذخیره شد.");
      }
    }}><div className="form-grid">{tx(!activityId && <label>{tx("فعالیت")}<select value={draft.activityId} onChange={e => setDraft({
            ...draft,
            activityId: e.target.value
          })}>{tx(acts.map(a => <option value={a.id} key={a.id}>{tx("هفته ")}{tx(fa(a.week))} · {tx(a.title)}</option>))}</select></label>)}<label>{tx("تاریخ نشست")}<input type="date" required value={draft.date} onChange={e => setDraft({
            ...draft,
            date: e.target.value
          })} /></label><label>{tx("مدت به دقیقه")}<input type="number" min={1} max={1440} required value={draft.minutes} onChange={e => setDraft({
            ...draft,
            minutes: Number(e.target.value)
          })} /></label></div><button className="primary" type="submit">{tx("ذخیره زمان")}</button><span className="success" role="status">{tx(msg)}</span></form>{tx(!entries.length && <Empty>{tx("زمانی ثبت نشده است.")}</Empty>)}{tx(entries.map(s => <div className="session split" key={s.id}><div><strong>{tx(fa(s.minutes))}{tx(" دقیقه")}</strong><small> · {tx(displayDate(s.date))} · {tx(acts.find(a => a.id === s.activityId)?.title ?? s.activityId)}</small></div><div className="button-row"><button onClick={() => {
          setDraft(s);
          setMsg("در حال ویرایش نشست؛ ذخیره، مقدار قبلی را جایگزین می‌کند.");
        }}>{tx("اصلاح")}</button><button aria-label={tx("حذف نشست")} onClick={() => update(x => ({
          ...x,
          sessions: x.sessions.filter(a => a.id !== s.id)
        }))}><Trash2 size={15} /></button></div></div>))}</section>;
}
