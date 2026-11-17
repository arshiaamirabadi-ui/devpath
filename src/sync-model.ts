import {z} from 'zod';
import {freshState,parseBackup,stateSchema,type PersonalState} from './logic';

export type Records=Record<string,string|null>;
export type Change={base:string|null;value:string|null};
export type Workspace={version:1;defaults:PersonalState;remote:Records;pending:Record<string,Change>;conflicts:Records;lastSynced:string|null};
const maps=['activities','reviews','resources','skills','projects','planned'] as const;
const arrays=['notes','sessions'] as const;
const settings=['startDate','weeklyHours','days','theme'] as const;
const safeId=(id:string)=>id.length>0&&id.length<=150&&!['__proto__','constructor','prototype'].includes(id);
export function recordParts(key:string):[string,string]{
 const split=key.indexOf('~'),section=key.slice(0,split),id=decodeURIComponent(key.slice(split+1));
 if(split<1||!safeId(id)||key!==`${section}~${encodeURIComponent(id)}`||!([...maps,...arrays,'settings','lastActivity'] as string[]).includes(section)||section==='settings'&&!(settings as readonly string[]).includes(id)||section==='lastActivity'&&id!=='value')throw new Error('Invalid sync record key');
 return [section,id];
}
export function flattenState(state:PersonalState):Records{
 stateSchema.parse(state);const result:Records={};const add=(section:string,id:string,value:unknown)=>{const key=`${section}~${encodeURIComponent(id)}`;recordParts(key);const raw=JSON.stringify(value);if(new TextEncoder().encode(raw).length>100000)throw new Error('Sync record too large');result[key]=raw};
 for(const field of settings)add('settings',field,state.settings[field]);
 add('lastActivity','value',state.lastActivity);
 for(const section of maps)for(const [id,value]of Object.entries(state[section]))add(section,id,value);
 for(const section of arrays)for(const value of state[section])add(section,value.id,value);
 return result;
}
export function materialize(defaults:PersonalState,records:Records):PersonalState{
 const state=freshState();state.settings={...defaults.settings};state.lastActivity=defaults.lastActivity;
 for(const [key,raw]of Object.entries(records)){
  const [section,id]=recordParts(key);if(raw===null)continue;
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>100000)throw new Error('Invalid sync record');
  const value=JSON.parse(raw);
  if(section==='settings')(state.settings as Record<string,unknown>)[id]=value;
  else if(section==='lastActivity')state.lastActivity=value;
  else if(section==='notes'||section==='sessions'){if(value?.id!==id)throw new Error('Record id mismatch');(state[section] as unknown[]).push(value)}
  else (state[section as typeof maps[number]] as Record<string,unknown>)[id]=value;
 }
 return parseBackup(JSON.stringify(state));
}
export function createWorkspace(defaults=freshState()):Workspace{return {version:1,defaults,remote:{},pending:{},conflicts:{},lastSynced:null}}
export function workspaceState(w:Workspace):PersonalState{return materialize(w.defaults,{...w.remote,...Object.fromEntries(Object.entries(w.pending).map(([key,p])=>[key,p.value]))})}
export function editWorkspace(w:Workspace,next:PersonalState):Workspace{
 const before=flattenState(workspaceState(w)),after=flattenState(next),pending={...w.pending},conflicts={...w.conflicts};
 for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
  const value=after[key]??null;if(value===(before[key]??null))continue;
  const base=pending[key]?pending[key].base:w.remote[key]??null;
  if(value===(w.remote[key]??null)&&!pending[key]){delete pending[key];delete conflicts[key]}else pending[key]={base,value};
 }
 return {...w,pending,conflicts};
}
export function receiveRecords(w:Workspace,remote:Records):Workspace{
 materialize(w.defaults,remote);const pending={...w.pending},conflicts:Records={};
 for(const [key,p]of Object.entries(pending)){
  const value=remote[key]??null;
  if(value===p.value&&p.value!==p.base)delete pending[key];else if(value!==p.base&&value!==p.value)conflicts[key]=value;
 }
 const result={...w,remote,pending,conflicts};workspaceState(result);return result;
}
export function acknowledge(w:Workspace,key:string,sent:Change):Workspace{
 const current=w.pending[key],pending={...w.pending},conflicts={...w.conflicts};
 if(current){if(current.value===sent.value)delete pending[key];else pending[key]={...current,base:sent.value}}
 delete conflicts[key];const remote=w.remote[key]??null;
 return receiveRecords({...w,pending,conflicts},{...w.remote,[key]:remote!==sent.base&&remote!==sent.value?remote:sent.value});
}
export function resolveConflict(w:Workspace,key:string,choice:'local'|'remote'):Workspace{
 if(!Object.hasOwn(w.conflicts,key))return w;
 const pending={...w.pending},conflicts={...w.conflicts};
 if(choice==='remote')delete pending[key];else pending[key]={...pending[key],base:w.remote[key]??null};
 delete conflicts[key];const next={...w,pending,conflicts};workspaceState(next);return next;
}
const records=z.record(z.string(),z.string().nullable());
const schema=z.object({version:z.literal(1),defaults:stateSchema,remote:records,pending:z.record(z.string(),z.object({base:z.string().nullable(),value:z.string().nullable()}).strict()),conflicts:records,lastSynced:z.string().datetime().nullable()}).strict();
export function parseWorkspace(raw:string):Workspace{
 const w=schema.parse(JSON.parse(raw));materialize(w.defaults,w.remote);
 for(const [key,p]of Object.entries(w.pending)){recordParts(key);for(const value of [p.base,p.value])materialize(w.defaults,{[key]:value})}
 const checked=receiveRecords(w,w.remote);workspaceState(checked);return checked;
}
