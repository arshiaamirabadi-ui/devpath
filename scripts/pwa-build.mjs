import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
export function offlineBundle(mode){return {name:'devpath-offline-bundle',transformIndexHtml(html){return mode==='android'?html.replace('viewport-fit=cover','viewport-fit=contain'):html},closeBundle(){
 if(mode==='android')return;
 const root='dist';const walk=path=>readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(path,entry.name)):[join(path,entry.name)]);
 const files=walk(root).filter(p=>!p.endsWith('sw.js')&&!p.endsWith('.map')),hash=createHash('sha256');for(const file of files)hash.update(readFileSync(file));const version=hash.digest('hex').slice(0,16);
 const urls=files.map(p=>'./'+relative(root,p).replaceAll('\\','/'));
 const source=`const CACHE='devpath-${version}',FILES=${JSON.stringify(urls)};
const asset=name=>new URL(name,self.registration.scope).href;
async function precache(){const cache=await caches.open(CACHE);let next=0;async function worker(){while(next<FILES.length){const url=asset(FILES[next++]);for(let attempt=0;;attempt++){try{await cache.add(url);break}catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)))}}}}await Promise.all(Array.from({length:4},worker));}
self.addEventListener('install',event=>event.waitUntil(precache()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('devpath-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==='navigate'){event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match(asset('index.html'),{ignoreVary:true}))));return;}
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(request,{ignoreVary:true})).then(cached=>cached||fetch(request)));
});
`;
 writeFileSync(join(root,'sw.js'),source);
}}}
