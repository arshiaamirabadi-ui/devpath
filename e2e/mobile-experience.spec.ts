import {test,expect} from '@playwright/test';
test('mobile dock, dated lesson streak and vertical Odyssey stay connected including undo',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#/');await expect(page.locator('.mobile-dock')).toBeVisible();await expect(page.locator('.mobile-hero')).toBeVisible();await page.screenshot({path:info.outputPath('mobile-home.png')});
 await page.goto('/#/activity/w1-backend-study');await page.getByRole('combobox',{name:'وضعیت فعالیت',exact:true}).selectOption('done');await expect(page.locator('.streak-celebration')).toBeVisible();
 await page.goto('/#/streak');await expect(page.getByTestId('streak-current')).toHaveText('۱');await expect(page.locator('.streak-day.today')).toHaveClass(/earned/);await page.screenshot({path:info.outputPath('mobile-streak.png')});await page.reload();await expect(page.getByTestId('streak-current')).toHaveText('۱');
 await page.goto('/#/progress');await expect(page.locator('.trail-stop')).toHaveCount(26);await expect(page.locator('.trail-stop.current')).toHaveAttribute('data-testid','trail-week-1');expect(Number(await page.getByTestId('voyage-ship').getAttribute('data-distance'))).toBeGreaterThan(0);await page.screenshot({path:info.outputPath('mobile-voyage.png')});await page.getByTestId('trail-week-2').click();await page.locator('.trail-peek-action').click();await expect(page).toHaveURL(/#\/week\/2$/);
 await page.goto('/#/activity/w1-backend-study');await page.getByRole('combobox',{name:'وضعیت فعالیت',exact:true}).selectOption('todo');await page.goto('/#/streak');await expect(page.getByTestId('streak-current')).toHaveText('۰');
 await page.locator('.mobile-dock button').click();await expect(page.locator('#learning-sidebar')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#learning-sidebar')).not.toBeVisible();
});
test('mobile experience, calendar and voyage remain usable in both themes and languages',async({page},info)=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#/');
 for(const language of ['fa','en']){
  if(language==='en')await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.top-actions button').last().click();
   for(const width of [320,390,760]){await page.setViewportSize({width,height:844});for(const route of ['','today','streak','progress','skills','settings']){
    await page.goto('/#/'+route);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${language} ${theme} ${width} ${route}`).toBe(true);if(language==='en')expect(await page.locator('main').innerText()).not.toMatch(/[\u0621-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/);
    if(width===390&&['','streak','progress'].includes(route))await page.screenshot({path:info.outputPath(`${language}-${theme}-${route||'home'}.png`)});
   }}
  }
 }
 expect(errors).toEqual([]);
});
