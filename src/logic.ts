import {z} from 'zod';
export const KEY='rahgo.personal.v1';
export const TOTAL_HOURS=390;
export function todayISO(now=new Date()):string {return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function addDays(date:string,n:number):string {const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function isISO(s:string):boolean{return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s}
const date=z.string().refine(s=>isISO(s)&&s>='1900-01-01'&&s<='2200-12-31','تاریخ نامعتبر است');
const text=z.string().max(20000);
const url=z.string().max(2048).refine(s=>!s||/^https?:\/\//i.test(s),'فقط لینک http یا https مجاز است');
const id=z.string().min(1).max(150).refine(s=>!['__proto__','constructor','prototype'].includes(s));
export const activityState=z.object({status:z.enum(['todo','doing','done']),read:z.boolean(),practiced:z.boolean(),explained:z.boolean(),output:url});
const sessionSchema=z.object({id,activityId:id,date,minutes:z.number().int().min(1).max(1440)});
export const stateSchema=z.object({
 version:z.literal(1),
 settings:z.object({startDate:date,weeklyHours:z.number().min(1).max(80),days:z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(a=>new Set(a).size===a.length),theme:z.enum(['light','dark'])}),
 activities:z.record(id,activityState),
 sessions:z.array(sessionSchema).max(20000).refine(a=>new Set(a.map(x=>x.id)).size===a.length,'شناسه نشست تکراری است'),
 notes:z.array(z.object({id,target:id,text,updatedAt:z.string().datetime()})).max(20000).refine(a=>new Set(a.map(x=>x.id)).size===a.length),
 reviews:z.record(id,z.object({learned:text,built:text,blocked:text,review:text,focus:text})),
 resources:z.record(id,z.object({status:z.enum(['todo','reading','read']),bookmark:z.boolean()})),
 skills:z.record(id,z.object({level:z.number().int().min(0).max(3),evidence:text,levels:z.record(z.string().regex(/^[0-3]$/),text).optional()})),
 projects:z.record(id,z.object({checks:z.array(z.number().int().min(0).max(100)).refine(a=>new Set(a).size===a.length),repo:url,demo:url,docs:url,notes:text})),
 planned:z.record(id,date),lastActivity:z.string().max(150)
}).strict();
export type PersonalState=z.infer<typeof stateSchema>;
export type ActivityState=z.infer<typeof activityState>;
export type Session=z.infer<typeof sessionSchema>;
export const blankActivity:ActivityState={status:'todo',read:false,practiced:false,explained:false,output:''};
export function freshState():PersonalState{return {version:1,settings:{startDate:todayISO(),weeklyHours:15,days:[6,0,1,2,3],theme:'light'},activities:{},sessions:[],notes:[],reviews:{},resources:{},skills:{},projects:{},planned:{},lastActivity:''}}
export function parseBackup(raw:string):PersonalState {if(raw.length>5_000_000)throw new Error('فایل باید کمتر از ۵ مگابایت باشد');const result=stateSchema.safeParse(JSON.parse(raw));if(!result.success)throw new Error('ساختار فایل یا مقادیر آن معتبر نیست. از خروجی نسخه ۱ راه‌گو استفاده کنید.');return result.data}
export function progress(activities:{id:string;minutes:number;optional?:boolean}[],state:PersonalState):number {const unique=[...new Map(activities.filter(a=>!a.optional).map(a=>[a.id,a])).values()];const all=unique.reduce((s,a)=>s+a.minutes,0);return all?Math.round(unique.reduce((s,a)=>s+(state.activities[a.id]?.status==='done'?a.minutes:0),0)/all*100):0}
export function recordSession(state:PersonalState,session:Session):PersonalState {sessionSchema.parse(session);return {...state,sessions:[...state.sessions.filter(s=>s.id!==session.id),session]}}
export function totalMinutes(state:PersonalState,from?:string,to?:string):number {return state.sessions.filter(s=>(!from||s.date>=from)&&(!to||s.date<=to)).reduce((n,s)=>n+s.minutes,0)}
export function saturday(date:string):string {return addDays(date,-((new Date(date+'T12:00:00Z').getUTCDay()+1)%7))}
export function buildSchedule(activities:{id:string;minutes:number;optional?:boolean}[],settings:PersonalState['settings']) {
 const daily=settings.weeklyHours*60/settings.days.length;
 const study=(d:string)=>settings.days.includes(new Date(d+'T12:00:00Z').getUTCDay());
 let day=settings.startDate;while(!study(day))day=addDays(day,1);
 let used=0;const dates:Record<string,string>={},starts:Record<string,string>={},portions:Record<string,{id:string;minutes:number}[]>={};
 for(const a of activities){if(a.optional)continue;let remaining=a.minutes;starts[a.id]=day;while(remaining>0.001){if(used>=daily-0.001){do{day=addDays(day,1)}while(!study(day));used=0}const take=Math.min(remaining,daily-used);(portions[day]??=[]).push({id:a.id,minutes:take});used+=take;remaining-=take;dates[a.id]=day}}
 // Duration always represents the full 390-hour curriculum, even for a filtered input.
 let end=settings.startDate,capacity=0;while(capacity<TOTAL_HOURS*60-0.001){if(study(end))capacity+=daily;if(capacity<TOTAL_HOURS*60-0.001)end=addDays(end,1)}
 return {dates,starts,portions,end,calendarWeeks:Math.ceil(TOTAL_HOURS/settings.weeklyHours)};
}
export const fa=(n:number)=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(n);
export function displayDate(date:string):string{return new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',month:'long',day:'numeric',year:'numeric'}).format(new Date(date+'T12:00:00Z'))}
