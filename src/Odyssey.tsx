import { tx } from "./locale";
import { useRef, useState } from "react";
import { Anchor, Navigation, Ship, Flag, Wind, Library, NotebookPen, Compass, BookOpen, Eye, Sparkles, AudioLines, House, ArrowUpLeft } from "lucide-react";
import { learningOverview } from "./learning";
import { Link } from "./components";
import { fa } from "./logic";
import { Meter } from "./components";
import { odysseyChapters, odysseySource } from "./odyssey-story";
import OdysseyTrail from './OdysseyTrail';
export {voyageGeometry,voyageStops} from './trail-model';
export default function Odyssey({
  report
}: {
  report: ReturnType<typeof learningOverview>;
}) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const chapter = odysseyChapters[(selectedChapter ?? report.currentMonth) - 1],
    chapterWeeks = report.weeks.filter(w => w.month === chapter.month);
  const chapterRef = useRef<HTMLElement>(null);
  const ChapterIcon = [Ship, Eye, Wind, Sparkles, AudioLines, House][chapter.month - 1];
  const selectChapter = (number: number | null) => {
    setSelectedChapter(number);
    requestAnimationFrame(() => {
      chapterRef.current?.focus({
        preventScroll: true
      });
      chapterRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start"
      });
    });
  };
  return <section className="odyssey panel" aria-label={tx("سفر ادیسه یادگیری")}>
  <div className="odyssey-heading"><div><span className="eyebrow"><Anchor size={15} />{tx("سفر ادیسهٔ تو")}</span><h2>{tx(report.finished ? "در ساحل ایتاکا" : "از تروا، رو به خانه")}</h2><p>{tx("منزل کنونی: ")}{tx(odysseyChapters[report.currentMonth - 1].name)}{tx(" · هفتهٔ ")}{tx(fa(report.currentWeek))}</p></div><span className="live-badge"><i />{tx("رو به ایتاکا")}</span></div>
  <OdysseyTrail report={report} onChapter={selectChapter}/>
  <div className="odyssey-footer"><span><Navigation size={17} />{tx(fa(report.voyage))}{tx("٪ سفر پیوسته")}</span><span><Flag size={17} />{tx(fa(report.weeks.filter(w => w.completion === 100).length))}{tx(" ایستگاه هفتگی تکمیل‌شده")}</span><Link className="outline" to={report.next ? "activity/" + report.next.id : "review"}><Ship size={17} />{tx(report.next ? "ادامه سفر از درس بعدی" : "مرور سفر")}</Link></div>
  <div className="odyssey-vitals"><Link to="today" data-tone="blue"><Wind size={21} /><span>{tx("بادبان سفر")}<strong>{tx(fa(report.studyDays.slice(-7).reduce((n, d) => n + d.minutes, 0)))}{tx(" دقیقه در ۷ روز")}</strong></span></Link><Link to="resources" data-tone="violet"><Library size={21} /><span>{tx("توشهٔ علمی")}<strong>{tx(fa(report.sources))}{tx(" منبع مطالعه‌شده")}</strong></span></Link><Link to="notes" data-tone="rose"><NotebookPen size={21} /><span>{tx("دفتر کشتی")}<strong>{tx(fa(report.logbook))}{tx(" یادداشت")}</strong></span></Link><Link to="review" data-tone="amber"><Compass size={21} /><span>{tx("قطب‌نمای بازبینی")}<strong>{tx(fa(report.reviews))}{tx(" مرور ثبت‌شده")}</strong></span></Link></div>
  <section ref={chapterRef} tabIndex={-1} className="odyssey-chapter" aria-label={tx("روایت مرحلهٔ سفر")}>
   <div className="chapter-heading"><span className="chapter-emblem"><ChapterIcon size={30} /></span><div><span className="eyebrow">{tx("منزل ")}{tx(fa(chapter.month))}{tx(" · هفتهٔ ")}{tx(fa(chapterWeeks[0].number))}{tx(" تا ")}{tx(fa(chapterWeeks[chapterWeeks.length - 1].number))}</span><h3 aria-live="polite">{tx(chapter.name)}</h3><p>{tx(chapter.subtitle)}</p></div>{tx(selectedChapter !== null && <button onClick={() => selectChapter(null)}>{tx("مرحلهٔ من")}</button>)}</div>
   <div className="chapter-narrative"><div><h4><BookOpen size={17} />{tx("در ادیسه")}</h4><p>{tx(chapter.story)}</p><a href={odysseySource} target="_blank" rel="noreferrer">{tx("هومر · ")}{tx(chapter.book)} ↗</a></div><div><h4><Navigation size={17} />{tx("در مسیر تو")}</h4><p>{tx(chapter.parallel)}</p></div></div>
   <div className="chapter-keepsake"><Flag size={19} /><span>{tx("دستاورد این منزل")}<strong>{tx(chapter.keepsake)}</strong></span></div>
   <div className="chapter-quests">{tx(chapterWeeks.map(w => <Link key={w.number} to={"week/" + w.number} className="chapter-quest"><span>{tx("هفته ")}{tx(fa(w.number))}<ArrowUpLeft size={15} /></span><strong>{tx(w.title)}</strong><Meter value={w.completion} label="پیشرفت هفته" /></Link>))}</div>
  </section>
  <details className="voyage-guide"><summary>{tx("دربارهٔ این سفر")}</summary><p>{tx("در ادیسهٔ هومر، اودیسئوس پس از جنگ تروا راه بازگشت به ایتاکا را می‌پیماید. این نقشه شش صحنهٔ برگزیدهٔ آن سفر را به شش مرحلهٔ یادگیری تشبیه می‌کند؛ روایت کامل کتاب یا نقشهٔ جغرافیایی آن نیست.")}</p><p>{tx("کشتی از ایستگاه‌های هفتگی کامل عبور می‌کند. کار روی مرحله‌های بعد هم در نمودارها دیده می‌شود؛ برای ادامهٔ مسیر پیوسته، ایستگاه‌های ناتمام پیشین را هم بگذران.")}</p></details>
 </section>;
}
