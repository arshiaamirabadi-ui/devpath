import {test,expect} from '@playwright/test';
test('primary buttons keep a stable hit area when hovering the lower edge',async({page},info)=>{
 await page.goto('/#/settings');const button=page.locator('form button.primary').first();await button.scrollIntoViewIfNeeded();const box=(await button.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height-1);await page.waitForTimeout(350);await expect(button).toBeVisible();expect(await button.evaluate(el=>el.matches(':hover'))).toBe(true);expect(Math.abs((await button.boundingBox())!.y-box.y)).toBeLessThan(1);await page.screenshot({path:info.outputPath('primary-hover.png')});
});
test('branch filters, matching project identities and redesigned sections work in both languages and themes',async({page},info)=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1076,height:1039});
 for(const language of ['fa','en']){
  await page.goto('/#/skills');if(language==='en')await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.top-actions button').last().click();
   await page.goto('/#/skills');const filter=page.locator('.track-filter');await filter.locator('button[data-tone=violet]').click();await expect(page.locator('.skill-card')).toHaveCount(8);await expect(page.locator('.skill-card').first()).toHaveAttribute('data-tone','violet');await filter.locator('button[data-tone=rose]').click();await expect(page.locator('.skill-card')).toHaveCount(7);await filter.locator('button').first().click();await expect(page.locator('.skill-card')).toHaveCount(30);await page.locator('.skill-card').first().screenshot({path:info.outputPath(`${language}-${theme}-skill.png`)});
   for(const route of ['projects','resources','guide','diagram','today','progress','']){await page.goto('/#/'+route);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`${language}-${theme}-${route||'dashboard'}.png`)});}
   await page.goto('/#/projects');await expect(page.locator('a[href="#/project/mnist"]').first()).toHaveAttribute('data-tone','violet');await expect(page.locator('a[href="#/project/cpu-gpu"]').first()).toHaveAttribute('data-tone','rose');
   await page.setViewportSize({width:320,height:844});for(const route of ['skills','projects','resources','guide','diagram','today','progress']){await page.goto('/#/'+route);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${language} ${theme} ${route}`).toBe(true);}await page.setViewportSize({width:1076,height:1039});
  }
 }
 expect(errors).toEqual([]);
});
