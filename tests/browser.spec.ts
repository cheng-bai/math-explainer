import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
const slider=async(page:import('@playwright/test').Page,value:number)=>page.locator('#controls input').evaluate((e,v)=>{(e as HTMLInputElement).value=String(v);e.dispatchEvent(new Event('input'));},value);
test('概念与双解法题解：步骤、边界、高亮、分享和旧24入口',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('#lesson-title')).toContainText('根的个数');await slider(page,1);await expect(page.locator('#scene-status')).toContainText('相切');await slider(page,2);await expect(page.locator('#metrics')).toContainText('0');
 await page.locator('[data-lesson="parabola-midpoint-chord"]').click();await expect(page.locator('#statement')).toContainText('两个不同点');
 await page.locator('[data-step="existence"]').click();await expect(page.locator('#scene-status')).toContainText('只有切点');await expect(page.locator('[data-object="tangent-point"]')).toHaveCount(1);
 await slider(page,.9);await expect(page.locator('#scene-status')).toHaveAttribute('data-status','empty');await expect(page.locator('[data-object="chord"]')).toHaveCount(0);
 await page.locator('[data-step="length"]').click();await expect(page.locator('[data-object="chord"]')).toHaveClass(/highlight/);await expect(page.locator('#metrics')).toContainText('4');
 await page.locator('[data-path="vieta"]').click();await page.locator('[data-step="discriminant"]').click();await expect(page.locator('#step-body')).toContainText('充分');
 await slider(page,3.2);const href=page.url();await page.reload();await expect(page.locator('#controls input')).toHaveValue('3.2');await expect(page.locator('#step-title')).toContainText('判别式');
 await page.locator('#plot').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#controls input')).toHaveValue('3.21');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.screenshot({path:'test-results/desktop-dark.png',fullPage:true});
 expect(errors).toEqual([]);await page.locator('.legacy-link').click();await expect(page.locator('#curve-hyperbola')).toBeVisible();await page.frameLocator('#page-hyperbola').locator('#diagram').waitFor();
 for(const curve of ['ellipse','hyperbola','parabola']){await page.locator('#curve-'+curve).click();const frame=page.frameLocator('#page-'+curve);await expect(frame.locator('[data-mode]')).toHaveCount(8);}
 expect(errors).toEqual([]);
});
test('390px手机的每个推理步骤、公式、状态均可读且无整页横溢出',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const lesson of ['quadratic-roots','parabola-midpoint-chord']){
  await page.locator('[data-lesson="'+lesson+'"]').click();
  for(const path of await page.locator('[data-path]').evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.path!))){
   await page.locator('[data-path="'+path+'"]').click();
   for(const step of await page.locator('[data-step]').evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.step!))){
    await page.locator('[data-step="'+step+'"]').click();expect(await page.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.locator('.katex-error')).toHaveCount(0);
   }
  }
 }
 await page.locator('.boundaries').evaluate(e=>(e as HTMLDetailsElement).open=true);await page.screenshot({path:'test-results/phone-problem.png',fullPage:true});
});
test('新讲解单文件在全离线上下文中运行，无外部请求',async({browser})=>{
 const context=await browser.newContext({offline:true});const page=await context.newPage(),requests:string[]=[],errors:string[]=[];const url='http://offline.test/index.html';
 await context.route('**/*',route=>{if(route.request().url()===url)return route.fulfill({contentType:'text/html',body:readFileSync('dist/index.html','utf8')});requests.push(route.request().url());return route.abort();});
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('[data-lesson="parabola-midpoint-chord"]').click();await page.locator('[data-step="length"]').click();await expect(page.locator('#step-body .katex')).not.toHaveCount(0);expect(requests).toEqual([]);expect(errors).toEqual([]);await context.close();
});
test('教师导出可离线；学生文件无解法、参数模型或脚本',async({browser})=>{
 const student=readFileSync('artifacts/parabola-midpoint-chord-student/index.html','utf8');expect(student).not.toContain('<script');for(const marker of ['scenePatch','point-difference','midpointChord','判别式保留两个','4\\sqrt{2(h-1)}','h&gt;1'])expect(student).not.toContain(marker);
 const context=await browser.newContext({offline:true});const page=await context.newPage();let source=student;
 await context.route('**/*',r=>r.request().url()==='http://offline.test/export.html'?r.fulfill({contentType:'text/html',body:source}):r.abort());await page.goto('http://offline.test/export.html');await expect(page.locator('body')).toContainText('两个不同点');await expect(page.locator('.katex')).not.toHaveCount(0);await expect(page.locator('#step-body')).toHaveCount(0);
 await page.screenshot({path:'test-results/student-export.png',fullPage:true});
 source=readFileSync('artifacts/parabola-midpoint-chord-teacher/index.html','utf8');await page.reload();await expect(page.locator('#lesson-title')).toContainText('弦中点');await expect(page.locator('.legacy-link')).toHaveCount(0);await page.locator('[data-step="length"]').click();await expect(page.locator('#step-body')).toContainText('3/2');await context.close();
});
