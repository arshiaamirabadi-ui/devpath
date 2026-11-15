import {test,expect} from '@playwright/test';
test('desktop sidebar folds to an icon rail, frees space, navigates and remembers the choice',async({page},testInfo)=>{
 await page.setViewportSize({width:1076,height:1039});await page.goto('/#/');
 const sidebar=page.locator('#learning-sidebar'),main=page.locator('.main-shell');const before=(await main.boundingBox())!.width;
 const toggle=page.getByRole('button',{name:'جمع‌کردن منو',exact:true});await toggle.click();await expect(page.locator('.sidebar-toggle')).toHaveAttribute('aria-expanded','false');await expect.poll(async()=>(await sidebar.boundingBox())!.width).toBe(80);expect((await main.boundingBox())!.width).toBeGreaterThan(before+140);
 await expect(sidebar.locator('.nav-icon')).toHaveCount(12);const resource=sidebar.getByRole('link',{name:'کتابخانه منابع',exact:true});const color=await resource.locator('.nav-icon').evaluate(e=>getComputedStyle(e).color);await resource.hover();await expect.poll(()=>resource.locator('.nav-icon').evaluate(e=>getComputedStyle(e).color)).not.toBe(color);await expect(page.getByRole('tooltip')).toHaveText('کتابخانه منابع');await page.screenshot({path:testInfo.outputPath('rail-rtl.png')});
 await resource.click();await expect(page).toHaveURL(/#\/resources$/);await expect(sidebar.getByRole('link',{name:'کتابخانه منابع',exact:true})).toHaveAttribute('aria-current','page');await page.reload();await expect.poll(async()=>(await sidebar.boundingBox())!.width).toBe(80);
 await page.getByRole('button',{name:'بازکردن منوی کناری',exact:true}).click();await expect.poll(async()=>(await sidebar.boundingBox())!.width).toBe(240);await expect(sidebar.locator('.nav-label').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('English rail has keyboard tooltips and mobile opens a full drawer with Escape support',async({page},testInfo)=>{
 await page.goto('/#/');await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('dir','ltr');await page.getByRole('button',{name:'Toggle light and dark mode',exact:true}).click();await page.getByRole('button',{name:'Collapse menu',exact:true}).click();const sidebar=page.locator('#learning-sidebar');await expect.poll(async()=>(await sidebar.boundingBox())!.width).toBe(80);
 const notes=sidebar.getByRole('link',{name:'Notes',exact:true});await notes.focus();await expect(page.getByRole('tooltip')).toHaveText('Notes');expect((await sidebar.boundingBox())!.x).toBe(0);await page.screenshot({path:testInfo.outputPath('rail-ltr.png')});
 await page.setViewportSize({width:320,height:844});await expect(sidebar).not.toBeVisible();const open=page.getByRole('button',{name:'Open menu',exact:true});await open.click();await expect(sidebar).toBeVisible();await expect(sidebar.locator('.nav-label').first()).toBeVisible();await expect.poll(async()=>(await sidebar.boundingBox())!.width).toBe(250);await expect.poll(async()=>(await sidebar.boundingBox())!.x).toBeCloseTo(0,1);await page.screenshot({path:testInfo.outputPath('drawer-mobile.png')});
 await page.keyboard.press('Escape');await expect(sidebar).not.toBeVisible();await expect(open).toBeFocused();await open.click();await sidebar.getByRole('link',{name:'Skills',exact:true}).click();await expect(page).toHaveURL(/#\/skills$/);await expect(sidebar).not.toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('DevPath stays centered in the header across directions, themes and sidebar states',async({page})=>{
 await page.goto('/#/');
 for(const language of ['fa','en']){
  if(language==='en')await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.top-actions button').last().click();
   for(const width of [320,768,1076,1440]){
    await page.setViewportSize({width,height:1000});const header=page.locator('.topbar'),brand=page.locator('.header-brand');await expect(brand).toBeVisible();
    for(const collapsed of width>760?[false,true]:[false]){
     if(width>760&&await page.locator('.app-shell').evaluate(el=>el.classList.contains('is-sidebar-collapsed'))!==collapsed)await page.locator('.sidebar-toggle').click();
     await expect.poll(async()=>{const h=(await header.boundingBox())!,b=(await brand.boundingBox())!;return Math.abs(b.x+b.width/2-h.x-h.width/2)}).toBeLessThan(1);
     const b=(await brand.boundingBox())!;for(const selector of ['.sidebar-toggle','.top-actions']){const c=(await page.locator(selector).boundingBox())!;expect(c.x+c.width<=b.x||c.x>=b.x+b.width).toBe(true);}
     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
   }
  }
 }
});
