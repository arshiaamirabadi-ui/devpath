import {lessonGuides} from './lessons';
import {resources,weeks} from './content';
export default function LessonContent({activityId,compact=false}:{activityId:string;compact?:boolean}){
 const guide=lessonGuides[activityId];
 if(!guide)return <p role="alert">راهنمای این درس پیدا نشد.</p>;
 const activity=weeks.flatMap(w=>w.activities).find(a=>a.id===activityId);
 const additional=resources.filter(r=>activity?.resourceIds.includes(r.id)&&!guide.resourceSections.some(g=>g.url.replace(/\/$/,'').startsWith(r.url.replace(/\/$/,''))));
 const Heading=compact?'h3':'h2';
 return <article className={compact?'lesson-content lesson-embedded':'lesson-content panel'} aria-label="توضیح و راهنمای درس" data-activity-id={activityId}>
  <div className="lesson-section"><Heading>این درس چه چیزی یاد می‌دهد؟</Heading>{guide.intro.map((p,i)=><p key={i}>{p}</p>)}</div>
  <div className="lesson-section"><Heading>از کدام منبع و کدام بخش بخوانم؟</Heading><p className="muted">این ترتیب را دنبال کن؛ لازم نیست تمام دوره یا کتاب را برای این درس تمام کنی.</p><ol className="lesson-readings">{guide.resourceSections.map((r,i)=><li key={i}><a href={r.url} target="_blank" rel="noreferrer" className="lesson-source" dir="auto">{r.title} ↗</a><p><strong>بخش مورد نیاز: </strong>{r.focus}</p><p>{r.read}</p><p className="reading-action"><strong>بعد از مطالعه انجام بده: </strong>{r.action}</p></li>)}</ol></div>
  {additional.length>0&&<details className="lesson-section"><summary>منابع تکمیلی این فعالیت از رودمپ اصلی</summary>{additional.map(r=><div className="resource-compact" key={r.id}><a className="lesson-source" href={r.url} target="_blank" rel="noreferrer" dir="auto">{r.title} ↗</a><p>{r.scope}</p></div>)}</details>}
  <div className="lesson-section"><Heading>قدم‌به‌قدم چه کار کنم؟</Heading><ol className="lesson-steps">{guide.steps.map((step,i)=><li key={i}><strong>{step.title}</strong><p>{step.body}</p></li>)}</ol></div>
  {guide.example&&<div className="lesson-section"><Heading>مثال توضیح‌داده‌شده</Heading><div className="lesson-code"><span>{guide.example.language}</span><pre dir="ltr"><code>{guide.example.code}</code></pre></div><p>{guide.example.explanation}</p></div>}
  <div className="lesson-section exercise-box"><Heading>تمرین همین درس</Heading><p>{guide.exercise.task}</p><dl><dt>ورودی یا سناریوی نمونه</dt><dd dir="auto">{guide.exercise.input}</dd><dt>خروجی و رفتار مورد انتظار</dt><dd dir="auto">{guide.exercise.expected}</dd></dl><details><summary>اگر گیر کردم، از کجا شروع کنم؟</summary><p>{guide.exercise.hint}</p></details></div>
  <div className="lesson-section"><Heading>از کجا بفهمم درس را انجام داده‌ام؟</Heading><ul>{guide.checks.map((c,i)=><li key={i}>{c}</li>)}</ul><p className="muted">شاهد کار را در یادداشت یا لینک خروجی ثبت کن؛ مطالعه، تمرین و توانایی توضیح را جدا علامت بزن.</p></div>
  <div className="lesson-section lesson-pitfalls"><Heading>اشتباه‌های رایج</Heading><ul>{guide.pitfalls.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
  <small className="supplement">پیشنهاد تکمیلی: توضیح آموزشی و جزئیات اجرای درس برای عملی‌کردن رودمپ نوشته شده‌اند؛ زمان این راهنما داخل همان زمان فعالیت است.</small>
 </article>
}
