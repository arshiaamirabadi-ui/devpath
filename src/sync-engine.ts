import {KEY,freshState,parseBackup,type PersonalState} from './logic';
import {acknowledge,createWorkspace,editWorkspace,flattenState,parseWorkspace,receiveRecords,resolveConflict,workspaceState,type Workspace,type Records,type Change} from './sync-model';

export type CloudPort={listen:(uid:string,next:(records:Records)=>void,error:(error:unknown)=>void)=>()=>void;commit:(uid:string,key:string,change:Change)=>Promise<{written:boolean;value:string|null}>};
type StoragePort={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export const accountKey=(uid:string)=>`${KEY}.account.${encodeURIComponent(uid)}`;
export type SyncSnapshot={uid:string|null;state:PersonalState;pending:number;conflicts:Records;ready:boolean;syncing:boolean;lastSynced:string|null;error:string;locked:boolean};
export class SyncEngine{
 private workspace=createWorkspace();private cloud:CloudPort|null=null;private stop?:()=>void;private generation=0;private pumping:Promise<void>|null=null;private listeners=new Set<()=>void>();
 snapshot:SyncSnapshot={uid:null,state:freshState(),pending:0,conflicts:{},ready:false,syncing:false,lastSynced:null,error:'',locked:false};
 constructor(private storage:StoragePort){this.activate(null)}
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
 private publish(values:Partial<SyncSnapshot>={}){this.snapshot={...this.snapshot,...values};for(const listener of this.listeners)listener()}
 private fail(){this.publish({error:'اطلاعات خوانده یا ذخیره نشد. از داده‌ها پشتیبان بگیر؛ ذخیره‌سازی دستگاه را بررسی کن.',locked:true,ready:false})}
 private read(){const raw=this.storage.getItem(this.snapshot.uid?accountKey(this.snapshot.uid):KEY);return this.snapshot.uid?(raw?parseWorkspace(raw):this.workspace):(raw?parseBackup(raw):this.snapshot.state)}
 private save(w:Workspace){const state=workspaceState(w);this.storage.setItem(accountKey(this.snapshot.uid!),JSON.stringify(w));this.workspace=w;this.publish({state,pending:Object.keys(w.pending).length,conflicts:w.conflicts,lastSynced:w.lastSynced,error:'',locked:false})}
 activate(uid:string|null){
  this.stop?.();this.stop=undefined;this.generation++;this.pumping=null;this.workspace=createWorkspace();
  this.publish({uid,state:freshState(),pending:0,conflicts:{},ready:false,syncing:false,lastSynced:null,error:'',locked:false});
  try{const data=this.read();if(uid){this.workspace=data as Workspace;this.publish({state:workspaceState(this.workspace),pending:Object.keys(this.workspace.pending).length,conflicts:this.workspace.conflicts,lastSynced:this.workspace.lastSynced})}else this.publish({state:data as PersonalState})}catch{this.fail()}
  this.startListening();
 }
 connect(cloud:CloudPort){this.cloud=cloud;this.startListening()}
 disconnect(){this.stop?.();this.stop=undefined;this.generation++;this.pumping=null;this.cloud=null;this.publish({ready:false,syncing:false})}
 private startListening(){
  this.stop?.();this.stop=undefined;const uid=this.snapshot.uid,generation=this.generation;if(!uid||!this.cloud||this.snapshot.locked)return;
  this.stop=this.cloud.listen(uid,records=>{
   if(generation!==this.generation)return;
   try{
    let latest=this.read() as Workspace;
    if(Object.keys(records).length===0){const seed=Object.fromEntries(Object.entries(flattenState(latest.defaults)).map(([key,value])=>[key,{base:null,value}]));latest={...latest,pending:{...seed,...latest.pending}}}
    this.save(receiveRecords(latest,records));this.publish({ready:true});void this.flush();
   }catch{this.fail()}
  },()=>{if(generation===this.generation)this.publish({ready:false,error:'ارتباط با فضای ابری برقرار نشد. اینترنت و تنظیمات Firebase را بررسی کن.'})});
 }
 reload(){if(this.snapshot.locked)return;try{if(this.snapshot.uid){this.workspace=this.read() as Workspace;this.publish({state:workspaceState(this.workspace),pending:Object.keys(this.workspace.pending).length,conflicts:this.workspace.conflicts,lastSynced:this.workspace.lastSynced})}else this.publish({state:this.read() as PersonalState});void this.flush()}catch{this.fail()}}
 replace(next:PersonalState):boolean{
  if(this.snapshot.locked)return false;
  try{const valid=parseBackup(JSON.stringify(next));if(this.snapshot.uid)this.save(editWorkspace(this.read() as Workspace,valid));else{this.storage.setItem(KEY,JSON.stringify(valid));this.publish({state:valid,error:''})}void this.flush();return true}catch{this.fail();return false}
 }
 update(f:(state:PersonalState)=>PersonalState):boolean{if(this.snapshot.locked)return false;this.reload();if(this.snapshot.locked)return false;try{return this.replace(f(this.snapshot.state))}catch{this.fail();return false}}
 clearError(){if(!this.snapshot.locked)this.publish({error:''})}
 guest():PersonalState{const raw=this.storage.getItem(KEY);return raw?parseBackup(raw):freshState()}
 importGuest():boolean{
  if(!this.snapshot.uid||!this.snapshot.ready)return false;
  try{
   const guest=this.guest(),current=this.snapshot.state,next={...current,settings:guest.settings,lastActivity:guest.lastActivity};
   for(const section of ['activities','reviews','resources','skills','projects','planned'] as const)(next[section] as Record<string,unknown>)={...current[section],...guest[section]};
   next.notes=[...new Map([...current.notes,...guest.notes].map(value=>[value.id,value])).values()];next.sessions=[...new Map([...current.sessions,...guest.sessions].map(value=>[value.id,value])).values()];
   return this.replace(next);
  }catch{this.publish({error:'داده مهمان معتبر نیست؛ انتقال انجام نشد.'});return false}
 }
 resolve(key:string,choice:'local'|'remote'){if(this.snapshot.locked)return;try{this.save(resolveConflict(this.read() as Workspace,key,choice));void this.flush()}catch{this.fail()}}
 retry(){if(this.snapshot.locked)return;this.startListening();void this.flush()}
 flush():Promise<void>{
  if(this.pumping)return this.pumping;
  const {uid,ready,locked}=this.snapshot,cloud=this.cloud,generation=this.generation;if(!uid||!cloud||!ready||locked)return Promise.resolve();
  // Defer work one microtask so the in-flight promise exists before any observer runs.
  const run=Promise.resolve().then(async()=>{
   if(generation!==this.generation)return;
   this.publish({syncing:true});
   try{
    while(generation===this.generation&&!this.snapshot.locked){
     const latest=this.read() as Workspace;const entry=Object.entries(latest.pending).find(([key])=>!Object.hasOwn(latest.conflicts,key));if(!entry)break;
     const [key,change]=entry,result=await cloud.commit(uid,key,change);if(generation!==this.generation)return;
     const current=this.read() as Workspace;
     this.save(result.written?acknowledge(current,key,change):receiveRecords(current,{...current.remote,[key]:result.value}));
    }
    if(generation===this.generation){const current=this.read() as Workspace;if(!Object.keys(current.pending).length)this.save({...current,lastSynced:new Date().toISOString()})}
   }catch{if(generation===this.generation)this.publish({error:'سینک انجام نشد؛ تغییرات روی این دستگاه محفوظ‌اند. دوباره تلاش کن.'})}
   finally{if(generation===this.generation){this.pumping=null;this.publish({syncing:false})}}
  });this.pumping=run;return run;
 }
}
