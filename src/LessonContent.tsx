import { tx } from "./locale";
import { useRef } from "react";
import { BookOpen, Library, ListChecks, Code2, Target, CheckCircle2, TriangleAlert } from "lucide-react";
import { LessonHeading } from "./ui";
import { lessonGuides } from "./lessons";
import { resources, weeks } from "./content";
export default function LessonContent({
  activityId,
  compact = false
}: {
  activityId: string;
  compact?: boolean;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const guide = lessonGuides[activityId];
  if (!guide) return <p role="alert">{tx("راهنمای این درس پیدا نشد.")}</p>;
  const activity = weeks.flatMap(w => w.activities).find(a => a.id === activityId);
  const additional = resources.filter(r => activity?.resourceIds.includes(r.id) && !guide.resourceSections.some(g => g.url.replace(/\/$/, "").startsWith(r.url.replace(/\/$/, ""))));
  return <article ref={articleRef} className={compact ? "lesson-content lesson-embedded" : "lesson-content panel"} aria-label={tx("توضیح و راهنمای درس")} data-activity-id={activityId}>
  {!compact && <nav className="lesson-jump" aria-label={tx("بخش‌های راهنمای درس")}><span>{tx("مسیر مطالعه: مفهوم را بخوان، منبع را باز کن و با تمرین خروجی بساز.")}</span>{["مفهوم درس", "منابع مطالعه", "مراحل انجام", "تمرین درس", "معیار اتمام"].map((label, i) => <button key={label} onClick={() => {
        const sections = Array.from(articleRef.current?.querySelectorAll<HTMLElement>(":scope > .lesson-section") ?? []);
        const target = i === 0 ? sections[0] : i === 1 ? sections[1] : i === 2 ? sections.find(s => s.querySelector(".lesson-steps")) : i === 3 ? sections.find(s => s.classList.contains("exercise-box")) : sections.find(s => s.dataset.section === "completion");
        if (target) {
          target.tabIndex = -1;
          target.focus({
            preventScroll: true
          });
          target.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: "start"
          });
        }
      }}>{tx(label)}</button>)}</nav>}
  <div className="lesson-section"><LessonHeading compact={compact} icon={BookOpen} tone="blue">{tx("این درس چه چیزی یاد می‌دهد؟")}</LessonHeading>{tx(guide.intro.map((p, i) => <p key={i}>{tx(p)}</p>))}</div>
  <div className="lesson-section"><LessonHeading compact={compact} icon={Library} tone="violet">{tx("از کدام منبع و کدام بخش بخوانم؟")}</LessonHeading><p className="muted">{tx("این ترتیب را دنبال کن؛ لازم نیست تمام دوره یا کتاب را برای این درس تمام کنی.")}</p><ol className="lesson-readings">{guide.resourceSections.map((r, i) => <li key={i}><a href={r.url} target="_blank" rel="noreferrer" className="lesson-source" dir="auto">{tx(r.title)} ↗</a><p><strong>{tx("بخش مورد نیاز: ")}</strong>{tx(r.focus)}</p><p>{tx(r.read)}</p><p className="reading-action"><strong>{tx("بعد از مطالعه انجام بده: ")}</strong>{tx(r.action)}</p></li>)}</ol></div>
  {tx(additional.length > 0 && <details className="lesson-section"><summary>{tx("منابع تکمیلی این فعالیت از رودمپ اصلی")}</summary>{tx(additional.map(r => <div className="resource-compact" key={r.id}><a className="lesson-source" href={r.url} target="_blank" rel="noreferrer" dir="auto">{tx(r.title)} ↗</a><p>{tx(r.scope)}</p></div>))}</details>)}
  <div className="lesson-section"><LessonHeading compact={compact} icon={ListChecks} tone="blue">{tx("قدم‌به‌قدم چه کار کنم؟")}</LessonHeading><ol className="lesson-steps">{tx(guide.steps.map((step, i) => <li key={i}><strong>{tx(step.title)}</strong><p>{tx(step.body)}</p></li>))}</ol></div>
  {tx(guide.example && <div className="lesson-section"><LessonHeading compact={compact} icon={Code2} tone="rose">{tx("مثال توضیح‌داده‌شده")}</LessonHeading><div className="lesson-code"><span>{tx(guide.example.language)}</span><pre dir="ltr"><code>{tx(guide.example.code)}</code></pre></div><p>{tx(guide.example.explanation)}</p></div>)}
  <div className="lesson-section exercise-box"><LessonHeading compact={compact} icon={Target} tone="violet">{tx("تمرین همین درس")}</LessonHeading><p>{tx(guide.exercise.task)}</p><dl><dt>{tx("ورودی یا سناریوی نمونه")}</dt><dd dir="auto">{tx(guide.exercise.input)}</dd><dt>{tx("خروجی و رفتار مورد انتظار")}</dt><dd dir="auto">{tx(guide.exercise.expected)}</dd></dl><details><summary>{tx("اگر گیر کردم، از کجا شروع کنم؟")}</summary><p>{tx(guide.exercise.hint)}</p></details></div>
  <div className="lesson-section" data-section="completion"><LessonHeading compact={compact} icon={CheckCircle2} tone="blue">{tx("از کجا بفهمم درس را انجام داده‌ام؟")}</LessonHeading><ul>{tx(guide.checks.map((c, i) => <li key={i}>{tx(c)}</li>))}</ul><p className="muted">{tx("شاهد کار را در یادداشت یا لینک خروجی ثبت کن؛ مطالعه، تمرین و توانایی توضیح را جدا علامت بزن.")}</p></div>
  <div className="lesson-section lesson-pitfalls"><LessonHeading compact={compact} icon={TriangleAlert} tone="amber">{tx("اشتباه‌های رایج")}</LessonHeading><ul>{tx(guide.pitfalls.map((p, i) => <li key={i}>{tx(p)}</li>))}</ul></div>
  <small className="supplement">{tx("پیشنهاد تکمیلی: توضیح آموزشی و جزئیات اجرای درس برای عملی‌کردن رودمپ نوشته شده‌اند؛ زمان این راهنما داخل همان زمان فعالیت است.")}</small>
 </article>;
}
