import {it,expect} from 'vitest';
import {weeks,projects} from './content';
import {lessonGuides,checklistGuides} from './lessons';
it('gives every activity a real concept explanation, reading instructions, steps and worked exercise',()=>{
 const activities=weeks.flatMap(w=>w.activities);
 expect(Object.keys(lessonGuides).length).toBe(activities.length);
 for(const a of activities){const g=lessonGuides[a.id];expect(g, a.id).toBeDefined();expect(g.intro.join(' ').length,a.id).toBeGreaterThan(180);expect(g.steps.length,a.id).toBeGreaterThanOrEqual(3);expect(g.resourceSections.length,a.id).toBeGreaterThan(0);for(const r of g.resourceSections){expect(r.url).toMatch(/^https:\/\//);expect(r.focus.length).toBeGreaterThan(5);expect(r.read.length).toBeGreaterThan(10);expect(r.action.length).toBeGreaterThan(10)}expect(g.exercise.task.length).toBeGreaterThan(15);expect(g.exercise.input.length).toBeGreaterThan(3);expect(g.exercise.expected.length).toBeGreaterThan(10);expect(g.checks.length).toBeGreaterThanOrEqual(2);expect(g.pitfalls.length).toBeGreaterThan(0)}
});
it('each project checkbox explains how to implement and verify it and links to existing lessons',()=>{const ids=new Set(weeks.flatMap(w=>w.activities).map(a=>a.id));for(const p of projects){const guides=checklistGuides[p.id];expect(guides,p.id).toHaveLength(p.checklist.length);for(const guide of guides){expect(guide.why.length).toBeGreaterThan(20);expect(guide.steps.length).toBeGreaterThanOrEqual(2);expect(guide.verify.length).toBeGreaterThan(20);expect(guide.lessonIds.length).toBeGreaterThan(0);for(const id of guide.lessonIds)expect(ids.has(id),id).toBe(true)}}});
it('provides an executable Go example and FizzBuzz boundary cases for the first lesson pair',()=>{expect(lessonGuides['w1-backend-study'].example?.code).toContain('package main');expect(lessonGuides['w1-backend-practice'].exercise.expected).toContain('FizzBuzz')});
