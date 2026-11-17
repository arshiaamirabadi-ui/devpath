import {describe,it,expect} from 'vitest';
import {freshState} from './logic';
import {createWorkspace,editWorkspace,receiveRecords,resolveConflict,workspaceState,flattenState,parseWorkspace,acknowledge} from './sync-model';

const note=(text:string)=>({id:'n',target:'general',text,updatedAt:'2026-11-17T10:00:00Z'});
describe('account record sync',()=>{
 it('round trips every personal field and ids containing slashes',()=>{
  const state=freshState();state.notes=[{...note('hello'),id:'a/b~c'}];state.sessions=[{id:'s',activityId:'a',date:'2026-11-17',minutes:10}];state.activities.a={status:'done',read:true,practiced:false,explained:false,output:''};
  expect(workspaceState(receiveRecords(createWorkspace(state),flattenState(state)))).toEqual(state);
 });
 it('merges independent remote edits while preserving durable offline edits',()=>{
  const initial=freshState(), local={...initial,notes:[note('offline')]};
  let w=editWorkspace(createWorkspace(initial),local);
  const remote={...initial,lastActivity:'remote'};w=receiveRecords(parseWorkspace(JSON.stringify(w)),flattenState(remote));
  expect(workspaceState(w).notes).toEqual(local.notes);expect(workspaceState(w).lastActivity).toBe('remote');expect(Object.keys(w.pending)).toHaveLength(1);
 });
 it('preserves both versions on simultaneous record edits and resolves explicitly',()=>{
  const initial={...freshState(),notes:[note('base')]};let w=receiveRecords(createWorkspace(initial),flattenState(initial));
  w=editWorkspace(w,{...initial,notes:[note('local')]});w=receiveRecords(w,flattenState({...initial,notes:[note('remote')]}));
  const key=Object.keys(w.conflicts)[0];expect(key).toBeTruthy();expect(workspaceState(w).notes[0].text).toBe('local');expect(JSON.parse(w.conflicts[key]!).text).toBe('remote');
  expect(workspaceState(resolveConflict(w,key,'remote')).notes[0].text).toBe('remote');
  const kept=resolveConflict(w,key,'local');expect(kept.pending[key].base).toBe(w.conflicts[key]);expect(Object.keys(kept.conflicts)).toHaveLength(0);
 });
 it('propagates deletion and never resurrects it from an offline device',()=>{
  const initial={...freshState(),notes:[note('base')]};let w=receiveRecords(createWorkspace(initial),flattenState(initial));
  w=editWorkspace(w,{...initial,notes:[]});const key=Object.keys(w.pending)[0];expect(w.pending[key].value).toBeNull();
  const removed={...flattenState(initial),[key]:null};expect(workspaceState(receiveRecords(w,removed)).notes).toEqual([]);
  let offline=editWorkspace(receiveRecords(createWorkspace(initial),flattenState(initial)),{...initial,notes:[note('offline')]});offline=receiveRecords(offline,removed);expect(offline.conflicts[key]).toBeNull();
 });
 it('retains an edit made while an older upload is acknowledged',()=>{
  const initial=freshState();let w=editWorkspace(createWorkspace(initial),{...initial,lastActivity:'one'});const [key,sent]=Object.entries(w.pending)[0];
  w=editWorkspace(w,{...workspaceState(w),lastActivity:'two'});w=acknowledge(w,key,sent);
  expect(workspaceState(w).lastActivity).toBe('two');expect(w.pending[key]).toEqual({base:sent.value,value:JSON.stringify('two')});
 });
 it('rejects invalid remote data and corrupt persisted queues',()=>{
  const w=createWorkspace(freshState());expect(()=>receiveRecords(w,{'settings~weeklyHours':'999'})).toThrow();expect(()=>receiveRecords(w,{'notes~__proto__':'{}'})).toThrow();expect(()=>parseWorkspace('{"version":1}')).toThrow();
 });
 it('preserves a revert made while a previous value is still uploading',()=>{
  const initial=freshState();let w=editWorkspace(receiveRecords(createWorkspace(initial),flattenState(initial)),{...initial,lastActivity:'uploading'});const [key,sent]=Object.entries(w.pending)[0];
  w=editWorkspace(w,initial);w=receiveRecords(w,flattenState(initial));w=acknowledge(w,key,sent);
  expect(workspaceState(w).lastActivity).toBe('');expect(w.pending[key].value).toBe(JSON.stringify(''));
 });
 it('does not upload incoming records again, or persist transient conflicts incorrectly',()=>{
  const state={...freshState(),notes:[note('server')]};const w=receiveRecords(createWorkspace(freshState()),flattenState(state));expect(w.pending).toEqual({});expect(parseWorkspace(JSON.stringify(w))).toEqual(w);
 });
});
