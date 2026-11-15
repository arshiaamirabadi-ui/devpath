import { tx } from "./locale";
import { useEffect, useRef, useState } from "react";
import { Anchor, Navigation, Ship, Flag, Wind, Library, NotebookPen, Compass, BookOpen, Eye, Sparkles, AudioLines, House, ArrowUpLeft } from "lucide-react";
import { months, weeks } from "./content";
import { learningOverview } from "./learning";
import { Link } from "./components";
import { fa } from "./logic";
import { Meter } from "./components";
import { odysseyChapters, odysseySource } from "./odyssey-story";
const points = [{
  x: 90,
  y: 245
}, {
  x: 255,
  y: 155
}, {
  x: 420,
  y: 255
}, {
  x: 585,
  y: 145
}, {
  x: 750,
  y: 250
}, {
  x: 920,
  y: 165
}];
export const voyageStops = points;
// The route begins at Troy itself; the final approach ends at Ithaca.
const boundaries = [0, 4, 8, 12, 16, 26];
const segment = (a: typeof points[number], b: typeof a) => `C ${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
export function voyageGeometry(percent: number) {
  const distance = Math.max(0, Math.min(100, percent)) * 26 / 100;
  let i = boundaries.findIndex((_, n) => n < points.length - 1 && distance < boundaries[n + 1]);
  if (i < 0) i = points.length - 2;
  const t = Math.min(1, (distance - boundaries[i]) / (boundaries[i + 1] - boundaries[i]));
  const a = points[i],
    b = points[i + 1],
    c = {
      x: (a.x + b.x) / 2,
      y: a.y
    },
    d = {
      x: c.x,
      y: b.y
    };
  const lerp = (u: typeof a, v: typeof a) => ({
    x: u.x + (v.x - u.x) * t,
    y: u.y + (v.y - u.y) * t
  });
  const ac = lerp(a, c),
    cd = lerp(c, d),
    db = lerp(d, b),
    q = lerp(ac, cd),
    r = lerp(cd, db),
    position = lerp(q, r);
  const completed = points.slice(0, i).map((p, n) => segment(p, points[n + 1])).join(" ");
  return {
    position,
    path: `M ${points[0].x} ${points[0].y} ${points.slice(0, -1).map((p, n) => segment(p, points[n + 1])).join(" ")}`,
    traveled: `M ${points[0].x} ${points[0].y} ${completed} C ${ac.x} ${ac.y} ${q.x} ${q.y} ${position.x} ${position.y}`
  };
}
export default function Odyssey({
  report
}: {
  report: ReturnType<typeof learningOverview>;
}) {
  const geometry = voyageGeometry(report.voyage);
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
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const follow = () => {
      const target = geometry.position.x / 1000 * map.scrollWidth - map.clientWidth / 2;
      map.scrollTo({
        left: Math.max(0, target),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
      });
    };
    follow();
    const observer = new ResizeObserver(follow);
    observer.observe(map);
    return () => observer.disconnect();
  }, [report.voyage]);
  return <section className="odyssey panel" aria-label={tx("سفر ادیسه یادگیری")}>
  <div className="odyssey-heading"><div><span className="eyebrow"><Anchor size={15} />{tx("سفر ادیسهٔ تو")}</span><h2>{tx(report.finished ? "در ساحل ایتاکا" : "از تروا، رو به خانه")}</h2><p>{tx("منزل کنونی: ")}{tx(odysseyChapters[report.currentMonth - 1].name)}{tx(" · هفتهٔ ")}{tx(fa(report.currentWeek))}</p></div><span className="live-badge"><i />{tx("رو به ایتاکا")}</span></div>
  <div ref={mapRef} className="odyssey-map-scroll" tabIndex={0} aria-label={tx("نقشه سفر؛ برای دیدن همه جزیره‌ها افقی جابه‌جا کن")}><svg className="odyssey-map" viewBox="0 0 1000 390" role="group" aria-label={tx("جایگاه کشتی: هفته " + fa(report.currentWeek) + "، " + fa(report.voyage) + " درصد سفر پیوسته")}>
   <defs><pattern id="sea-waves" width="72" height="40" patternUnits="userSpaceOnUse"><path d="M 0 20 q 18 -9 36 0 t 36 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".12" /></pattern><linearGradient id="ship-sail" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f8f5ff" /><stop offset="1" stopColor="#cbb4ff" /></linearGradient></defs>
   <rect width="1000" height="390" rx="18" className="sea-fill" /><rect width="1000" height="390" fill="url(#sea-waves)" />
   <text x="45" y="40" className="map-compass">N ↑</text><text x="860" y="355" className="sea-caption">DevPath Odyssey</text>
   <path d={geometry.path} className="voyage-path" /><path d={geometry.traveled} className="voyage-traveled" />
   {tx(months.map((month, i) => {
          const point = points[i],
            items = report.weeks.filter(w => w.month === month.number),
            complete = items.every(w => w.completion === 100),
            active = report.currentMonth === month.number && !report.finished;
          return <a key={month.id} data-testid={"voyage-stop-" + month.number} data-x={point.x} data-y={point.y} href="#/progress" onClick={e => {
            e.preventDefault();
            selectChapter(month.number);
          }} className={"odyssey-island " + (complete ? "visited" : active ? "current" : "")} aria-label={tx(odysseyChapters[i].name + "، ماه " + fa(month.number) + "، " + month.title + (complete ? "، طی‌شده" : active ? "، مرحله فعلی" : "، پیش رو"))}><rect x={point.x - 75} y={point.y - 115} width="150" height="190" fill="transparent" pointerEvents="all" aria-hidden="true" /><title>{tx(odysseyChapters[i].name)} · {tx(month.title)} · {tx(fa(Math.round(items.reduce((n, w) => n + w.completion, 0) / items.length)))}{tx("٪ تکمیل")}</title><ellipse cx={point.x} cy={point.y + 6} rx="43" ry="26" className="island-shadow" /><ellipse cx={point.x} cy={point.y} rx="37" ry="25" className="island-land" /><path d={`M ${point.x - 13} ${point.y + 5} l 13 -22 l 15 22 z`} className="island-mountain" /><text x={point.x} y={point.y - 102} textAnchor="middle" className="island-month">{tx("ماه ")}{tx(fa(month.number))}</text><text x={i === 5 ? 900 : point.x} y={point.y - 80} textAnchor="middle" className="island-name">{tx(odysseyChapters[i].name)}</text><text x={point.x} y={point.y + 55} textAnchor="middle" className="island-caption">{tx(complete ? "✓ طی‌شده" : active ? "ایستگاه فعلی" : "پیش رو")}</text></a>;
        }))}
   <g className="voyage-ship-position" style={{
          transform: `translate(${geometry.position.x}px,${geometry.position.y}px)`
        }} data-testid="voyage-ship" data-distance={report.voyage}><g className="voyage-ship"><ellipse cx="0" cy="20" rx="32" ry="7" fill="#080c222d" /><path d="M -28 6 L 29 6 L 17 21 L -17 21 Z" fill="#8c6de5" stroke="#e0cfff" strokeWidth="2" /><path d="M 0 4 V -50" stroke="#f1e5ff" strokeWidth="3" /><path d="M -4 -45 L -24 0 H -4 Z M 5 -41 L 24 0 H 5 Z" fill="url(#ship-sail)" /><path d="M 0 -50 L 17 -44 L 0 -39" fill="#72b5ff" /></g></g>
  </svg></div>
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
