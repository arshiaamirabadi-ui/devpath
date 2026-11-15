import {test,expect} from '@playwright/test';
import {weeks,projects} from '../src/content';
const persian=/[\u0621-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/;
test('language switch preserves personal work, flips layout, persists and returns to Persian',async({page})=>{
 await page.goto('/#/activity/w1-backend-study');await page.getByRole('combobox',{name:'وضعیت فعالیت',exact:true}).selectOption('done');
 await page.getByRole('textbox',{name:'یادداشت تازه',exact:true}).fill('برنامه امروز یادداشت شخصی من ۱۲۳');await page.getByRole('button',{name:'ذخیره یادداشت',exact:true}).click();await page.getByRole('textbox',{name:'یادداشت تازه',exact:true}).fill('پیش‌نویس خصوصی');
 const saved=await page.evaluate(()=>localStorage.getItem('rahgo.personal.v1'));
 await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 await expect(page.getByRole('heading',{name:'What will this lesson teach me?',exact:true})).toBeVisible();await expect(page.getByRole('combobox',{name:'Activity status',exact:true})).toHaveValue('done');
 await expect(page.getByRole('textbox',{name:'New note',exact:true})).toHaveValue('پیش‌نویس خصوصی');await expect(page.getByText('برنامه امروز یادداشت شخصی من ۱۲۳',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('rahgo.personal.v1'))).toBe(saved);
 await expect.poll(async()=>(await page.locator('.sidebar').boundingBox())!.x).toBeCloseTo(0,1);
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.getByText('برنامه امروز یادداشت شخصی من ۱۲۳',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Switch to Persian',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');await expect(page.getByRole('heading',{name:'این درس چه چیزی یاد می‌دهد؟',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('rahgo.personal.v1'))).toBe(saved);
});
test('English pages, search, filters, themes and mobile layouts remain usable',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#/');await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle light and dark mode',exact:true}).click();
  for(const width of [320,768,1440]){await page.setViewportSize({width,height:1000});
   for(const route of ['','today','roadmap','week/1','activity/w1-backend-study','projects','project/task-api','resources','skills','skill/sql','review','notes','guide','settings','diagram','progress']){
    await page.goto('/#/'+route);await expect(page.locator('main h1')).toBeVisible();expect(await page.locator('main').innerText(),`${route} English`).not.toMatch(persian);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${theme} ${width} ${route}`).toBe(true);
    if(width!==768&&['','progress','activity/w1-backend-study'].includes(route))await page.screenshot({path:testInfo.outputPath(`en-${theme}-${width}-${route.replaceAll('/','-')||'dashboard'}.png`)});
   }
  }
 }
 await page.goto('/#/resources');await page.getByRole('searchbox',{name:'Search resources',exact:true}).fill('Docker');await expect(page.locator('.resource-card')).toHaveCount(1);await page.getByRole('searchbox',{name:'Search resources',exact:true}).fill('control flow');expect(await page.locator('.resource-card').count()).toBeGreaterThan(0);await page.getByRole('searchbox',{name:'Search resources',exact:true}).fill('');await page.getByRole('combobox',{name:'Type',exact:true}).selectOption({index:1});expect(await page.locator('.resource-card').count()).toBeGreaterThan(0);
 await page.goto('/#/diagram');await page.getByRole('searchbox',{name:'Search topics in the diagram',exact:true}).fill('ownership');await expect(page.locator('.graph-results')).toContainText(/Authentication/i);expect(errors).toEqual([]);
 await page.setViewportSize({width:320,height:844});await page.goto('/#/');await page.getByRole('button',{name:'Open menu',exact:true}).click();await expect(page.getByRole('navigation',{name:'Main navigation',exact:true})).toBeVisible();await expect.poll(async()=>(await page.locator('.sidebar').boundingBox())!.x).toBeCloseTo(0,1);await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('link',{name:'Resource library',exact:true}).click();await expect(page).toHaveURL(/#\/resources$/);
});
test('all English lesson and project guides are translated',async({page})=>{
 test.setTimeout(120000);await page.goto('/#/');await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 for(const activity of weeks.flatMap(w=>w.activities)){await page.goto('/#/activity/'+activity.id);await expect(page.getByRole('article',{name:'Lesson explanation and guide',exact:true})).toBeVisible();expect(await page.locator('main').innerText(),activity.id).not.toMatch(persian)}
 for(const project of projects){await page.goto('/#/project/'+project.id);await expect(page.locator('.project-check-guide')).toHaveCount(project.checklist.length);for(const detail of await page.locator('.project-check-guide details').all()){if(await detail.getAttribute('open')===null)await detail.locator(':scope > summary').click()}expect(await page.locator('main').innerText(),project.id).not.toMatch(persian)}
});
