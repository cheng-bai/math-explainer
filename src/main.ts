import 'katex/dist/katex.min.css';
import './style.css';
import {catalog as sourceCatalog} from './content/catalog';
import type {Lesson,State} from './core/schema';
import {defaults,normalizeState,updateState,stateHash,parseHash} from './core/state';
import {models,validateLessonBindings} from './math/models';
import {renderBlocks,escapeHtml as e} from './renderers/text';
import {renderScene} from './renderers/svg';
declare const __LESSON_FILTER__:string;
declare const __LEGACY_AVAILABLE__:boolean;
if(!__LEGACY_AVAILABLE__)document.querySelector(".legacy-link")?.remove();
const catalog:Lesson[]=__LESSON_FILTER__?sourceCatalog.filter(l=>l.id===__LESSON_FILTER__):sourceCatalog;
for(const lesson of catalog){const errors=validateLessonBindings(lesson);if(errors.length)throw new Error(errors.join(';'));}
const $=<T extends Element=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
let lesson=catalog[0],path=lesson.paths[0],step=path.steps[0],state:State=defaults(models[lesson.modelId]);
const states=new Map<string,State>();
function scene(){return models[lesson.modelId].compute(state);}
function save(){history.replaceState(null,'',stateHash(lesson.id,path.id,step.id,state));}
function renderPlot(){const result=scene();renderScene($('#plot'),result,step.highlight);
 $('#scene-status').textContent=result.message;$('#scene-status').dataset.status=result.status;
 $('#metrics').innerHTML=result.metrics.map(m=>`<div><span>${e(m.label)}</span><strong>${e(m.value)}</strong></div>`).join('');
 for(const p of models[lesson.modelId].parameters){$('#param-'+p.id).setAttribute('aria-valuetext',String(state[p.id]));$<HTMLInputElement>('#param-'+p.id).value=String(state[p.id]);$('#out-'+p.id).textContent=Number(state[p.id].toFixed(3)).toString();}
 states.set(lesson.id,{...state});
 window.mathExplainer={lessonId:lesson.id,pathId:path.id,stepId:step.id,state:{...state},scene:result};
}
function renderStep(){
 $('#steps').innerHTML=path.steps.map(s=>`<button data-step="${s.id}" aria-current="${s.id===step.id?'step':'false'}">${e(s.title)}</button>`).join('');
 $('#step-title').textContent=step.title;$('#step-why').textContent=step.why;$('#step-body').innerHTML=renderBlocks(step.body);
 document.querySelectorAll<HTMLElement>('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=path.steps.find(s=>s.id===b.dataset.step)!;state=updateState(models[lesson.modelId],state,step.scenePatch);renderStep();renderPlot();save();}));
 const i=path.steps.indexOf(step);$<HTMLButtonElement>('#prev-step').disabled=i===0;$<HTMLButtonElement>('#next-step').disabled=i===path.steps.length-1;
 $('#step-progress').textContent=`${i+1} / ${path.steps.length}`;
}
function renderLesson(){
 $('#lesson-nav').innerHTML=catalog.map(l=>`<button data-lesson="${l.id}" aria-current="${l.id===lesson.id?'page':'false'}"><small>${l.kind==='concept'?'概念探究':'问题解析'}</small>${e(l.title)}</button>`).join('');
 $('#topic').textContent=lesson.topic+' / '+(lesson.kind==='concept'?'概念探究':'完整题解');$('#lesson-title').textContent=lesson.title;$('#summary').textContent=lesson.summary;
 $('#statement').innerHTML=renderBlocks(lesson.statement);$('#source').textContent=lesson.source.label;$('#prerequisites').textContent=lesson.prerequisites.join(' · ');
 $('#boundaries').innerHTML=renderBlocks(lesson.boundaries);
 $('#paths').innerHTML=lesson.paths.map(p=>`<button data-path="${p.id}" aria-pressed="${p.id===path.id}">${e(p.title)}</button>`).join('');
 $('#controls').innerHTML=models[lesson.modelId].parameters.map(p=>`<label for="param-${p.id}">${e(p.label)}<output id="out-${p.id}"></output><input id="param-${p.id}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${state[p.id]}"></label>`).join('');
 document.querySelectorAll<HTMLElement>('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{lesson=catalog.find(l=>l.id===b.dataset.lesson)!;path=lesson.paths[0];step=path.steps[0];state=states.get(lesson.id)??defaults(models[lesson.modelId]);renderLesson();save();}));
 document.querySelectorAll<HTMLElement>('[data-path]').forEach(b=>b.addEventListener('click',()=>{path=lesson.paths.find(p=>p.id===b.dataset.path)!;step=path.steps[0];renderLesson();save();}));
 for(const p of models[lesson.modelId].parameters)$<HTMLInputElement>('#param-'+p.id).addEventListener('input',event=>{state=updateState(models[lesson.modelId],state,{[p.id]:Number((event.target as HTMLInputElement).value)});renderPlot();save();});
 renderStep();renderPlot();
}
function restore(){const restored=parseHash(location.hash);if(restored){lesson=catalog.find(l=>l.id===restored.lesson)??catalog[0];path=lesson.paths.find(p=>p.id===restored.path)??lesson.paths[0];step=path.steps.find(s=>s.id===restored.step)??path.steps[0];state=normalizeState(models[lesson.modelId],restored.state);}renderLesson();}
$('#reset').addEventListener('click',()=>{state=updateState(models[lesson.modelId],defaults(models[lesson.modelId]),step.scenePatch);renderPlot();save();});
for(const [selector,offset] of [['#prev-step',-1],['#next-step',1]] as const)$(selector).addEventListener('click',()=>{const i=path.steps.indexOf(step)+offset;if(i>=0&&i<path.steps.length){step=path.steps[i];state=updateState(models[lesson.modelId],state,step.scenePatch);renderStep();renderPlot();save();}});
$('#theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'浅色纸面':'深色纸面';});
$('#copy-state').addEventListener('click',async()=>{save();try{await navigator.clipboard.writeText(location.href);$('#copy-status').textContent='已复制当前步骤和参数。离线分享请发送 HTML。';}catch{$('#copy-status').textContent='参数已写入地址栏。离线分享请发送 HTML。';}});
$('#plot').addEventListener('keydown',event=>{const ev=event as KeyboardEvent,p=models[lesson.modelId].parameters[0];if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();state=updateState(models[lesson.modelId],state,{[p.id]:ev.key==='Home'?p.min:ev.key==='End'?p.max:state[p.id]+(ev.key==='ArrowRight'?p.step:-p.step)});renderPlot();save();}});
window.addEventListener('hashchange',restore);restore();
