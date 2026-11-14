import {describe,it,expect} from 'vitest';
import {weeks,skills,projects} from './content';
import {blankActivity,freshState,parseBackup} from './logic';
import {skillReport,learningOverview,skillActivities,projectEvidence,relatedSkills} from './learning';

describe('connected learning evidence',()=>{
 it('has traceable required activities and valid project check references for every skill',()=>{
  for(const skill of skills){expect(skillActivities(skill.id).length).toBeGreaterThan(0);for(const ref of projectEvidence[skill.id]??[]){const p=projects.find(p=>p.id===ref.projectId)!;expect(p).toBeDefined();for(const i of ref.checks)expect(p.checklist[i]).toBeTruthy();}}
 });
 it('leaves no required learning activity disconnected from skills',()=>{for(const a of weeks.flatMap(w=>w.activities).filter(a=>!a.optional))expect(relatedSkills(a.id).length,a.id).toBeGreaterThan(0)});
 it('advances only related skills on completion and reverses without mutating the saved self assessment',()=>{
  const s=freshState();s.skills['go-basics']={level:2,evidence:'تمرین مستقل',levels:{}};
  s.activities['w1-backend-study']={...blankActivity,status:'done'};
  expect(skillReport('go-basics',s).completion).toBeGreaterThan(0);expect(skillReport('python',s).score).toBe(0);expect(skillReport('go-basics',s).autoLevel).toBe(1);
  s.activities['w1-backend-study'].status='todo';expect(skillReport('go-basics',s).score).toBe(0);expect(s.skills['go-basics'].level).toBe(2);
 });
 it('combines lesson, practice and explanation witnesses; a done checkbox alone is not full learning',()=>{
  const s=freshState();for(const a of skillActivities('go-basics'))s.activities[a.id]={...blankActivity,status:'done'};
  expect(skillReport('go-basics',s).completion).toBe(100);expect(skillReport('go-basics',s).score).toBeLessThan(100);expect(skillReport('go-basics',s).autoLevel).toBe(1);
  for(const a of skillActivities('go-basics'))s.activities[a.id]={...blankActivity,status:'done',read:true,practiced:true,explained:true};
  expect(skillReport('go-basics',s).score).toBe(100);expect(skillReport('go-basics',s).autoLevel).toBe(3);
 });
 it('connects precise project checks to relevant skill practice and retracts on undo',()=>{
  const s=freshState();const before=skillReport('sql',s).score;
  s.projects['task-api']={checks:[2],repo:'',demo:'',docs:'',notes:''};expect(skillReport('sql',s).score).toBeGreaterThan(before);expect(skillReport('python',s).score).toBe(0);
  s.projects['task-api'].checks=[];expect(skillReport('sql',s).score).toBe(before);
 });
 it('does not count time, bookmarks, optional CUDA or opening a source as learned',()=>{
  const s=freshState();s.sessions=[{id:'s',activityId:'w1-backend-study',date:'2026-11-14',minutes:60}];s.resources.tour={status:'read',bookmark:true};s.activities['w24-cuda-optional']={...blankActivity,status:'done',read:true,practiced:true,explained:true};
  const report=learningOverview(s,'2026-11-15');expect(report.completion).toBe(0);expect(report.learning).toBe(0);expect(report.currentWeek).toBe(1);expect(report.studyDays.reduce((n,d)=>n+d.minutes,0)).toBe(60);
 });
 it('keeps the ship at the first unfinished week despite later work; completes and reverses the odyssey accurately',()=>{
  const s=freshState();for(const a of weeks[20].activities)s.activities[a.id]={...blankActivity,status:'done'};
  expect(learningOverview(s).currentWeek).toBe(1);expect(learningOverview(s).voyage).toBe(0);
  for(const a of weeks[0].activities)s.activities[a.id]={...blankActivity,status:'done'};expect(learningOverview(s).currentWeek).toBe(2);expect(learningOverview(s).voyage).toBeCloseTo(100/26,1);
  for(const w of weeks)for(const a of w.activities)s.activities[a.id]={...blankActivity,status:'done',read:true,practiced:true,explained:true};expect(learningOverview(s).voyage).toBe(100);expect(learningOverview(s).learning).toBe(100);
  s.activities['w1-backend-study'].status='todo';expect(learningOverview(s).currentWeek).toBe(1);expect(learningOverview(s).voyage).toBeLessThan(100/26);
  expect(parseBackup(JSON.stringify(s))).toEqual(s);
 });
});
