import {ArrowUpLeft,Target} from 'lucide-react';
import type {Activity} from './content';
import {ActivityRow,Link} from './components';
import {agendaSlots,clockParts} from './agenda-model';
import {fa} from './logic';
import {tx} from './locale';
import {trackTones} from './ui';
function AgendaTime({minutes}:{minutes:number}){const time=clockParts(minutes);return <time><span dir="ltr">{fa(time.hour).padStart(2,tx('۰'))}:{fa(time.minute).padStart(2,tx('۰'))}</span>{time.day>0&&<small>+{fa(time.day)} {tx('روز')}</small>}</time>}
export default function DailyAgenda({items,start,focus}:{items:{activity:Activity;minutes:number}[];start:string;focus?:Activity}){
 return <>{focus&&<Link className="agenda-focus" to={'activity/'+focus.id}><Target size={17}/><span><small>{tx('قدم اصلی روز')}</small><strong>{tx(focus.title)}</strong></span><ArrowUpLeft size={18}/></Link>}<div className="daily-agenda">{agendaSlots(items,start).map(({item,from,to})=><div className="agenda-entry" key={item.activity.id} data-tone={trackTones[item.activity.track]}><div className="agenda-rail" aria-label={tx('بازهٔ مطالعه')}><AgendaTime minutes={from}/><i/><AgendaTime minutes={to}/></div><ActivityRow a={item.activity} minutes={item.minutes}/></div>)}</div></>;
}
