import {weeks,skills,projects,resources,type Activity,type Track} from './content';
import {addDays,blankActivity,progress,todayISO,type PersonalState} from './logic';

const activities=weeks.flatMap(w=>w.activities).filter(a=>!a.optional);
export type Skill=typeof skills[number];
export const projectEvidence:Record<string,{projectId:string;checks:number[]}[]>={
 'go-basics':[{projectId:'go-small',checks:[0,1,3]}],
 'go-contracts':[{projectId:'go-cli',checks:[0,2]}],
 'go-files':[{projectId:'go-cli',checks:[1]}],
 'http-rest':[{projectId:'task-api',checks:[1,4]}],
 sql:[{projectId:'task-api',checks:[2]}],
 auth:[{projectId:'task-api',checks:[0,3]},{projectId:'docker-api',checks:[1]},{projectId:'studioflow',checks:[2]}],
 testing:[{projectId:'docker-api',checks:[0,1]},{projectId:'studioflow',checks:[8]}],
 'docker-linux':[{projectId:'docker-api',checks:[2,3,5]},{projectId:'studioflow',checks:[9]}],
 'redis-ci':[{projectId:'docker-api',checks:[4]}],
 frontend:[{projectId:'react-panel',checks:[4]}],
 'react-ts':[{projectId:'react-panel',checks:[0,1,2,3]}],
 python:[{projectId:'python-script',checks:[0,1,2,3]}],
 ml:[{projectId:'mnist',checks:[1]}],
 pytorch:[{projectId:'mnist',checks:[0,2,5]}],
 evaluation:[{projectId:'mnist',checks:[1,3]},{projectId:'fine-tuning',checks:[4]}],
 'training-stages':[{projectId:'fine-tuning',checks:[3]}],
 'fine-tuning':[{projectId:'fine-tuning',checks:[3,6]}],
 'ai-integration':[{projectId:'studioflow',checks:[7]}],
 'gpu-measure':[{projectId:'cpu-gpu',checks:[0,1,2,3,4]}],
 c:[{projectId:'c-basics',checks:[0,1,2,3]}],
 git:[{projectId:'go-small',checks:[2]},{projectId:'go-cli',checks:[3]}],
 delivery:[{projectId:'studioflow',checks:[10]},{projectId:'docker-api',checks:[5]},{projectId:'fine-tuning',checks:[6]}],
};
// Cross-track applications and reviews are explicit: a shared week alone is not a link.
const crossTrackLessons:Record<string,string[]>={
 'go-basics':['w2-project'],
 'go-contracts':['w3-project'],
 'http-rest':['w6-project'],sql:['w7-project'],auth:['w8-project'],
 engineering:['w9-project'],testing:['w10-project'],concurrency:['w11-project'],
 'docker-linux':['w12-project'],frontend:['w13-project'],
 'react-ts':['w14-project','w15-project','w16-project','w22-backend-study','w22-backend-practice'],
 evaluation:['w13-ai-study','w13-ai-practice','w15-ai-study','w15-ai-practice'],
 'ai-integration':['w16-ai-study','w16-ai-practice','w17-backend-study','w17-backend-practice','w18-backend-study','w18-backend-practice','w19-backend-study','w19-backend-practice','w20-backend-study','w20-backend-practice'],
 'fine-tuning':['w17-project','w18-project','w19-project','w20-project'],
 delivery:['w4-project','w8-project','w12-project','w16-project','w20-project','w21-project','w22-project','w23-project','w24-backend-study','w24-backend-practice','w25-backend-study','w25-backend-practice','w26-backend-study','w26-backend-practice','w24-ai-study','w24-ai-practice','w25-ai-study','w25-ai-practice','w26-ai-study','w26-ai-practice','w25-systems','w26-systems'],
};
const skillLinks=new Map(skills.map(s=>[s.id,activities.filter(a=>(a.track===s.track&&s.weeks.includes(a.week))||crossTrackLessons[s.id]?.includes(a.id))]));
const reverseLinks=new Map(activities.map(a=>[a.id,skills.filter(s=>skillLinks.get(s.id)?.some(item=>item.id===a.id))]));
export const skillActivities=(id:string):Activity[]=>skillLinks.get(id)??[];
export const relatedSkills=(id:string)=>reverseLinks.get(id)??[];
const precise=(value:number)=>value>=100?100:Math.min(99.9,Math.round(value*10)/10);
const ratio=(list:Activity[],get:(a:Activity)=>number)=>{const weight=list.reduce((n,a)=>n+a.minutes,0);return weight?list.reduce((n,a)=>n+a.minutes*get(a),0)/weight:0};
function projectPractice(id:string,state:PersonalState){const refs=(projectEvidence[id]??[]).flatMap(ref=>ref.checks.map(check=>({id:ref.projectId,check})));return refs.length?refs.filter(r=>state.projects[r.id]?.checks.includes(r.check)).length/refs.length:0}
export const autoLabels=['آغاز راه','در حال یادگیری','توانایی عملی','آمادهٔ توضیح'] as const;
export function skillReport(id:string,state:PersonalState){
 const list=skillActivities(id),get=(a:Activity)=>state.activities[a.id]??blankActivity;
 const completion=progress(list,state),read=ratio(list,a=>Number(get(a).read)),explained=ratio(list,a=>Number(get(a).explained));
 const project=projectPractice(id,state),practice=Math.max(ratio(list,a=>Number(get(a).practiced||!!get(a).output)),project);
 const score=Math.round(completion*.5+read*15+practice*25+explained*10);
 const autoLevel=completion===100&&practice>=.5?(explained===1&&read===1?3:2):score>0?1:0;
 const self=state.skills[id];
 return {id,activities:list,completion,read:Math.round(read*100),practice:Math.round(practice*100),explained:Math.round(explained*100),project:Math.round(project*100),score,autoLevel,selfLevel:self?.level??0,selfEvidence:self?.evidence??'',projects:projectEvidence[id]??[]};
}
function activityLearning(a:Activity,state:PersonalState){
 const v=state.activities[a.id]??blankActivity;
 const project=Math.max(0,...relatedSkills(a.id).map(s=>projectPractice(s.id,state)));
 return Number(v.status==='done')*50+Number(v.read)*15+Math.max(Number(v.practiced||!!v.output),project)*25+Number(v.explained)*10;
}
export function learningOverview(state:PersonalState,today=todayISO()){
 const reports=skills.map(s=>({...s,...skillReport(s.id,state)}));
 const weekReports=weeks.map(w=>({number:w.number,title:w.title,month:w.month,completion:progress(w.activities,state),learning:precise(ratio(w.activities.filter(a=>!a.optional),a=>activityLearning(a,state)))}));
 const first=weekReports.findIndex(w=>w.completion<100),index=first<0?25:first;
 const voyage=first<0?100:Math.round((first+Math.max(weekReports[index].completion,weekReports[index].learning)/100)/26*1000)/10;
 const studyDays=Array.from({length:30},(_,i)=>{const date=addDays(today,i-29);return {date,minutes:state.sessions.filter(s=>s.date===date).reduce((n,s)=>n+s.minutes,0)}});
 const tracks=(['backend','ai','systems','project'] as Track[]).map(track=>{const list=activities.filter(a=>a.track===track);return {id:track,completion:progress(list,state),learning:precise(ratio(list,a=>activityLearning(a,state))),skills:reports.filter(s=>s.track===track)}});
 const requiredProjects=projects.filter(p=>p.id!=='cuda-optional');const checks=requiredProjects.reduce((n,p)=>n+p.checklist.length,0),checked=requiredProjects.reduce((n,p)=>n+(state.projects[p.id]?.checks.filter(i=>i<p.checklist.length).length??0),0);
 return {completion:progress(activities,state),learning:precise(ratio(activities,a=>activityLearning(a,state))),currentWeek:weekReports[index].number,currentMonth:weekReports[index].month,voyage,finished:first<0,reports,weeks:weekReports,tracks,studyDays,done:activities.filter(a=>state.activities[a.id]?.status==='done').length,total:activities.length,practiced:reports.filter(s=>s.autoLevel>=2).length,explained:reports.filter(s=>s.autoLevel===3).length,started:reports.filter(s=>s.score>0).length,projectProgress:checks?Math.round(checked/checks*100):0,delivered:requiredProjects.filter(p=>p.checklist.every((_,i)=>state.projects[p.id]?.checks.includes(i))).length,next:activities.find(a=>state.activities[a.id]?.status!=='done'),logbook:state.notes.filter(n=>n.text.trim()).length,reviews:Object.values(state.reviews).filter(r=>Object.values(r).some(v=>v.trim())).length,sources:resources.filter(r=>state.resources[r.id]?.status==='read').length,selfSupported:reports.filter(s=>s.selfLevel>0&&s.selfEvidence.trim()).length};
}

export const projectTrack = (id:string):Track => {
 const linked=skills.filter(s=>projectEvidence[s.id]?.some(p=>p.projectId===id));
 const counts=(["backend","ai","systems"] as const).map(track=>({track,count:linked.filter(s=>s.track===track).length})).sort((a,b)=>b.count-a.count);
 if(id==='cuda-optional')return 'systems';
 return counts[0].count?counts[0].track:"project";
};
