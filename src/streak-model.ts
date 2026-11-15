import {addDays,isISO,todayISO,type PersonalState} from './logic';
/** Only a newly completed lesson receives today's date; imports retain their evidence. */
export function stampCompletions(previous:PersonalState,next:PersonalState,today=todayISO()):PersonalState {
 const activities={...next.activities};
 for(const [id,value] of Object.entries(activities)){
  if(value.status==='done'&&previous.activities[id]?.status!=='done')activities[id]={...value,completedOn:today};
  else if(value.status!=='done'&&value.completedOn){const {completedOn:_,...rest}=value;activities[id]=rest;}
 }
 return {...next,activities};
}
export function streakReport(state:PersonalState,today=todayISO()){
 const minutes:Record<string,number>={};for(const s of state.sessions)if(s.date<=today)minutes[s.date]=(minutes[s.date]??0)+s.minutes;
 const days=new Set(Object.entries(minutes).filter(([,n])=>n>=10).map(([d])=>d));
 for(const a of Object.values(state.activities))if(a.status==='done'&&a.completedOn&&isISO(a.completedOn)&&a.completedOn<=today)days.add(a.completedOn);
 const dates=[...days].sort();let best=0,run=0,previous='';for(const d of dates){run=previous&&addDays(previous,1)===d?run+1:1;best=Math.max(best,run);previous=d;}
 let cursor=days.has(today)?today:addDays(today,-1),current=0;while(days.has(cursor)){current++;cursor=addDays(cursor,-1);}
 const todayDone=days.has(today),lessonsToday=Object.values(state.activities).filter(a=>a.status==='done'&&a.completedOn===today).length;
 return {current,best,dates,todayDone,totalDays:days.size,minutesToday:minutes[today]??0,lessonsToday,goal:todayDone?100:Math.min(100,(minutes[today]??0)*10)};
}
export function calendarMonth(anchor:string,locale:string){
 const formatter=new Intl.DateTimeFormat(locale,{year:'numeric',month:'numeric',timeZone:'Asia/Tehran'});
 const key=(date:string)=>formatter.format(new Date(date+'T12:00:00Z'));
 const month=key(anchor);let start=anchor;for(let i=0;i<32&&key(addDays(start,-1))===month;i++)start=addDays(start,-1);
 const dates:string[]=[];for(let date=start;dates.length<32&&key(date)===month;date=addDays(date,1))dates.push(date);
 return {start,dates,offset:(new Date(start+'T12:00:00Z').getUTCDay()+1)%7,previous:addDays(start,-1),next:addDays(dates.at(-1)!,1)};
}
