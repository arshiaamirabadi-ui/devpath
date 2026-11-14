import {describe,it,expect} from 'vitest';
import {freshState,progress,buildSchedule,parseBackup,totalMinutes,recordSession,todayISO} from './logic';
const activities=[{id:'a',minutes:60},{id:'b',minutes:180},{id:'c',minutes:90,optional:true}];
describe('weighted progress',()=>{
 it('never shows 100 percent while a required activity remains unfinished',()=>{const s=freshState();s.activities.a={status:'done',read:false,practiced:false,explained:false,output:''};expect(progress([{id:'a',minutes:999},{id:'b',minutes:1}],s)).toBe(99.9)});
 it('starts at zero; weights minutes; excludes optional; allows undo',()=>{const s=freshState();expect(progress(activities,s)).toBe(0);s.activities.a={status:'done',read:true,practiced:false,explained:false,output:''};expect(progress(activities,s)).toBe(25);s.activities.c={...s.activities.a};expect(progress(activities,s)).toBe(25);s.activities.a.status='todo';expect(progress(activities,s)).toBe(0)});
 it('counts a shared activity once',()=>{const s=freshState();s.activities.a={status:'done',read:true,practiced:true,explained:true,output:''};expect(progress([activities[0],activities[0],activities[1]],s)).toBe(25)});
});
describe('schedule',()=>{
 it('keeps 390 hours and extends when capacity drops',()=>{const s=freshState();s.settings.startDate='2026-11-14';s.settings.days=[6,0,1,2,3];const a=buildSchedule(activities,s.settings);s.settings.weeklyHours=7.5;const b=buildSchedule(activities,s.settings);expect(b.end>a.end).toBe(true);expect(b.calendarWeeks).toBe(52);expect(a.calendarWeeks).toBe(26)});
 it('uses study days only and handles a future start without completing tasks',()=>{const s=freshState();s.settings.startDate='2027-01-01';s.settings.days=[6];const p=buildSchedule(activities,s.settings);expect(new Date(p.dates.a+'T12:00:00Z').getUTCDay()).toBe(6);expect(progress(activities,s)).toBe(0)});
 it('returns Tehran calendar day across UTC boundary',()=>expect(todayISO(new Date('2026-11-13T21:00:00Z'))).toBe('2026-11-14'));
});
describe('backup and sessions',()=>{
 it('round trips all personal data',()=>{const s=freshState();s.notes=[{id:'n',target:'week-1',text:'<script>alert(1)</script>',updatedAt:'2026-11-14T12:00:00Z'}];s.reviews['1']={learned:'Go',built:'CLI',blocked:'pointer',review:'errors',focus:'tests'};expect(parseBackup(JSON.stringify(s))).toEqual(s)});
 it('rejects invalid data without mutating existing state',()=>{const s=freshState();const before=JSON.stringify(s);expect(()=>parseBackup('{"version":99}')).toThrow();expect(()=>parseBackup(JSON.stringify({...s,settings:{...s.settings,days:[]}}))).toThrow();expect(JSON.stringify(s)).toBe(before)});
 it('rejects duplicate session ids and unsafe URLs',()=>{const s=freshState();s.sessions=[{id:'x',activityId:'a',date:'2026-11-14',minutes:30},{id:'x',activityId:'a',date:'2026-11-14',minutes:30}];expect(()=>parseBackup(JSON.stringify(s))).toThrow();s.sessions=[];s.projects.p={checks:[],repo:'javascript:alert(1)',demo:'',docs:'',notes:''};expect(()=>parseBackup(JSON.stringify(s))).toThrow()});
 it('editing or resubmitting a session replaces rather than doubles time',()=>{const s=freshState();const x={id:'x',activityId:'a',date:'2026-11-14',minutes:30};let next=recordSession(s,x);next=recordSession(next,x);expect(totalMinutes(next)).toBe(30);next=recordSession(next,{...x,minutes:45});expect(totalMinutes(next)).toBe(45)});
});
