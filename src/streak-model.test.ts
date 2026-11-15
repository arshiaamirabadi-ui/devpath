import {describe,it,expect} from 'vitest';
import {freshState,blankActivity,parseBackup} from './logic';
import {streakReport,stampCompletions,calendarMonth} from './streak-model';
describe('learning streak',()=>{
 it('counts unique qualifying Tehran dates and keeps yesterday alive until today ends',()=>{
 const state=freshState();state.sessions=[{id:'a',activityId:'x',date:'2026-11-13',minutes:10},{id:'b',activityId:'x',date:'2026-11-14',minutes:6},{id:'c',activityId:'x',date:'2026-11-14',minutes:4},{id:'future',activityId:'x',date:'2026-11-16',minutes:60}];
 expect(streakReport(state,'2026-11-15')).toMatchObject({current:2,best:2,todayDone:false,totalDays:2});expect(streakReport(state,'2026-11-16').current).toBe(1);expect(streakReport(state,'2026-11-18').current).toBe(0);
 });
 it('qualifies a dated lesson, removes its day on undo and never invents dates for old completions',()=>{
 const before=freshState();before.activities.old={...blankActivity,status:'done'};const next={...before,activities:{...before.activities,new:{...blankActivity,status:'done' as const}}};
 const stamped=stampCompletions(before,next,'2026-11-15');expect(stamped.activities.old.completedOn).toBeUndefined();expect(streakReport(stamped,'2026-11-15').current).toBe(1);expect(parseBackup(JSON.stringify(stamped)).activities.new.completedOn).toBe('2026-11-15');
 const undone=stampCompletions(stamped,{...stamped,activities:{...stamped.activities,new:{...stamped.activities.new,status:'todo'}}},'2026-11-15');expect(streakReport(undone,'2026-11-15').current).toBe(0);expect(stamped.activities.new.completedOn).toBe('2026-11-15');
 });
 it('does not reward nine minutes and calculates longest runs across month and year boundaries',()=>{
 const state=freshState();state.sessions=['2025-12-30','2025-12-31','2026-01-01','2026-11-15'].map((date,i)=>({id:String(i),activityId:'x',date,minutes:i===3?9:10}));expect(streakReport(state,'2026-11-15')).toMatchObject({current:0,best:3,todayDone:false,minutesToday:9});
 });
 it('builds real Gregorian and Persian calendar months with Saturday-first padding',()=>{
 const en=calendarMonth('2026-11-15','en-US');expect(en.dates).toHaveLength(30);expect(en.start).toBe('2026-11-01');expect(en.offset).toBe(1);
 const fa=calendarMonth('2026-11-15','fa-IR');expect(fa.start).toBe('2026-10-23');expect(fa.dates).toHaveLength(30);
 });
});
