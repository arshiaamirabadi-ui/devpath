import {createContext,Fragment,useContext,useEffect,useState,useSyncExternalStore,type ReactNode} from 'react';
import {KEY,type PersonalState} from './logic';
import {stampCompletions} from './streak-model';
import {SyncEngine,accountKey,type SyncSnapshot} from './sync-engine';
import {firebaseConfigured} from './firebase-config';

type Account={uid:string;email:string|null;displayName:string|null};
type AuthState={user:Account|null;loading:boolean;busy:boolean;error:string};
type Store={state:PersonalState;update:(f:(s:PersonalState)=>PersonalState)=>boolean;replace:(s:PersonalState)=>boolean;error:string;clearError:()=>void;sync:SyncSnapshot;account:AuthState;configured:boolean;login:()=>Promise<void>;emailAuth:(mode:'signIn'|'signUp'|'reset',email:string,password:string)=>Promise<boolean>;logout:()=>Promise<void>;retry:()=>void;resolve:SyncEngine['resolve'];guest:()=>PersonalState;importGuest:()=>boolean};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}){
 const [engine]=useState(()=>new SyncEngine({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)}));
 const sync=useSyncExternalStore(engine.subscribe,()=>engine.snapshot);
 const [account,setAccount]=useState<AuthState>({user:null,loading:firebaseConfigured,busy:false,error:''});
 const [client,setClient]=useState<typeof import('./firebase-client')|null>(null);
 useEffect(()=>{
  if(!firebaseConfigured)return;let active=true,unsubscribe:undefined|(()=>void);
  import('./firebase-client').then(module=>{
   if(!active)return;setClient(module);engine.connect(module.cloud);
   unsubscribe=module.observeAccount(user=>{
    if(!active)return;if(engine.snapshot.uid!==(user?.uid??null))engine.activate(user?.uid??null);
    setAccount(previous=>({...previous,user:user?{uid:user.uid,email:user.email,displayName:user.displayName}:null,loading:false,error:''}));
   },()=>{if(active)setAccount(previous=>({...previous,loading:false,error:'وضعیت ورود دریافت نشد. اتصال اینترنت را بررسی و صفحه را دوباره باز کن.'}))});
  }).catch(()=>{if(active)setAccount(previous=>({...previous,loading:false,error:'راه‌اندازی Firebase انجام نشد. تنظیمات پروژه را بررسی کن.'}))});
  return()=>{active=false;unsubscribe?.();engine.disconnect()};
 },[engine]);
 useEffect(()=>{document.documentElement.dataset.theme=sync.state.settings.theme;document.querySelector('meta[name=theme-color]')?.setAttribute('content',sync.state.settings.theme==='light'?'#f5f3fa':'#111116')},[sync.state.settings.theme]);
 useEffect(()=>{
  const storage=(event:StorageEvent)=>{if(event.key===(engine.snapshot.uid?accountKey(engine.snapshot.uid):KEY)||event.key===null)engine.reload()};
  const resume=()=>engine.retry();const interval=window.setInterval(()=>{void engine.flush()},30000);
  window.addEventListener('storage',storage);window.addEventListener('online',resume);window.addEventListener('focus',resume);
  return()=>{clearInterval(interval);window.removeEventListener('storage',storage);window.removeEventListener('online',resume);window.removeEventListener('focus',resume)};
 },[engine]);
 const login=async()=>{
  if(!client||account.loading||account.busy)return;setAccount(previous=>({...previous,busy:true,error:''}));
  try{await client.login()}catch(err){const code=err&&typeof err==='object'&&'code'in err?String(err.code):'';setAccount(previous=>({...previous,error:code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request'?'ورود لغو شد. داده‌های دستگاه محفوظ‌اند.':'ورود انجام نشد. اینترنت، پنجره ورود و تنظیمات Google در Firebase را بررسی کن.'}))}finally{setAccount(previous=>({...previous,busy:false}))}
 };
 const emailAuth=async(mode:'signIn'|'signUp'|'reset',email:string,password:string)=>{
  if(!client||account.loading||account.busy)return false;setAccount(previous=>({...previous,busy:true,error:''}));
  try{await client.emailAuthentication(mode,email,password);return true}catch(err){
   const code=err&&typeof err==='object'&&'code'in err?String(err.code):'';
   const message=code==='auth/weak-password'||code==='auth/password-does-not-meet-requirements'?'رمز عبور با شرایط امنیتی پروژه سازگار نیست.':code==='auth/email-already-in-use'?'این ایمیل قبلاً ثبت شده؛ وارد شو یا رمز عبور را بازیابی کن.':code==='auth/operation-not-allowed'?'ورود ایمیل و رمز عبور باید در Firebase فعال شود.':code==='auth/too-many-requests'?'تلاش‌های زیادی انجام شده؛ کمی بعد دوباره امتحان کن.':code==='auth/network-request-failed'?'اتصال اینترنت برقرار نشد؛ دوباره تلاش کن.':'ورود یا ساخت حساب انجام نشد. ایمیل و رمز عبور را بررسی کن.';
   setAccount(previous=>({...previous,error:message}));return false;
  }finally{setAccount(previous=>({...previous,busy:false}))}
 };
 const logout=async()=>{
  if(!client||account.busy)return;setAccount(previous=>({...previous,busy:true,error:''}));
  try{await client.logout()}catch{setAccount(previous=>({...previous,error:'خروج کامل نشد. دوباره تلاش کن.'}))}finally{setAccount(previous=>({...previous,busy:false}))}
 };
 return <Context.Provider value={{state:sync.state,update:f=>engine.update(previous=>stampCompletions(previous,f(previous))),replace:next=>engine.replace(next),error:sync.error,clearError:()=>engine.clearError(),sync,account,configured:firebaseConfigured,login,emailAuth,logout,retry:()=>engine.retry(),resolve:(key,choice)=>engine.resolve(key,choice),guest:()=>engine.guest(),importGuest:()=>engine.importGuest()}}><Fragment key={sync.uid??'guest'}>{children}</Fragment></Context.Provider>;
}
export function useStore(){const store=useContext(Context);if(!store)throw new Error('Store missing');return store}
