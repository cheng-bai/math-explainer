import {test} from 'node:test';import assert from 'node:assert/strict';
import {quadratic,midpointChord} from '../src/math/models';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)),`${a} vs ${b}`);
test('根、判别式与顶点高度在临界值两侧一致',()=>{for(const c of [-3,-.1,0,1-1e-8,1,1+1e-8,3]){
 const scene=quadratic.compute({c});const roots=scene.graphics.filter(g=>g.type==='point'&&g.id.startsWith('root'));
 assert.equal(roots.length,c<1?2:c===1?1:0);for(const g of roots)if(g.type==='point')near(g.at[0]**2-2*g.at[0]+c,0);
 for(const invariant of scene.invariants)near(invariant.residual,0);
 }assert.throws(()=>quadratic.compute({c:NaN}),RangeError);
});
test('中点弦的必要关系必须与两交点存在性同时成立',()=>{
 for(const h of [0,.9,1-1e-10,1,1+1e-10,1.5,2,5,10,100]){
  const scene=midpointChord.compute({h});assert.equal(scene.status,h>1?'valid':h===1?'degenerate':'empty');
  const A=scene.graphics.find(g=>g.id==='point-a'),B=scene.graphics.find(g=>g.id==='point-b');
  if(h>1&&A?.type==='point'&&B?.type==='point'){
   const [x1,y1]=A.at,[x2,y2]=B.at;near(y1*y1,4*x1);near(y2*y2,4*x2);near((x1+x2)/2,h);near((y1+y2)/2,2);near((y2-y1)/(x2-x1),1);
   const length=Math.hypot(x2-x1,y2-y1);near(length,4*Math.sqrt(2*(h-1)));assert.equal(length>=4,h>=1.5);
  }else{assert.ok(!A&&!B);assert.equal(scene.metrics.find(m=>m.label==='实弦长度 |AB|')?.value,'不存在');}
  for(const invariant of scene.invariants)near(invariant.residual,0);
 }
 assert.throws(()=>midpointChord.compute({h:Infinity}),RangeError);
});
