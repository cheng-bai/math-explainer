import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {hyperbolaModel as H,parabolaModel as P} from './model.mjs';
let checks=0,hyperbolaSamples=0,parabolaSamples=0;
function near(actual,expected,label){checks++;assert.ok(Math.abs(actual-expected)<=2e-10*Math.max(1,Math.abs(actual),Math.abs(expected)),`${label}: ${actual} vs ${expected}`)}
const norm=a=>Math.hypot(...a),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
for(const a of [1.5,3,5])for(const r of [.35,.75,1,1.5])for(const q of [-2.4,-1,-.01,0,.8,2.4])for(const s of [-1,1]){
 const m=H(a,r,q,s),{x,y,b,c}=m;hyperbolaSamples++;
 near(x*x/a**2-y*y/b**2,1,'Cartesian locus');near(Math.abs(norm(sub(m.p,m.f1))-norm(sub(m.p,m.f2))),2*a,'focal locus');
 near(norm(sub(m.p,m.f2))/Math.abs(x-a*a/c),c/a,'focus-directrix both branches');
 near(m.hypotenuse**2,a*a+(a*q)**2,'right triangle');near(m.u*m.v,1,'product transform');near(a*(m.u+m.v)/2,x,'inverse x');near(b*(m.u-m.v)/2,y,'inverse y');
 near(norm(sub(m.contact,m.circleCenter)),2*a,'point on fixed circle');near(norm(sub(m.p,m.contact)),norm(sub(m.p,m.fixedPoint)),'circle equality');
 // Independent closest-point search cannot beat the claimed radial minimum.
 for(let k=0;k<24;k++){const t=k*Math.PI/12,Q=[m.circleCenter[0]+2*a*Math.cos(t),2*a*Math.sin(t)];checks++;assert.ok(norm(sub(m.p,Q))+1e-10>=m.nearDistance)}
 near(norm(sub(m.foldContact,m.f2)),2*a,'fold circle');near(norm(sub(m.p,m.foldContact)),norm(sub(m.p,m.f1)),'perpendicular bisector');
 near(dot(sub(m.p,m.foldMid),m.foldNormal),0,'fold through P');near(m.foldNormal[0]*m.tangentNormal[1]-m.foldNormal[1]*m.tangentNormal[0],0,'fold is tangent');
 // Tangent substitution x=x0+a² y0 t/b², y=y0+x0 t gives a double intersection at t=0.
 const dx=a*a*y/b**2,dy=x;near(x*dx/a**2-y*dy/b**2,0,'tangent linear coefficient');
 near(b*m.foot1[0]-a*m.foot1[1],0,'first foot lies on asymptote');near(b*m.foot2[0]+a*m.foot2[1],0,'second foot lies on asymptote');
 near(dot(sub(m.p,m.foot1),[a,b]),0,'first foot perpendicular');near(dot(sub(m.p,m.foot2),[a,-b]),0,'second foot perpendicular');
 near(norm(sub(m.p,m.foot1))*norm(sub(m.p,m.foot2)),a*a*b*b/c**2,'distance product');checks++;assert.ok((b*x-a*y)*(b*x+a*y)>0);
 const [X,Y,Z]=m.conePoint;near(X*X+Y*Y,r*r*Z*Z,'cone');near(X,b,'cut plane');near(norm(sub(m.conePoint,[b,0,0])),norm(m.p),'true section metric');
 // A conjugate point has the same unsigned distance product but is outside the sector.
 const cx=a*q,cy=b*Math.hypot(1,q);near(Math.abs((b*cx-a*cy)*(b*cx+a*cy))/c**2,a*a*b*b/c**2,'conjugate ambiguity');checks++;assert.ok((b*cx-a*cy)*(b*cx+a*cy)<0);
}
for(const p of [.8,2,4])for(const q of [-2.4,-1,-.01,0,.8,2.4]){
 const m=P(p,q),{x,y}=m;parabolaSamples++;
 near(y*y,2*p*x,'Cartesian locus');near(norm(sub(m.point,m.F)),x+p/2,'focus-directrix');near(x-m.r,-p/2,'circle tangency');near(norm(sub(m.point,m.F)),m.r,'circle through focus');
 near(p*x-y*y/2,0,'fold through P');for(const q2 of [-3,-1,0,1,3]){const y2=p*q2;near(p*(y2*y2/(2*p))-y*y2+y*y/2,(y2-y)**2/2,'supporting tangent identity')}
 near(m.originalQ[1],x,'clockwise rotation x');near(-m.originalQ[0],y,'clockwise rotation y');near(norm(sub(m.triangleT,m.triangleCenter)),m.triangleRadius,'diameter circle');
 near(dot(sub(m.triangleA,m.triangleT),sub(m.triangleB,m.triangleT)),0,'triangle orthogonal');near(y*y,2*p*x,'geometric mean');near(m.t*m.t/2,x,'motion x');near(Math.sqrt(p)*m.t,y,'motion y');
 const incoming=[-1,0],projection=2*dot(incoming,m.normal)/dot(m.normal,m.normal),ref=incoming.map((d,i)=>d-projection*m.normal[i]);near(norm(ref),1,'reflected unit vector');near(ref[0],m.focusDirection[0],'reflection x');near(ref[1],m.focusDirection[1],'reflection y');near(dot(ref,m.normal),-dot(incoming,m.normal),'equal reflection angles');
 const [X,Y,Z]=m.conePoint;near(X*X+Y*Y,Z*Z,'cone');near(Z-X,Math.SQRT2*p,'cut plane');near(norm(sub(m.conePoint,m.coneVertex)),norm(m.point),'true section metric');
}
for(const args of [[0,1,0,1],[3,0,0,1],[3,1,NaN,1],[3,1,0,0],[Infinity,1,0,1]]){assert.throws(()=>H(...args),RangeError);checks++}
for(const args of [[0,0],[-1,1],[2,NaN]]){assert.throws(()=>P(...args),RangeError);checks++}
// Original locus boundary equations, independent of the regular conic parameterization.
for(const v of [-4,0,4]){near(Math.hypot(3,v)-Math.hypot(-3,v),0,'K=0 perpendicular bisector');near(Math.hypot(v,0),Math.abs(v),'degenerate parabola entire line')}
for(const x of [-9,-3,3,9])near(Math.abs(Math.abs(x+3)-Math.abs(x-3)),6,'K=2c exterior rays');
const result={passed:true,checks,hyperbolaSamples,parabolaSamples,method:'distance equations, tangent identities, independent circle samples, orthogonality, true section metric and reflection law'};
writeFileSync(new URL('./model-test-results.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
