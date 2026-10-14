import type {MathModel,Scene,State,Vec2,Graphic} from '../core/schema';
import {requireFinite} from '../core/state';
const sample=(fn:(t:number)=>Vec2,start:number,end:number,count=180)=>Array.from({length:count+1},(_,i)=>fn(start+(end-start)*i/count));
const f=(n:number)=>Number(n.toFixed(4)).toString();
export const quadratic:MathModel={
 id:'quadratic',parameters:[{id:'c',label:'常数项 c',min:-3,max:3,step:.05,initial:0}],
 objectIds:['graph','vertex','axis','root-left','root-right'],
 compute(state){
  requireFinite(state,['c']);const c=state.c,delta=4-4*c,graphics:Graphic[]=[
   {id:'graph',type:'curve',points:sample(x=>[x,x*x-2*x+c],-3,5)},
   {id:'axis',type:'segment',from:[1,-5],to:[1,7],tone:'muted'},
   {id:'vertex',type:'point',at:[1,c-1],label:'V'}
  ];
  if(delta>=0){const d=Math.sqrt(delta)/2;graphics.push({id:'root-left',type:'point',at:[1-d,0],label:delta===0?'重根':'x₁'});if(delta>0)graphics.push({id:'root-right',type:'point',at:[1+d,0],label:'x₂'});}
  return {viewport:[-3,5,-4,6],status:delta===0?'degenerate':'valid',message:delta>0?'两个实根，顶点在 x 轴下方。':delta===0?'重根：图像与 x 轴相切，两个交点重合。':'没有实根，顶点在 x 轴上方；函数图像仍存在。',graphics,
   metrics:[{label:'判别式 Δ',value:f(delta)},{label:'顶点高度 c−1',value:f(c-1)},{label:'不同实根个数',value:delta>0?'2':delta===0?'1':'0'}],invariants:[{label:'Δ + 4(c−1) = 0',residual:delta+4*(c-1)}]};
 }
};
export const midpointChord:MathModel={
 id:'midpoint-chord',parameters:[{id:'h',label:'中点横坐标 h',min:0,max:5,step:.01,initial:2}],
 objectIds:['parabola','secant','chord','midpoint','point-a','point-b','tangent-point','midpoint-line'],
 compute(state){
  requireFinite(state,['h']);const h=state.h,t=h-1;
  const graphics:Graphic[]=[{id:'parabola',type:'curve',points:sample(y=>[y*y/4,y],-4,8)},
   {id:'secant',type:'segment',from:[-1,1-h],to:[10,12-h],tone:'muted'},
   {id:'midpoint-line',type:'segment',from:[-1,2],to:[10,2],tone:'muted'},
   {id:'midpoint',type:'point',at:[h,2],label:'M',tone:'aux'}];
  let sceneStatus:Scene['status']='empty',message='这条斜率为 1 的候选直线没有交点，M 不能成为实弦中点。';
  const invariants:Scene['invariants']=[];
  if(t>=0){const d=2*Math.sqrt(t),A:Vec2=[h-d,2-d],B:Vec2=[h+d,2+d];
   if(t===0){sceneStatus='degenerate';message='h=1：只有切点 (1,2)，A 与 B 重合，不满足不同两点的题设。';graphics.push({id:'tangent-point',type:'point',at:A,label:'T'});}
   else {sceneStatus='valid';message='两个不同交点，中点恰为 M；h 的数学范围没有上界，滑块只显示 0 至 5。';graphics.push({id:'point-a',type:'point',at:A,label:'A'},{id:'point-b',type:'point',at:B,label:'B'},{id:'chord',type:'segment',from:A,to:B,tone:'aux'});}
   invariants.push({label:'A 在抛物线上',residual:A[1]**2-4*A[0]},{label:'B 在抛物线上',residual:B[1]**2-4*B[0]},{label:'中点横坐标',residual:(A[0]+B[0])/2-h},{label:'中点纵坐标',residual:(A[1]+B[1])/2-2});
  }
  return {viewport:[-1,10,-4,8],status:sceneStatus,message,graphics,metrics:[{label:'候选中点 M',value:`(${f(h)}, 2)`},{label:'交点判别式',value:f(16*t)},{label:'不同交点个数',value:t>0?'2':t===0?'1':'0'},{label:'实弦长度 |AB|',value:t>0?f(4*Math.sqrt(2*t)):'不存在'}],invariants};
 }
};
export const models:Readonly<Record<string,MathModel>>=Object.freeze({quadratic,'midpoint-chord':midpointChord});
export function validateLessonBindings(lesson:import('../core/schema').Lesson):string[]{
 const model=models[lesson.modelId],errors:string[]=[];if(!model)return ['未注册的模型 '+lesson.modelId];
 for(const path of lesson.paths)for(const step of path.steps){
  for(const [key,value] of Object.entries(step.scenePatch)){const p=model.parameters.find(p=>p.id===key);if(!p||value<p.min||value>p.max)errors.push(`步骤 ${step.id} 的参数 ${key} 未注册或越界`);}
  for(const id of step.highlight)if(!model.objectIds.includes(id))errors.push(`步骤 ${step.id} 的对象 ${id} 未注册`);
 }
 return errors;
}
