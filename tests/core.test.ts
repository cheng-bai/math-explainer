import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/content/catalog';
import {lessonSchema,studentDocument} from '../src/core/schema';
import {parseHash,stateHash,normalizeState,defaults} from '../src/core/state';
import {models,validateLessonBindings} from '../src/math/models';
import {renderBlocks} from '../src/renderers/text';
test('内容引用与推理依赖可检查；格式校验不等于证明',()=>{for(const lesson of catalog){assert.deepEqual(validateLessonBindings(lesson),[]);for(const path of lesson.paths)for(const step of path.steps)assert.ok(renderBlocks(step.body));}
 const cyclic=structuredClone(catalog[0]);cyclic.paths[0].steps[0].dependsOn=['prove'];assert.equal(lessonSchema.safeParse(cyclic).success,false);
 const unknown=structuredClone(catalog[0]);unknown.paths[0].steps[0].highlight=['unregistered'];assert.ok(validateLessonBindings(unknown).length>0);
 const illegal=structuredClone(catalog[0]);illegal.paths[0].steps[0].scenePatch={c:NaN};assert.equal(lessonSchema.safeParse(illegal).success,false);
});
test('分享状态版本化、过滤非法数值和未知参数、限制显示窗口',()=>{
 const state={h:2.5},h=stateHash(catalog[1].id,'vieta','discriminant',state);assert.deepEqual(parseHash(h)?.state,state);
 assert.equal(parseHash('#v=7&lesson=x'),null);assert.deepEqual(parseHash('#v=1&p.h=NaN&p.c=&p.x=Infinity')?.state,{});
 assert.deepEqual(normalizeState(models['midpoint-chord'],{h:100,evil:4}),{h:5});assert.deepEqual(normalizeState(models.quadratic,{c:NaN}),defaults(models.quadratic));
});
test('学生数据通过白名单投影，排除解法、预设、模型及边界提示',()=>{
 const document=studentDocument(catalog[1]);assert.deepEqual(Object.keys(document).sort(),['id','kind','schemaVersion','source','statement','title']);
 assert.equal(document.title,'抛物线弦的中点与长度');assert.notEqual(document.title,catalog[1].title);
 const json=JSON.stringify(document);for(const marker of ['scenePatch','modelId','paths','dependsOn','boundaries','4\\\\sqrt','交点存在性排除'])assert.ok(!json.includes(marker));
});
test('不将内容文本当HTML执行，KaTeX禁用受信任命令',()=>{assert.ok(renderBlocks([{type:'text',text:'<img src=x onerror=alert(1)>'}]).includes('&lt;img'));assert.throws(()=>renderBlocks([{type:'math',tex:'\\badcommand',display:true}]));});
