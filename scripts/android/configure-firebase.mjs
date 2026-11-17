import {existsSync,readFileSync,writeFileSync} from 'node:fs';
// The native plugin initializes Firebase on launch. Keep email sign-in and guest
// builds working before a real Android app registration has been supplied.
const pluginsPath=new URL('../../android/app/src/main/assets/capacitor.plugins.json',import.meta.url);
const servicesPath=new URL('../../android/app/google-services.json',import.meta.url);
if(!existsSync(servicesPath)){
 const plugins=JSON.parse(readFileSync(pluginsPath,'utf8'));
 writeFileSync(pluginsPath,JSON.stringify(plugins.filter(plugin=>plugin.pkg!=='@capacitor-firebase/authentication'),null,2));
 console.log('Native Google sign-in is disabled until android/app/google-services.json is configured. Email sign-in and guest mode remain available.');
}
