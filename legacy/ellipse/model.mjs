export const MODES=['foci','directrix','compression','circles','trammel','projection','cone','equidistance'];
export function ellipseModel(a=5,ratio=.8,degrees=35){
  if(![a,ratio,degrees].every(Number.isFinite)||a<=0||ratio<=0||ratio>1)throw new RangeError('要求 a>0 且 0<b/a≤1');
  const b=a*ratio,c=a*Math.sqrt((1-ratio)*(1+ratio)),e=c/a;
  const t=degrees*Math.PI/180,co=Math.cos(t),si=Math.sin(t);
  const x=a*co,y=b*si,p=[x,y],f1=[-c,0],f2=[c,0];
  const r1=Math.hypot(x+c,y),r2=Math.hypot(x-c,y),directrix=c===0?null:a*a/c;
  const directrixDistance=directrix===null?null:directrix-x;
  const length=a+b,A=[length*co,0],B=[0,length*si];
  const projectionAngle=Math.acos(ratio),q3=[x,a*ratio*si,a*Math.sqrt((1-ratio)*(1+ratio))*si];
  const s=Math.hypot(a,b),m=c/s,h=Math.SQRT2*b*b/s;
  const center=[c/Math.SQRT2,0,s/Math.SQRT2],u=[s/(Math.SQRT2*a),0,c/(Math.SQRT2*a)];
  const conePoint=[center[0]+a*co*u[0],y,center[2]+a*co*u[2]];
  const contact=[c+2*a*(x-c)/r2,2*a*y/r2];
  return {a,b,ratio,c,e,t,degrees,p,x,y,f1,f2,r1,r2,directrix,directrixDistance,
    circleLarge:[a*co,a*si],circleSmall:[b*co,b*si],A,B,length,
    projectionAngle,q3,projected:[x,y,0],m,h,center,u,conePoint,
    circleCenter:f2,circleRadius:2*a,contact,circleDistance:2*a-r2,
    normalized:x*x/(a*a)+y*y/(b*b)};
}
