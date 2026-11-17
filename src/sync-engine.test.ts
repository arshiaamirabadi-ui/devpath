import {it,expect,vi} from 'vitest';
import {KEY,freshState} from './logic';
import {SyncEngine,accountKey,type CloudPort} from './sync-engine';
import {flattenState,type Records} from './sync-model';
function setup(){const data=new Map<string,string>();const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v)}};return {data,storage,engine:new SyncEngine(storage)}}
function cloud(){let receive:(r:Records)=>void=()=>{};const port:CloudPort={listen:vi.fn((_uid,next)=>{receive=next;return()=>{}}),commit:vi.fn(async(_uid,_key,p)=>({value:p.value,written:true}))};return {port,receive:(r:Records)=>receive(r)}}
it('keeps guest data and account caches isolated, including switching back',()=>{
 const {engine,data}=setup();engine.replace({...freshState(),lastActivity:'guest'});engine.activate('alice');expect(engine.snapshot.state.lastActivity).toBe('');engine.replace({...freshState(),lastActivity:'alice'});engine.activate('bob');expect(engine.snapshot.state.lastActivity).toBe('');engine.activate('alice');expect(engine.snapshot.state.lastActivity).toBe('alice');engine.activate(null);expect(engine.snapshot.state.lastActivity).toBe('guest');expect(JSON.parse(data.get(KEY)!).lastActivity).toBe('guest');
});
it('persists offline edits through restart and uploads after a server snapshot',async()=>{
 const {engine,storage}=setup(),c=cloud();engine.activate('alice');engine.replace({...freshState(),lastActivity:'offline'});const restarted=new SyncEngine(storage);restarted.activate('alice');restarted.connect(c.port);expect(restarted.snapshot.state.lastActivity).toBe('offline');c.receive({});await restarted.flush();expect(c.port.commit).toHaveBeenCalled();expect(restarted.snapshot.pending).toBe(0);
});
it('ignores completion from the previous account after sign out',async()=>{
 const {engine}=setup(),c=cloud();let finish!:(r:{value:string|null;written:boolean})=>void;c.port.commit=()=>new Promise(resolve=>{finish=resolve});engine.activate('alice');engine.connect(c.port);c.receive({});engine.replace({...freshState(),lastActivity:'private'});const flushing=engine.flush();await Promise.resolve();engine.activate(null);finish({value:JSON.stringify('private'),written:true});await flushing;expect(engine.snapshot.uid).toBeNull();expect(engine.snapshot.state.lastActivity).toBe('');
});
it('surfaces server rejection and keeps pending changes',async()=>{
 const {engine}=setup(),c=cloud();engine.activate('alice');engine.connect(c.port);c.receive({});c.port.commit=vi.fn(async()=>{throw Error('permission-denied')});engine.replace({...freshState(),lastActivity:'unsent'});await engine.flush();expect(engine.snapshot.pending).toBeGreaterThan(0);expect(engine.snapshot.state.lastActivity).toBe('unsent');expect(engine.snapshot.error).toBeTruthy();
});
it('preserves invalid saved data and blocks writes rather than replacing it',()=>{
 const {data,storage}=setup();data.set(accountKey('alice'),'broken');const engine=new SyncEngine(storage);engine.activate('alice');expect(engine.replace(freshState())).toBe(false);expect(data.get(accountKey('alice'))).toBe('broken');expect(engine.snapshot.error).toBeTruthy();
});
it('previews guest import without uploading and imports without deleting cloud-only records',async()=>{
 const {engine}=setup(),c=cloud();const guest=freshState();guest.notes=[{id:'guest',target:'general',text:'guest note',updatedAt:'2026-11-17T10:00:00Z'}];engine.replace(guest);engine.activate('alice');engine.connect(c.port);const remote=freshState();remote.notes=[{id:'cloud',target:'general',text:'cloud note',updatedAt:'2026-11-17T10:00:00Z'}];c.receive(flattenState(remote));expect(engine.guest().notes).toHaveLength(1);expect(engine.snapshot.state.notes).toHaveLength(1);expect(engine.importGuest()).toBe(true);expect(engine.snapshot.state.notes).toHaveLength(2);await engine.flush();
});
it('never acknowledges cloud data when local persistence fails',()=>{
 const {storage,engine}=setup(),c=cloud();engine.activate('alice');engine.connect(c.port);storage.setItem=()=>{throw Error('quota')};c.receive(flattenState({...freshState(),lastActivity:'remote'}));expect(engine.snapshot.error).toBeTruthy();expect(engine.snapshot.ready).toBe(false);
});
