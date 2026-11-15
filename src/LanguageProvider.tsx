import {createContext,useContext,useEffect,useLayoutEffect,useState,useRef,type ReactNode} from 'react';
import {applyLocale,getLanguage,prepareLocale,LANGUAGE_KEY,type Language} from './locale';
type LanguageContext={language:Language;loading:boolean;changeLanguage:(next:Language)=>Promise<void>};
const Context=createContext<LanguageContext|null>(null);
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState(getLanguage),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false);
 const request=useRef(0);
 const select=async(next:Language,persist:boolean)=>{const id=++request.current;setLoading(true);setFailed(false);try{await prepareLocale(next,false);if(id!==request.current)return;applyLocale(next);setLanguage(next);if(persist){try{localStorage.setItem(LANGUAGE_KEY,next)}catch{/* The current tab can still change language. */}}}catch{if(id===request.current)setFailed(true)}finally{if(id===request.current)setLoading(false)}};
 useLayoutEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';document.title=language==='en'?'DevPath | My learning journey':'DevPath | مسیر یادگیری من'},[language]);
 useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key===LANGUAGE_KEY)void select(event.newValue==='en'?'en':'fa',false)};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 return <Context.Provider value={{language,loading,changeLanguage:next=>select(next,true)}}>{children}{failed&&<div role="alert" className="language-error">{language==='en'?'Language could not be loaded. Please try again.':'زبان بارگذاری نشد. دوباره تلاش کن.'}</div>}</Context.Provider>;
}
export function useLanguage(){const value=useContext(Context);if(!value)throw new Error('Language provider missing');return value}
