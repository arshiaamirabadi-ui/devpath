import {test,expect} from '@playwright/test';
test('Odyssey ship clears its chapter; curved stars and hover cards replace tiny captions',async({page},info)=>{
 await page.goto('/#/progress');await expect(page.locator('.trail-stop-title')).toHaveCount(0);const chapter=page.getByTestId('voyage-stop-1'),ship=page.locator('.voyage-ship');await page.emulateMedia({reducedMotion:'reduce'});expect((await ship.boundingBox())!.y).toBeGreaterThan((await chapter.boundingBox())!.y+(await chapter.boundingBox())!.height+10);
 const node=page.getByTestId('trail-week-1');expect((await node.locator('.star-2').boundingBox())!.width).toBeGreaterThan((await node.locator('.star-1').boundingBox())!.width);await node.hover();const card=page.getByRole('dialog',{name:'جزئیات مرحله',exact:true});await expect(card).toBeVisible();await expect(card.locator('h3')).toHaveText('اولین برنامه‌های Go');await expect(card.locator('p')).not.toBeEmpty();await card.hover();await expect(card).toBeVisible();await page.screenshot({path:info.outputPath('odyssey-hover-card.png')});await page.keyboard.press('Escape');await expect(card).not.toBeVisible();
 await page.goto('/#/week/1');const buttons=page.locator('.activity-row>.check-circle');await expect(buttons.first()).toBeVisible();await buttons.nth(0).click();await buttons.nth(1).click();await page.goto('/#/progress');await expect(page.getByTestId('trail-week-1').locator('.trail-star.earned')).toHaveCount(1);await page.goto('/#/week/1');const remaining=page.locator('.activity-row>.check-circle[aria-pressed=false]');await expect(remaining.first()).toBeVisible();while(await remaining.count())await remaining.first().click();await page.goto('/#/progress');await expect(page.getByTestId('trail-week-1').locator('.trail-star.earned')).toHaveCount(3);await page.locator('.odyssey-trail').evaluate(el=>{el.scrollTop=0});await page.screenshot({path:info.outputPath('odyssey-gold-stars.png')});
});
test.describe('touch previews',()=>{
 test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
 test('a tap opens the stage card and its action opens the week',async({page})=>{
  await page.goto('/#/progress');await page.getByTestId('trail-week-1').tap();const card=page.getByRole('dialog',{name:'جزئیات مرحله',exact:true});await expect(card).toBeVisible();await card.locator('.trail-peek-action').tap();await expect(page).toHaveURL(/#\/week\/1$/);
 });
});
