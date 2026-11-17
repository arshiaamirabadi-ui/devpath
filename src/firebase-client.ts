import {initializeApp,getApps} from 'firebase/app';
import {getAuth,initializeAuth,indexedDBLocalPersistence,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signInWithCredential,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,connectAuthEmulator,type User} from 'firebase/auth';
import {collection,doc,getFirestore,onSnapshot,runTransaction,connectFirestoreEmulator} from 'firebase/firestore';
import {Capacitor} from '@capacitor/core';
import {firebaseConfig} from './firebase-config';
import {recordParts,type Records} from './sync-model';
import type {CloudPort} from './sync-engine';

const app=getApps()[0]??initializeApp(firebaseConfig),auth=Capacitor.isNativePlatform()?initializeAuth(app,{persistence:indexedDBLocalPersistence}):getAuth(app),db=getFirestore(app);
if(import.meta.env.DEV&&import.meta.env.VITE_FIREBASE_USE_EMULATORS==='true'){
 if(!firebaseConfig.projectId.startsWith('demo-'))throw new Error('Emulators require a demo project id');
 connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);
}
function recordValue(data:unknown):string|null{
 if(!data||typeof data!=='object'||Object.keys(data).length!==1||!('value'in data)||(data.value!==null&&typeof data.value!=='string'))throw new Error('Invalid cloud record');
 return data.value as string|null;
}
export const cloud:CloudPort={
 listen(uid,next,error){return onSnapshot(collection(db,'users',uid,'records'),{includeMetadataChanges:true},snapshot=>{
  // Memory-cache snapshots and local speculative writes are not server acknowledgements.
  if(snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites)return;
  try{const records:Records={};for(const row of snapshot.docs){recordParts(row.id);records[row.id]=recordValue(row.data())}next(records)}catch(err){error(err)}
 },error)},
 async commit(uid,key,change){
  if(auth.currentUser?.uid!==uid)throw new Error('Account changed');
  const ref=doc(db,'users',uid,'records',key);
  return runTransaction(db,async transaction=>{
   if(auth.currentUser?.uid!==uid)throw new Error('Account changed');
   const snapshot=await transaction.get(ref),value=snapshot.exists()?recordValue(snapshot.data()):null;
   if(auth.currentUser?.uid!==uid)throw new Error('Account changed');
   if(value===change.value)return {written:true,value};
   if(value!==change.base)return {written:false,value};
   transaction.set(ref,{value:change.value});return {written:true,value:change.value};
  });
 }
};
export function observeAccount(next:(user:User|null)=>void,error:()=>void){return onAuthStateChanged(auth,next,error)}
export async function emailAuthentication(mode:'signIn'|'signUp'|'reset',email:string,password:string){
 const address=email.trim();
 if(mode==='reset')await sendPasswordResetEmail(auth,address);
 else if(mode==='signUp')await createUserWithEmailAndPassword(auth,address,password);
 else await signInWithEmailAndPassword(auth,address,password);
}
export async function login(){
 if(Capacitor.isNativePlatform()){
  if(!Capacitor.isPluginAvailable('FirebaseAuthentication'))throw Object.assign(new Error('Android Google sign-in is not configured'),{code:'auth/native-not-configured'});
  const {FirebaseAuthentication}=await import('@capacitor-firebase/authentication');
  const result=await FirebaseAuthentication.signInWithGoogle({skipNativeAuth:true});
  if(!result.credential?.idToken)throw new Error('Missing Google credential');
  await signInWithCredential(auth,GoogleAuthProvider.credential(result.credential.idToken));
 }else{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await signInWithPopup(auth,provider)}
}
export async function logout(){
 await signOut(auth);
 // skipNativeAuth means the JavaScript session is the source of truth.
 if(Capacitor.isNativePlatform()){const {FirebaseAuthentication}=await import('@capacitor-firebase/authentication');await FirebaseAuthentication.signOut()}
}
