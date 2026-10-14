import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {ellipseModel} from './model.mjs';
let states=0,checks=0,maxResidual=0;
function near(x,y){const d=Math.abs(x-y)/Math.max(1,Math.abs(x),Math.abs(y));maxResidual=Math.max(maxResidual,d);assert.ok(d<1e-10,`${x} ≠ ${y}`);checks++}
for(const a of [3,4.7,5,7])for(const r of [.2,.3,.8,.99,.999999,1])for(let t=0;t<=360;t+=.5){
 const m=ellipseModel(a,r,t);states++;
 near(m.normalized,1);near(m.r1+m.r2,2*a);near(m.c*m.c+m.b*m.b,a*a);
 if(m.c>0)near(m.r2/m.directrixDistance,m.e);else assert.equal(m.directrix,null);
 near(m.circleLarge[0],m.x);near(m.circleLarge[1]*r,m.y);
 near(m.circleSmall[1],m.y);
 near(Math.hypot(m.A[0],m.B[1]),a+m.b);
 near(m.A[0]*a/m.length+m.B[0]*m.b/m.length,m.x);near(m.A[1]*a/m.length+m.B[1]*m.b/m.length,m.y);
 near(Math.hypot(m.x-m.A[0],m.y),m.b);near(Math.hypot(m.x,m.y-m.B[1]),a);
 near(Math.hypot(...m.q3),a);near(a*Math.cos(m.projectionAngle),m.b);near(m.q3[1],m.y);
 near(m.u[0]*m.u[0]+m.u[2]*m.u[2],1);
 const [x,y,z]=m.conePoint;near(x*x+y*y,z*z);near(z,m.h+m.m*x);
 const du=(x-m.center[0])*m.u[0]+(z-m.center[2])*m.u[2];near(du*du/(a*a)+y*y/(m.b*m.b),1);
 near(m.r1,Math.abs(m.r2-2*a));near(Math.hypot(m.contact[0]-m.c,m.contact[1]),2*a);near(Math.hypot(m.contact[0]-m.x,m.contact[1]-m.y),m.r1);
}
// Independently sample the complete equal-distance boundary, including its exterior branch.
for(const x of [-30,-15,-5,0,5,5.1,8,15]){const a=5,r1=Math.abs(x+a),r2=Math.abs(x-a);assert.equal(Math.abs(r1-Math.abs(r2-2*a))<1e-10,x<=a);checks++}
for(const args of [[0,.8,30],[5,0,30],[5,1.1,30],[5,.8,NaN]])assert.throws(()=>ellipseModel(...args));
const result={states,checks,maxRelativeResidual:maxResidual,passed:true};writeFileSync(new URL('model-test-results.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
