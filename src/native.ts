import {Capacitor} from '@capacitor/core';
import {nativeBackAction} from './native-back';
export async function initializeNative(){
 if(!Capacitor.isNativePlatform())return;
 const {App}=await import('@capacitor/app');
 await App.addListener('backButton',({canGoBack})=>{
  const overlay=document.querySelector<HTMLButtonElement>('.sidebar.is-open .mobile-close')??document.querySelector<HTMLButtonElement>('.trail-peek-top button');
  switch(nativeBackAction(location.hash,canGoBack,!!overlay)){
   case 'close-overlay':overlay?.click();break;
   case 'back':history.back();break;
   case 'home':location.hash='/';break;
   case 'minimize':void App.minimizeApp();break;
  }
 });
 await App.addListener('appStateChange',({isActive})=>{if(isActive)window.dispatchEvent(new Event('focus'))});
}
