export type Language='fa'|'en';
export const LANGUAGE_KEY='devpath.language';
let language:Language='fa';
let english:(text:string)=>string=text=>text;
export const getLanguage=()=>language;
export const numberLocale=()=>language==='en'?'en-US':'fa-IR';
export const dateLocale=numberLocale;
export const applyLocale=(next:Language)=>{language=next};
const digits=(text:string)=>text.replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c<='٩'?0x660:0x6f0))).replace(/٪/g,'%').replace(/،/g,',').replace(/؛/g,';').replace(/؟/g,'?').replace(/٫/g,'.').replace(/٬/g,',');
type Trie={next:Map<string,Trie>;value?:string};
const word=(c:string|undefined)=>!!c&&/[\p{L}\p{N}_]/u.test(c);
export function createTranslator(entries:readonly (readonly [string,string])[]){
 const exact=new Map(entries.map(([source,target])=>[source.trim(),target]));const root:Trie={next:new Map()};
 for(const [key,value]of exact){if(!key)continue;let node=root;for(const char of key){if(!node.next.has(char))node.next.set(char,{next:new Map()});node=node.next.get(char)!}node.value=value}
 return (text:string)=>{
  const trimmed=text.trim(),whole=exact.get(trimmed);
  if(whole!==undefined)return digits(text.slice(0,text.indexOf(trimmed))+whole+text.slice(text.indexOf(trimmed)+trimmed.length));
  let output='';for(let i=0;i<text.length;){let node=root,end=i,bestEnd=i,value:string|undefined;
   while(end<text.length&&node.next.has(text[end])){node=node.next.get(text[end])!;end++;if(node.value!==undefined&&(!word(text[i])||!word(text[i-1]))&&(!word(text[end-1])||!word(text[end]))){bestEnd=end;value=node.value}}
   if(value!==undefined){output+=value;i=bestEnd}else{output+=text[i];i++}
  }return digits(output);
 };
}
let loading:Promise<void>|undefined;
export async function prepareLocale(next:Language,commit=true){
 if(next==='en'){loading??=import('./locales/en/catalogue').then(module=>{english=createTranslator(module.entries)}).catch(error=>{loading=undefined;throw error});await loading}
 if(commit)applyLocale(next);
}
/** Presentation strings only. Never apply to persisted user content or form values. */
export function tx<T>(value:T):T {return (language==='en'&&typeof value==='string'?english(value):value) as T}
export const translate=(text:string)=>tx(text);
export function preferredLanguage():Language {try{return localStorage.getItem(LANGUAGE_KEY)==='en'?'en':'fa'}catch{return 'fa'}}
