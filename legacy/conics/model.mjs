export function hyperbolaModel(a=3,ratio=.75,q=.8,branch=1){
 if(![a,ratio,q,branch].every(Number.isFinite)||a<=0||ratio<=0||![-1,1].includes(branch))throw new RangeError('要求 a>0、b/a>0 且分支为±1');
 const b=a*ratio,c=Math.hypot(a,b),e=c/a,s=branch;
 const x=s*a*Math.hypot(1,q),y=b*q,p=[x,y],f1=[-c,0],f2=[c,0];
 const r1=Math.hypot(x+c,y),r2=Math.hypot(x-c,y),directrix=a*a/c;
 const H=[directrix,y],directrixDistance=Math.abs(x-directrix);
 const circleCenter=[-s*c,0],fixedPoint=[s*c,0],circleRadius=2*a;
 const farDistance=Math.hypot(x-circleCenter[0],y),nearDistance=Math.hypot(x-fixedPoint[0],y);
 const contact=[circleCenter[0]+circleRadius*(x-circleCenter[0])/farDistance,circleRadius*y/farDistance];
 const foldContact=[c-s*circleRadius*(x-c)/r2,-s*circleRadius*y/r2];
 const foldMid=[(foldContact[0]-c)/2,foldContact[1]/2],foldNormal=[foldContact[0]+c,foldContact[1]];
 const foot1=[x-(b*x-a*y)*b/(c*c),y+(b*x-a*y)*a/(c*c)];
 const foot2=[x-(b*x+a*y)*b/(c*c),y-(b*x+a*y)*a/(c*c)];
 const d1=Math.abs(b*x-a*y)/c,d2=Math.abs(b*x+a*y)/c;
 return {a,b,ratio,q,branch:s,c,e,x,y,p,f1,f2,r1,r2,signedDifference:r1-r2,
 directrix,H,directrixDistance,triangleT:[a,a*q],hypotenuse:a*Math.hypot(1,q),
 u:x/a+y/b,v:x/a-y/b,circleCenter,fixedPoint,circleRadius,farDistance,nearDistance,
 circleDistance:farDistance-circleRadius,contact,foldContact,foldMid,foldNormal,
 tangentNormal:[x/(a*a),-y/(b*b)],foot1,foot2,d1,d2,distanceProduct:a*a*b*b/(c*c),
 conePoint:[b,y,x],coneRatio:ratio,normalized:x*x/(a*a)-y*y/(b*b)};
}
export function parabolaModel(p=2,q=.8){
 if(![p,q].every(Number.isFinite)||p<=0)throw new RangeError('要求 p>0 且参数有限');
 const x=p*q*q/2,y=p*q,point=[x,y],F=[p/2,0],H=[-p/2,y],r=(p*p+y*y)/(2*p);
 const normal=[p,-y],nn=p*p+y*y;
 const reflected=[(p*p-y*y)/nn,-2*p*y/nn];
 const t=Math.sqrt(p)*q;
 return {p,q,x,y,point,F,H,r,directrix:-p/2,foldMid:[0,y/2],normal,
 originalQ:[-y,x],triangleA:[-2*p,0],triangleB:[x,0],triangleT:[0,y],
 triangleCenter:[(x-2*p)/2,0],triangleRadius:(x+2*p)/2,
 t,velocity:[t,Math.sqrt(p)],acceleration:[1,0],reflected,
 focusDirection:[(F[0]-x)/r,-y/r],h:Math.SQRT2*p,
 coneVertex:[-p/Math.SQRT2,0,p/Math.SQRT2],
 conePoint:[(x-p)/Math.SQRT2,y,(x+p)/Math.SQRT2],
 normalized:y*y-2*p*x};
}
