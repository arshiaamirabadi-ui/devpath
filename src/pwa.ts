import {Capacitor} from '@capacitor/core';
export function registerOfflineApp(){
 if(import.meta.env.PROD&&!Capacitor.isNativePlatform()&&'serviceWorker' in navigator){
  window.addEventListener('load',()=>{void navigator.serviceWorker.register(new URL('./sw.js',document.baseURI),{scope:'./'}).catch(error=>console.warn('Offline cache unavailable',error))},{once:true});
 }
}
