import React from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import './style.css';
import './interface.css';
import './workspace.css';
import {StoreProvider} from './store';
import {LanguageProvider} from './LanguageProvider';
import {prepareLocale,preferredLanguage} from './locale';
import './language.css';
import './sidebar.css';
import './identity.css';
import './mobile-experience.css';
import './learning-calendar.css';
import './tablet.css';
import App from './App';
import {initializeNative} from './native';
import {registerOfflineApp} from './pwa';
registerOfflineApp();
async function start(){
 void initializeNative().catch(error=>console.warn("Native integration unavailable",error));
 try{await prepareLocale(preferredLanguage())}catch{await prepareLocale('fa')}
 createRoot(document.getElementById('root')!).render(<React.StrictMode><LanguageProvider><StoreProvider><App/></StoreProvider></LanguageProvider></React.StrictMode>);
}
void start();
