import {useEffect,useState} from 'react';
import {todayISO} from './logic';
/** Refresh at midnight, after backgrounding, and while the end-of-day clock is visible. */
export function useLearningClock(){
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{const tick=()=>setNow(new Date());const timer=setInterval(tick,30000);document.addEventListener('visibilitychange',tick);window.addEventListener('focus',tick);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);window.removeEventListener('focus',tick)}},[]);
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(now);
 const hour=Number(parts.find(p=>p.type==='hour')?.value??0),minute=Number(parts.find(p=>p.type==='minute')?.value??0),remaining=1440-hour*60-minute;
 return {today:todayISO(now),remaining,now};
}
