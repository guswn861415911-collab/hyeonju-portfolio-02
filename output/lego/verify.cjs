const {chromium}=require('C:/Users/황 현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url'); const path=require('path'); const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('work.html')).href);
 const card=page.locator('[data-lego-open]');
 assert.equal(await card.locator('video').count(),1);assert.equal(await page.locator('#legoModal video').count(),0);
 await card.hover();await page.waitForFunction(()=>document.querySelector('[data-lego-open] video').currentTime>0);
 await page.screenshot({path:'output/lego/cards.png'});
 await card.click();await page.waitForTimeout(500);
 assert(await card.locator('video').evaluate(v=>v.paused));
 assert(await page.locator('#legoModal').evaluate(d=>d.open));
 await page.screenshot({path:'output/lego/desktop.png'});
 await page.locator('#lego-tab-1').click();assert(await page.locator('#lego-panel-1').isVisible());
 await page.keyboard.press('ArrowRight');assert(await page.locator('#lego-panel-2').isVisible());
 await page.screenshot({path:'output/lego/design-system.png'});
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#legoModal').open);
 assert(await card.evaluate(e=>document.activeElement===e));
 await page.locator('[data-dippingbook-open]').click();await page.waitForTimeout(500);
 assert(await page.locator('#dippingbookModal').evaluate(d=>d.open));await page.locator('#db-tab-1').click();assert(await page.locator('#db-panel-1').isVisible());
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#dippingbookModal').open);
 const names=await page.locator('#projectGrid > .folder-card .folder-card-meta-copy p').allTextContents();assert.match(names[0],/DIPPINGBOOK/);assert.match(names[1],/LEGO World/);assert.match(names[2],/훈민정음/);
 for(const width of [390,320,768]){
 await page.setViewportSize({width,height:844});
 const filter=page.locator('.mobile-category-grid-html [data-filter="all"]');if(width<768 && await filter.isVisible())await filter.click();
 await card.click();await page.waitForTimeout(500);
 assert(await page.locator('#legoModal').evaluate(d=>d.scrollWidth<=d.clientWidth+1));
 await page.screenshot({path:`output/lego/mobile-${width}.png`});
 await page.locator('#lego-tab-2').click();assert(await page.locator('#lego-panel-2').isVisible());
 await page.screenshot({path:`output/lego/details-${width}.png`});
 await page.locator('#legoModal .db-close').click();await page.waitForFunction(()=>!document.querySelector('#legoModal').open);
 }
 assert.deepEqual(errors,[]);console.log('PASS: card video playback, modal image only, shared tabs/keyboard, focus restoration, original order, DippingBook regression, 320/390/768/1440 layouts.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
