import { tx } from "./locale";
import { Link2 } from "lucide-react";
import { relatedSkills, skillReport } from "./learning";
import { useStore } from "./store";
import { Link } from "./components";
import { fa } from "./logic";
export default function ActivityImpact({
  id
}: {
  id: string;
}) {
  const {
    state
  } = useStore();
  const related = relatedSkills(id);
  if (!related.length) return null;
  return <section className="activity-impact" aria-label={tx("اثر این فعالیت بر مهارت‌ها")}><div><Link2 size={20} /><strong>{tx("مهارت‌های این درس")}</strong><Link to="progress">{tx("سفر ادیسه ↗")}</Link></div><p>{tx("این درس بخشی از مسیر مهارت‌های زیر است.")}</p><div className="button-row">{tx(related.map(s => <Link className="chip" key={s.id} to={"skill/" + s.id}>{tx(s.title)}<strong>{tx(fa(skillReport(s.id, state).score))}{tx("٪")}</strong></Link>))}</div></section>;
}
