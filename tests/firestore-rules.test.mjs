import {readFile} from 'node:fs/promises';
import {after,before,beforeEach,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc} from 'firebase/firestore';
let environment;
before(async()=>{environment=await initializeTestEnvironment({projectId:'demo-devpath-sync',firestore:{host:'127.0.0.1',port:8080,rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}})});
beforeEach(()=>environment.clearFirestore());
after(async()=>{await environment?.cleanup()});
const data={value:JSON.stringify({id:'n',target:'general',text:'private',updatedAt:'2026-11-17T10:00:00Z'})};
const record=(db,uid='alice',key='notes~n')=>doc(db,'users',uid,'records',key);
test('owner can create, list, read, update and tombstone their records without a parent profile',async()=>{
 const db=environment.authenticatedContext('alice').firestore(),ref=record(db);
 await assertSucceeds(setDoc(ref,data));await assertSucceeds(getDoc(ref));await assertSucceeds(getDocs(collection(db,'users','alice','records')));await assertSucceeds(updateDoc(ref,{value:null}));await assertFails(deleteDoc(ref));
});
test('unauthenticated and other accounts cannot read, list, create, update or delete private records',async()=>{
 await assertSucceeds(setDoc(record(environment.authenticatedContext('alice').firestore()),data));
 for(const db of [environment.unauthenticatedContext().firestore(),environment.authenticatedContext('bob').firestore()]){
  await assertFails(getDoc(record(db)));await assertFails(getDocs(collection(db,'users','alice','records')));await assertFails(setDoc(record(db,'alice','notes~new'),data));await assertFails(updateDoc(record(db),{value:null}));await assertFails(deleteDoc(record(db)));
 }
});
test('create and update both reject schema pollution, type juggling and oversized payloads',async()=>{
 const db=environment.authenticatedContext('alice').firestore(),ref=record(db);
 for(const invalid of [{},{value:1},{value:{}},{value:[]},{value:'x',ownerId:'bob'},{value:'x',isAdmin:true},{value:'x'.repeat(100001)}]){
  await assertFails(setDoc(ref,invalid));await assertSucceeds(setDoc(ref,data));await assertFails(setDoc(ref,invalid));await assertSucceeds(setDoc(ref,data));
 }
});
test('rejects unknown record sections, deleted settings, parent profile writes and nested paths',async()=>{
 const db=environment.authenticatedContext('alice').firestore();
 await assertFails(setDoc(record(db,'alice','admin~role'),data));await assertFails(setDoc(record(db,'alice','settings~theme'),{value:null}));await assertFails(setDoc(doc(db,'users','alice'),{isAdmin:true}));await assertFails(setDoc(doc(db,'users','alice','records','notes~n','private','x'),data));
 await assertSucceeds(setDoc(record(db,'alice','settings~theme'),{value:'"dark"'}));
});
