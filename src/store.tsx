import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {KEY,freshState,parseBackup,type PersonalState} from './logic';
type Store={state:PersonalState;update:(f:(s:PersonalState)=>PersonalState)=>boolean;replace:(s:PersonalState)=>boolean;error:string;clearError:()=>void};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}){
 const [initial]=useState(()=>{try {const saved=localStorage.getItem(KEY);return {data:saved?parseBackup(saved):freshState(),error:''}}catch{return {data:freshState(),error:'داده ذخیره‌شده خوانده نشد. برای جلوگیری از حذف، تا خروجی گرفتن یا بازیابی، تغییری ذخیره نکنید.'}}});
 const [state,setState]=useState(initial.data),[error,setError]=useState(initial.error);
 useEffect(()=>{document.documentElement.dataset.theme=state.settings.theme},[state.settings.theme]);
 useEffect(()=>{const handler=(e:StorageEvent)=>{if(e.key===KEY&&e.newValue){try{setState(parseBackup(e.newValue));setError('تغییرهای زبانه دیگر دریافت شد.')}catch{setError('داده زبانه دیگر معتبر نیست.')}}};window.addEventListener('storage',handler);return()=>window.removeEventListener('storage',handler)},[]);
 const replace=(next:PersonalState)=>{try{localStorage.setItem(KEY,JSON.stringify(next));setState(next);setError('');return true}catch{setError('ذخیره نشد؛ حافظه مرورگر در دسترس نیست یا پر شده است. از داده فعلی خروجی بگیرید.');return false}};
 const update=(f:(s:PersonalState)=>PersonalState)=>{try{const latest=localStorage.getItem(KEY);return replace(f(latest?parseBackup(latest):state))}catch{setError('داده فعلی مرورگر معتبر نیست. ابتدا خروجی یا بازیابی را انجام دهید.');return false}};
 return <Context.Provider value={{state,update,replace,error,clearError:()=>setError('')}}>{children}</Context.Provider>;
}
export function useStore(){const s=useContext(Context);if(!s)throw new Error('Store missing');return s}
