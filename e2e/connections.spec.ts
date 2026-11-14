import {test,expect} from '@playwright/test';

test('six Odyssey episodes have a story and a learning parallel without changing progress on exploration',async({page},testInfo)=>{
 await page.goto('/#/progress');const chapter=page.getByRole('region',{name:'روایت مرحلهٔ سفر',exact:true});
 const troy=page.getByTestId('voyage-stop-1');const x=await troy.getAttribute('data-x'),y=await troy.getAttribute('data-y');await expect(page.getByTestId('voyage-ship')).toHaveAttribute('style',`transform: translate(${x}px, ${y}px);`);await expect(page.getByText('بندر آغاز',{exact:true})).toHaveCount(0);
 for(const name of ['ترک تروا','غار پولیفموس','بادهای آئولوس','جزیرهٔ کیرکه','آواز سیرن‌ها','بازگشت به ایتاکا']){
  await page.getByRole('link',{name:new RegExp('^'+name+'، ماه')}).click();await expect(chapter.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(chapter.getByRole('heading',{name:'در ادیسه',exact:true})).toBeVisible();await expect(chapter.getByRole('heading',{name:'در مسیر تو',exact:true})).toBeVisible();await expect(chapter.locator('.chapter-quest').first()).toHaveAttribute('href',/#\/week\//);await expect(page.getByTestId('voyage-ship')).toHaveAttribute('data-distance','0');
 }
 await chapter.scrollIntoViewIfNeeded();await expect(chapter).toBeInViewport();await page.screenshot({path:testInfo.outputPath('ithaca-story.png')});await chapter.getByRole('button',{name:'مرحلهٔ من',exact:true}).click();await expect(chapter.getByRole('heading',{name:'ترک تروا',exact:true})).toBeVisible();
 expect((await page.locator('h1,h2,h3,button,summary').allTextContents()).join(' ')).not.toMatch(/خودکار|لایو|همگام/);
});

test('lesson guide hover covers the whole header without a clipped color strip',async({page},testInfo)=>{
 await page.goto('/#/week/1');const detail=page.locator('.activity-lesson-preview').first(),summary=detail.locator(':scope > summary');await summary.hover();const outer=(await detail.boundingBox())!,header=(await summary.boundingBox())!;
 expect(header.width).toBeGreaterThan(outer.width-5);await page.screenshot({path:testInfo.outputPath('lesson-guide-hover.png')});
 await summary.click();await expect(detail).toHaveAttribute('open','');await expect(detail.getByRole('heading',{name:'این درس چه چیزی یاد می‌دهد؟',exact:true})).toBeVisible();await summary.click();await expect(detail).not.toHaveAttribute('open','');
});

test('lesson and project evidence drive skills, charts and the odyssey live across tabs, including undo',async({page,context},testInfo)=>{
 await page.goto('/#/progress');const ship=page.getByTestId('voyage-ship');await expect(ship).toHaveAttribute('data-distance','0');const startPosition=await ship.getAttribute('style');
 const lesson=await context.newPage();await lesson.goto('/#/activity/w1-backend-study');await expect(lesson.getByRole('region',{name:'اثر این فعالیت بر مهارت‌ها'})).toBeVisible();
 await lesson.getByRole('combobox',{name:'وضعیت فعالیت',exact:true}).selectOption('done');
 await expect.poll(async()=>Number(await ship.getAttribute('data-distance'))).toBeGreaterThan(0);await expect.poll(()=>ship.getAttribute('style')).not.toBe(startPosition);
 for(const label of ['مطالعه کردم','تمرین کردم','می‌توانم توضیح بدهم'])await lesson.getByRole('checkbox',{name:label,exact:true}).check();
 const moved=Number(await ship.getAttribute('data-distance'));expect(moved).toBeGreaterThan(0);
 await lesson.goto('/#/skill/go-basics');const skill=lesson.getByTestId('skill-go-basics');await expect(skill.getByRole('progressbar',{name:'پیشرفت یادگیری',exact:true})).not.toHaveAttribute('value','0');await expect(skill.getByRole('combobox',{name:'سطح فعلی',exact:true})).toHaveValue('0');
 await page.screenshot({path:testInfo.outputPath('odyssey-with-progress.png'),fullPage:true});
 await lesson.goto('/#/activity/w1-backend-study');await lesson.getByRole('combobox',{name:'وضعیت فعالیت',exact:true}).selectOption('todo');for(const label of ['مطالعه کردم','تمرین کردم','می‌توانم توضیح بدهم'])await lesson.getByRole('checkbox',{name:label,exact:true}).uncheck();await expect(ship).toHaveAttribute('data-distance','0');
 await lesson.goto('/#/project/task-api');await lesson.locator('.checklist-row input').nth(2).check();
 await lesson.goto('/#/skill/sql');await expect(lesson.getByTestId('skill-sql').getByRole('progressbar',{name:'پیشرفت یادگیری',exact:true})).not.toHaveAttribute('value','0');
 await expect(ship).toHaveAttribute('data-distance','0');await page.reload();await expect(page.getByRole('heading',{name:'پیشرفت و سفر ادیسه',exact:true})).toBeVisible();
 await lesson.goto('/#/activity/w1-backend-study');await lesson.getByRole('button',{name:'ذخیره زمان',exact:true}).click();await expect(page.getByRole('link',{name:/بادبان سفر/})).toContainText('۳۰ دقیقه');
 await lesson.getByRole('textbox',{name:'یادداشت تازه',exact:true}).fill('یادداشت سفر و تمرین');await lesson.getByRole('button',{name:'ذخیره یادداشت',exact:true}).click();await expect(page.getByRole('link',{name:/دفتر کشتی/})).toContainText('۱ یادداشت');
 await lesson.goto('/#/resources');await lesson.getByRole('combobox',{name:'وضعیت مطالعه',exact:true}).first().selectOption('read');await expect(page.getByRole('link',{name:/توشهٔ علمی/})).toContainText('۱ منبع');
 await lesson.goto('/#/review');await lesson.getByRole('textbox',{name:'چه چیزی یاد گرفتم؟',exact:true}).fill('ثبت مرور مسیر');await lesson.getByRole('button',{name:'ذخیره مرور هفته',exact:true}).click();await expect(page.getByRole('link',{name:/قطب‌نمای بازبینی/})).toContainText('۱ مرور');await expect(ship).toHaveAttribute('data-distance','0');
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('odyssey-mobile.png')});
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.voyage-ship')).toHaveCSS('animation-name','none');
 await lesson.close();
});
