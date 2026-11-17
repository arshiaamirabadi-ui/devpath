import {test,expect,type Page} from '@playwright/test';
test.skip(process.env.FIREBASE_SYNC_E2E!=='true','Requires local Firebase Auth and Firestore emulators');
const account=(page:Page)=>page.locator('.account-panel');
const signedIn=async(page:Page)=>{await expect(account(page).getByRole('button',{name:'خروج از حساب',exact:true})).toBeVisible();await expect(account(page).getByText('با فضای ابری هماهنگ است',{exact:true})).toBeVisible({timeout:30000})};
async function signIn(page:Page,email:string,create=false){
 await page.goto('/#/settings');if(create)await account(page).getByRole('button',{name:'ساخت حساب جدید',exact:true}).click();
 await account(page).getByLabel('ایمیل',{exact:true}).fill(email);await account(page).getByLabel('رمز عبور',{exact:true}).fill('Devpath-test-123!');
 await account(page).getByRole('button',{name:create?'ساخت حساب با ایمیل':'ورود با ایمیل',exact:true}).click();await signedIn(page);
}
async function addNote(page:Page,text:string){if(notNotes(page))await page.goto('/#/notes');await page.getByRole('textbox',{name:'یادداشت تازه',exact:true}).fill(text);await page.getByRole('button',{name:'ذخیره یادداشت',exact:true}).click();await expect(page.getByText(text,{exact:true})).toBeVisible()}
test('two isolated devices share an email account, recover offline edits and preserve guest data on sign out',async({browser},info)=>{
 test.setTimeout(120000);const one=await browser.newContext(),two=await browser.newContext();const a=await one.newPage(),b=await two.newPage();const email=`sync-${Date.now()}@example.test`;
 try{
  await addNote(a,'Guest note stays local');await signIn(a,email,true);await a.goto('/#/notes');await expect(a.getByText('Guest note stays local',{exact:true})).toHaveCount(0);
  await addNote(a,'Account note from device A');await a.goto('/#/settings');await signedIn(a);await signIn(b,email);await b.goto('/#/notes');await expect(b.getByText('Account note from device A',{exact:true})).toBeVisible();
  await two.setOffline(true);await addNote(b,'Offline note from device B');await one.setOffline(true);await addNote(a,'Independent offline note from device A');await one.setOffline(false);await two.setOffline(false);
  for(const page of [a,b]){await page.goto('/#/settings');await page.getByRole('button',{name:'تلاش دوباره',exact:true}).click();await signedIn(page);await page.goto('/#/notes');await expect(page.getByText('Offline note from device B',{exact:true})).toBeVisible({timeout:30000});await expect(page.getByText('Independent offline note from device A',{exact:true})).toBeVisible({timeout:30000})}
  await b.reload();await expect(b.getByText('Account note from device A',{exact:true})).toBeVisible();
  await a.goto('/#/settings');await signedIn(a);await a.screenshot({path:info.outputPath('account-synced-desktop.png')});await a.getByRole('button',{name:'خروج از حساب',exact:true}).click();await expect(account(a).getByRole('button',{name:'ورود با ایمیل',exact:true})).toBeVisible();
  await a.goto('/#/notes');await expect(a.getByText('Guest note stays local',{exact:true})).toBeVisible();await expect(a.getByText('Account note from device A',{exact:true})).toHaveCount(0);
  await a.setViewportSize({width:320,height:844});await a.goto('/#/settings');await expect(account(a)).toBeVisible();expect(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await a.screenshot({path:info.outputPath('account-guest-mobile.png')});
 }finally{await one.close();await two.close()}
});

function notNotes(page:Page){return !page.url().endsWith('/#/notes')}

test('concurrent edits preserve both versions until a choice and tombstones reach the other device',async({browser},info)=>{
 test.setTimeout(120000);const one=await browser.newContext(),two=await browser.newContext();const a=await one.newPage(),b=await two.newPage();const email=`conflict-${Date.now()}@example.test`;
 const edit=async(page:Page,value:string)=>{await page.locator('.note').getByRole('button',{name:'ویرایش',exact:true}).click();await page.getByRole('textbox',{name:'ویرایش یادداشت',exact:true}).fill(value);await page.getByRole('button',{name:'ذخیره ویرایش',exact:true}).click()};
 try{
  await signIn(a,email,true);await addNote(a,'Original shared note');await a.goto('/#/settings');await signedIn(a);await signIn(b,email);await b.goto('/#/notes');await expect(b.getByText('Original shared note',{exact:true})).toBeVisible();await a.goto('/#/notes');
  await one.setOffline(true);await two.setOffline(true);await edit(a,'Version from device A');await edit(b,'Version from device B');
  await one.setOffline(false);await a.goto('/#/settings');await signedIn(a);await two.setOffline(false);await b.goto('/#/settings');await b.getByRole('button',{name:'تلاش دوباره',exact:true}).click();
  await expect(b.locator('.sync-conflict')).toHaveCount(1,{timeout:30000});await b.locator('.sync-conflict summary').click();await expect(b.locator('.sync-conflict pre').first()).toContainText('Version from device B');await expect(b.locator('.sync-conflict pre').last()).toContainText('Version from device A');await b.screenshot({path:info.outputPath('account-conflict.png')});
  await b.getByRole('button',{name:'نگه‌داشتن نسخه این دستگاه',exact:true}).click();await signedIn(b);await a.goto('/#/notes');await expect(a.getByText('Version from device B',{exact:true})).toBeVisible({timeout:30000});
  a.once('dialog',dialog=>dialog.accept());await a.getByRole('button',{name:'حذف یادداشت',exact:true}).click();await a.goto('/#/settings');await signedIn(a);await b.goto('/#/notes');await expect(b.locator('.note')).toHaveCount(0,{timeout:30000});
 }finally{await one.close();await two.close()}
});

test('closing Google sign in preserves guest data and the email sign-in form',async({page})=>{
 await addNote(page,'Guest before cancelled Google login');await page.goto('/#/settings');const popupPromise=page.waitForEvent('popup');await account(page).getByRole('button',{name:'ورود با گوگل',exact:true}).click();const popup=await popupPromise;await popup.close();await expect(account(page).getByRole('alert')).toContainText('ورود لغو شد',{timeout:15000});await expect(account(page).getByLabel('ایمیل',{exact:true})).toBeEnabled();await page.goto('/#/notes');await expect(page.getByText('Guest before cancelled Google login',{exact:true})).toBeVisible();
});
