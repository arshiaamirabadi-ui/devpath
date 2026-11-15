import {test,expect,webkit,devices} from '@playwright/test';
test.use({browserName:'webkit',channel:undefined,...devices['iPad Pro 11']});
test('iPad WebKit has full-width touch navigation in portrait, landscape and split view',async({page},info)=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5187/#/');
 for(const language of ['fa','en']){
  if(language==='en')await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.top-actions button').last().click();
   for(const viewport of [{width:834,height:1194},{width:1194,height:834},{width:768,height:1024},{width:1366,height:1024},{width:600,height:1024}]){
    await page.setViewportSize(viewport);
    for(const route of ['','today','progress','diagram','skills','settings']){
     await page.goto('http://127.0.0.1:5187/#/'+route);await expect(page.locator('main h1')).toBeVisible();await expect(page.locator('.mobile-dock')).toBeVisible();await expect(page.locator('.sidebar')).not.toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${language} ${theme} ${viewport.width} ${route}`).toBe(true);expect((await page.locator('.main-shell').boundingBox())!.width).toBeCloseTo(viewport.width,0);
     if(viewport.width===834&&['','today','progress'].includes(route))await page.screenshot({path:info.outputPath(`${language}-${theme}-${route||'home'}.png`)});
    }
   }
  }
 }
 await page.setViewportSize({width:834,height:1194});await page.locator('.mobile-dock button').click();await expect(page.locator('.sidebar')).toHaveAttribute('aria-modal','true');await page.keyboard.press('Escape');await expect(page.locator('.sidebar')).not.toBeVisible();expect(errors).toEqual([]);

});
