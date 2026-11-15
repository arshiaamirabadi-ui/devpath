import { tx } from "./locale";
import { Link } from "./components";
import { fa, displayDate } from "./logic";
import { tracks } from "./components";
import { learningOverview } from "./learning";
import { TrackMark, trackTones } from "./ui";
type Report = ReturnType<typeof learningOverview>;
export function CompletionDonut({
  report
}: {
  report: Report;
}) {
  const circle = 2 * Math.PI * 72;
  return <div className="donut-layout"><svg viewBox="0 0 200 200" className="completion-donut" role="img" aria-label={tx(fa(report.completion) + " درصد فعالیت‌های اجباری تکمیل شده")}><circle cx="100" cy="100" r="72" className="donut-track" /><circle cx="100" cy="100" r="72" className="donut-value" strokeDasharray={circle} strokeDashoffset={circle * (1 - report.completion / 100)} transform="rotate(-90 100 100)" /><text x="100" y="100" textAnchor="middle" className="donut-number">{tx(fa(report.completion))}{tx("٪")}</text><text x="100" y="126" textAnchor="middle" className="donut-caption">{tx("تکمیل مسیر")}</text></svg><div className="donut-legend"><p><strong>{tx(fa(report.done))}</strong>{tx(" از ")}{tx(fa(report.total))}{tx(" فعالیت اصلی")}</p><p><strong>{tx(fa(report.learning))}{tx("٪")}</strong>{tx(" شواهد یادگیری")}</p><p><strong>{tx(fa(report.projectProgress))}{tx("٪")}</strong>{tx(" چک‌لیست پروژه‌ها")}</p></div></div>;
}
export function TrackRadar({
  report
}: {
  report: Report;
}) {
  const point = (index: number, value: number) => {
    const angle = (index * 90 - 90) * Math.PI / 180;
    return `${150 + Math.cos(angle) * value} ${140 + Math.sin(angle) * value}`;
  };
  return <><svg className="track-radar" viewBox="0 0 300 290" role="img" aria-label={tx("تعادل شواهد چهار مسیر: " + report.tracks.map(t => tracks[t.id] + " " + fa(t.learning) + " درصد").join("، "))}>{tx([25, 50, 75, 100].map(n => <polygon key={n} points={[0, 1, 2, 3].map(i => point(i, n)).join(",")} className="radar-grid" />))}{tx(report.tracks.map((t, i) => <line key={t.id} x1="150" y1="140" x2={point(i, 100).split(" ")[0]} y2={point(i, 100).split(" ")[1]} className="radar-grid" />))}<polygon points={report.tracks.map((t, i) => point(i, t.learning)).join(",")} className="radar-fill" />{tx(report.tracks.map((t, i) => <circle key={t.id} cx={point(i, t.learning).split(" ")[0]} cy={point(i, t.learning).split(" ")[1]} r="4" data-tone={trackTones[t.id]} className="radar-dot"><title>{tx(tracks[t.id])}: {tx(fa(t.learning))}{tx("٪")}</title></circle>))}<text x="150" y="22" textAnchor="middle">Backend</text><text x="270" y="144" textAnchor="middle">AI</text><text x="150" y="266" textAnchor="middle">{tx("سیستم‌ها")}</text><text x="28" y="144" textAnchor="middle">{tx("پروژه")}</text></svg><div className="radar-legend">{tx(report.tracks.map(t => <span key={t.id} data-tone={trackTones[t.id]}><TrackMark track={t.id}/>{tx(tracks[t.id])}<strong>{tx(fa(t.learning))}{tx("٪")}</strong></span>))}</div></>;
}
export function StudyChart({
  days
}: {
  days: Report["studyDays"];
}) {
  const max = Math.max(60, ...days.map(d => d.minutes)),
    x = (i: number) => 42 + i * 500 / Math.max(1, days.length - 1),
    y = (n: number) => 160 - n / max * 125;
  return <><svg className="study-chart" viewBox="0 0 580 210" role="img" aria-label={tx("زمان واقعی مطالعه در " + fa(days.length) + " روز اخیر؛ جمع " + fa(days.reduce((n, d) => n + d.minutes, 0)) + " دقیقه")}>{tx([0, .5, 1].map(t => <g key={t}><line x1="42" x2="542" y1={y(t * max)} y2={y(t * max)} className="chart-grid" /><text x="30" y={y(t * max) + 5} textAnchor="end">{tx(fa(t * max))}</text></g>))}<path d={`M 42 160 L ${days.map((d, i) => `${x(i)} ${y(d.minutes)}`).join(" L ")} L 542 160 Z`} className="study-area" /><polyline points={days.map((d, i) => `${x(i)},${y(d.minutes)}`).join(" ")} className="study-line" />{tx(days.map((d, i) => <circle key={d.date} cx={x(i)} cy={y(d.minutes)} r={d.minutes ? 4 : 2} className="study-dot"><title>{tx(displayDate(d.date))}: {tx(fa(d.minutes))}{tx(" دقیقه")}</title></circle>))}<text x="42" y="193" textAnchor="start">{tx(displayDate(days[0].date))}</text><text x="542" y="193" textAnchor="end">{tx(displayDate(days[days.length - 1].date))}</text></svg><details className="chart-data"><summary>{tx("داده‌های نمودار زمان")}</summary><div className="table-scroll"><table><thead><tr><th>{tx("روز")}</th><th>{tx("مطالعهٔ ثبت‌شده")}</th></tr></thead><tbody>{tx(days.map(d => <tr key={d.date}><td>{tx(displayDate(d.date))}</td><td>{tx(fa(d.minutes))}{tx(" دقیقه")}</td></tr>))}</tbody></table></div></details></>;
}
export function WeeklyChart({
  report
}: {
  report: Report;
}) {
  return <><div className="weekly-chart" aria-label={tx("تکمیل و شواهد یادگیری در ۲۶ هفته")}>{tx(report.weeks.map(w => <Link to={"week/" + w.number} className={"weekly-bar " + (w.number === report.currentWeek ? "current" : "")} key={w.number}><span className="bar-track"><i className="week-completed" style={{
            height: w.completion + "%"
          }} /><i className="week-learning" style={{
            height: w.learning + "%"
          }} /></span><span>{tx(fa(w.number))}</span><span className="sr-only">{tx("هفته ")}{tx(fa(w.number))}: {tx(fa(w.completion))}{tx("٪ تکمیل، ")}{tx(fa(w.learning))}{tx("٪ شواهد یادگیری؛ ")}{tx(w.title)}</span></Link>))}</div><div className="chart-legend"><span><i className="legend-complete" />{tx("تکمیل فعالیت")}</span><span><i className="legend-learning" />{tx("شواهد یادگیری")}</span><small>{tx("هر ستون، برنامهٔ همان هفته را باز می‌کند.")}</small></div></>;
}
