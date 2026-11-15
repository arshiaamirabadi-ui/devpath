import {Capacitor} from '@capacitor/core';
import {todayISO,type PersonalState} from './logic';
export async function saveBackup(state:PersonalState){
 const name='devpath-backup-'+todayISO()+'.json',data=JSON.stringify(state,null,2);
 if(Capacitor.isNativePlatform()){
  const [{Filesystem,Directory,Encoding},{Share}]=await Promise.all([import('@capacitor/filesystem'),import('@capacitor/share')]);
  const file=await Filesystem.writeFile({path:'backups/'+name,directory:Directory.Cache,data,encoding:Encoding.UTF8,recursive:true});
  await Share.share({title:'DevPath',files:[file.uri],dialogTitle:'DevPath backup'});return;
 }
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
