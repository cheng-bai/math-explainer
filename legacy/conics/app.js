(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],hyper=KIND==='hyperbola';
const MODES=CONTENT.map(c=>c.id),state={mode:'foci',size:hyper?3:2,ratio:.75,q:.8,branch:1,playing:false,yaw:32,rotation:1,envelope:false,conjugate:false,boundary:'normal',degenerate:false,rays:false};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,last=0,direction=1,hashTimer,dragging=false,activeWorld;
const fmt=(n,d=3)=>Number.isFinite(n)?(Math.abs(n)<.5*10**(-d)?0:n).toFixed(d):'—';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pt=p=>p.map(n=>fmt(n,2)).join(','),path=(p,close=false)=>'M'+p.map(pt).join('L')+(close?'Z':'');
const line=(a,b,cls='aux',arrow=false)=>`<path class="${cls}" d="${path([a,b])}"${arrow?' marker-end="url(#arrow)"':''}/>`;
const curve=(points,cls='curve',close=false)=>`<path class="${cls}" d="${path(points,close)}"/>`;
const text=(p,s,cls='')=>`<text class="${cls}" x="${p[0]}" y="${p[1]}">${esc(s)}</text>`;
const dot=(p,label='',cls='dot',dx=10,dy=-12)=>`<circle class="${cls}" cx="${p[0]}" cy="${p[1]}" r="5"/>${label?text([p[0]+dx,p[1]+dy],label):''}`;
const sample=(fn,min=-2.4,max=2.4,n=160)=>Array.from({length:n+1},(_,i)=>fn(min+(max-min)*i/n));
const circle=(f,center,r,cls='dim')=>curve(sample(t=>f([center[0]+r*Math.cos(t),center[1]+r*Math.sin(t)]),0,2*Math.PI),cls,true);
const model=()=>hyper?conicModel(state.size,state.ratio,state.q,state.branch):conicModel(state.size,state.q);
const at=(m,q,s=state.branch)=>hyper?[s*m.a*Math.hypot(1,q),m.b*q]:[m.p*q*q/2,m.p*q];
function world(m,ext){
 const size=hyper?m.a:m.p;
 ext=ext||(hyper?[-2.9*m.a,2.9*m.a,-2.8*m.b,2.8*m.b]:[-.95*m.p,3.5*m.p,-2.9*m.p,2.9*m.p]);
 const [xmin,xmax,ymin,ymax]=ext,scale=Math.min(700/(xmax-xmin),410/(ymax-ymin)),ox=410-(xmin+xmax)*scale/2,oy=255+(ymin+ymax)*scale/2;
 const f=p=>[ox+p[0]*scale,oy-p[1]*scale];let grid='';const step=size/2;
 for(let x=Math.ceil(xmin/step)*step;x<=xmax+step*.01;x+=step)grid+=line(f([x,ymin]),f([x,ymax]),'grid');
 for(let y=Math.ceil(ymin/step)*step;y<=ymax+step*.01;y+=step)grid+=line(f([xmin,y]),f([xmax,y]),'grid');
 if(ymin<=0&&ymax>=0)grid+=line(f([xmin,0]),f([xmax,0]),'axis')+text([f([xmax,0])[0]-12,oy+21],'x','minor-label');
 if(xmin<=0&&xmax>=0)grid+=line(f([0,ymin]),f([0,ymax]),'axis')+text([ox+9,f([0,ymax])[1]+14],'y','minor-label');
 grid+=text([ox-19,oy+20],'O','minor-label');
 for(const x of hyper?[-size,size]:[size,2*size])if(x>xmin&&x<xmax)grid+=text([f([x,0])[0]-12,oy+21],fmt(x,1),'minor-label');
 return {f,scale,grid,ext,ox,oy};
}
function infinite(w,p,d,cls='aux'){
 const [xmin,xmax,ymin,ymax]=w.ext,candidates=[];
 if(Math.abs(d[0])>1e-12)for(const x of [xmin,xmax]){const t=(x-p[0])/d[0],y=p[1]+t*d[1];if(y>=ymin-1e-9&&y<=ymax+1e-9)candidates.push([x,y])}
 if(Math.abs(d[1])>1e-12)for(const y of [ymin,ymax]){const t=(y-p[1])/d[1],x=p[0]+t*d[0];if(x>=xmin-1e-9&&x<=xmax+1e-9)candidates.push([x,y])}
 const unique=candidates.filter((p,i,a)=>!a.slice(0,i).some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-8));
 return unique.length>=2?line(w.f(unique[0]),w.f(unique[1]),cls):'';
}
function target(m,w,selectedOnly=false){if(!hyper)return curve(sample(q=>w.f(at(m,q))));return [-1,1].map(s=>curve(sample(q=>w.f(at(m,q,s))),selectedOnly&&s!==state.branch?'ref-curve':'curve')).join('')}
function mini(m,title){
 const ext=hyper?[-2.9*m.a,2.9*m.a,-2.8*m.b,2.8*m.b]:[-.35*m.p,3.3*m.p,-2.75*m.p,2.75*m.p];
 const s=Math.min(175/(ext[1]-ext[0]),105/(ext[3]-ext[2])),f=p=>[687+(p[0]-(ext[0]+ext[1])/2)*s,110-(p[1]-(ext[2]+ext[3])/2)*s];
 let out=`<g class="mini"><rect class="inset-bg" x="581" y="22" width="214" height="174" rx="6"/>${text([594,43],title)}`;
 out+=line(f([ext[0],0]),f([ext[1],0]),'axis')+line(f([0,ext[2]]),f([0,ext[3]]),'axis');
 if(hyper)for(const branch of [-1,1])out+=curve(sample(q=>f(at(m,q,branch))));else out+=curve(sample(q=>f(at(m,q))));
 out+=dot(f(hyper?m.p:m.point),'P','dot',7,-8)+text([596,182],'真实截面 · 等比例','minor-label')+'</g>';return out;
}
function sourceTriangle(m){const s=52/(m.a*Math.max(1,Math.abs(m.q))),f=p=>[618+p[0]*s,114-p[1]*s],O=f([0,0]),A=f([m.a,0]),T=f(m.triangleT);let out=`<g class="mini"><rect class="inset-bg" x="581" y="22" width="214" height="178" rx="6"/>${text([594,43],'源直角三角形')}`;
 out+=line(O,A,'dim')+line(A,T,'aux')+line(O,T,'aux')+dot(O,'O','fixed',-15,17)+dot(A,'A','fixed',7,16)+dot(T,'T','fixed',8,-9);
 out+=text([611,181],`L=${fmt(m.hypotenuse,2)}，|v|=${fmt(Math.abs(m.a*m.q),2)}`,'minor-label');
 if(Math.abs(m.q)>.001){const sign=Math.sign(m.q);out+=curve([[A[0]-8,A[1]],[A[0]-8,A[1]-sign*8],[A[0],A[1]-sign*8]],'dim')}
 return out+'</g>';
}
function sourceProduct(m){const bound=5.4,s=52/bound,f=p=>[687+p[0]*s,111-p[1]*s];let out=`<g class="mini"><rect class="inset-bg" x="581" y="22" width="214" height="178" rx="6"/>${text([594,43],'另一平面：uv=1')}`;
 out+=line(f([-bound,0]),f([bound,0]),'axis')+line(f([0,-bound]),f([0,bound]),'axis');
 for(const sign of [-1,1])out+=curve(sample(t=>f([sign*t,sign/t]),.19,5.25,100),'dim');
 out+=curve([[0,0],[m.u,0],[m.u,m.v],[0,m.v]].map(f),'aux',true)+dot(f([m.u,m.v]),'','dot');
 out+=text([768,128],'u','minor-label')+text([695,58],'v','minor-label')+text([595,183],'小图与主图的坐标不同','minor-label');return out+'</g>';
}
function space(m){
 const yaw=state.yaw*Math.PI/180,elev=hyper?18*Math.PI/180:26*Math.PI/180;
 const raw=p=>[p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),-(p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw))*Math.sin(elev)-p[2]*Math.cos(elev)];
 const H=hyper?2.9*m.a:3.4*m.p,k=hyper?m.ratio:1;
 let bounds=sample(t=>raw([k*H*Math.cos(t),k*H*Math.sin(t),H]),0,2*Math.PI,40);
 if(hyper)bounds=bounds.concat(sample(t=>raw([k*H*Math.cos(t),k*H*Math.sin(t),-H]),0,2*Math.PI,40));else bounds.push(raw([0,0,0]));
 const xs=bounds.map(p=>p[0]),ys=bounds.map(p=>p[1]),cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2;
 const s=Math.min(535/(Math.max(...xs)-Math.min(...xs)),410/(Math.max(...ys)-Math.min(...ys)));
 const f=p=>{const q=raw(p);return [320+(q[0]-cx)*s,265+(q[1]-cy)*s]};return {f,H,k};
}
function coneDrawing(m){
 const {f,H,k}=space(m);let svg='';
 for(const sign of hyper?[-1,1]:[1]){
 const ring=sample(t=>f([k*H*Math.cos(t),k*H*Math.sin(t),sign*H]),0,2*Math.PI,100);
 svg+=`<path d="${path([f([0,0,0]),...ring],true)}" fill="var(--soft)" opacity=".65" stroke="var(--line)"/>`;
 for(let t=0;t<2*Math.PI;t+=Math.PI/6)svg+=line(f([0,0,0]),f([k*H*Math.cos(t),k*H*Math.sin(t),sign*H]),'dim');svg+=curve(ring,'dim',true);
 }
 if(hyper){
 const plane=[[m.b,-2.7*m.b,-H],[m.b,2.7*m.b,-H],[m.b,2.7*m.b,H],[m.b,-2.7*m.b,H]].map(f);
 svg+=`<path d="${path(plane,true)}" fill="var(--amber)" fill-opacity=".1" stroke="var(--amber)" stroke-width="1.3"/>`;
 for(const sign of [-1,1])svg+=curve(sample(q=>f([m.b,m.b*q,sign*m.a*Math.hypot(1,q)])));
 svg+=dot(f([m.b,0,0]),'C','fixed',9,17)+dot(f(m.conePoint),'P')+mini(m,'截平面内的两支');
 }else{
 const sp=(x,y)=>[(x-m.p)/Math.SQRT2,y,(x+m.p)/Math.SQRT2];
 const plane=[[-.15*m.p,-2.8*m.p],[3.2*m.p,-2.8*m.p],[3.2*m.p,2.8*m.p],[-.15*m.p,2.8*m.p]].map(([x,y])=>f(sp(x,y)));
 svg+=`<path d="${path(plane,true)}" fill="var(--amber)" fill-opacity=".1" stroke="var(--amber)" stroke-width="1.3"/>`;
 svg+=curve(sample(q=>f(sp(m.p*q*q/2,m.p*q))))+dot(f(m.coneVertex),'V','fixed',-15,18)+dot(f(m.conePoint),'P')+mini(m,'斜截面内的真实形状');
 }
 return svg;
}
function hDrawing(m){
 let ext;
 if(state.mode==='circle'){const cc=m.circleCenter[0];ext=[Math.min(-2.9*m.a,cc-2.2*m.a),Math.max(2.9*m.a,cc+2.2*m.a),-Math.max(2.8*m.b,2.3*m.a),Math.max(2.8*m.b,2.3*m.a)]}
 if(state.mode==='fold')ext=[-2.9*m.a,Math.max(2.9*m.a,m.c+2.2*m.a),-Math.max(2.8*m.b,2.3*m.a),Math.max(2.8*m.b,2.3*m.a)];
 const w=world(m,ext),f=w.f,P=f(m.p);activeWorld=w;let svg=w.grid,metrics=[],legend=[],status='',point=m.p;
 const foci=()=>dot(f(m.f1),'F₁','fixed',-19,23)+dot(f(m.f2),'F₂','fixed',5,23);
 const axes=()=>infinite(w,[0,0],[m.a,m.b],'dim dash')+infinite(w,[0,0],[m.a,-m.b],'dim dash');
 if(state.mode==='foci'){
 if(state.boundary!=='normal'){
 const K=state.boundary==='zero'?0:state.boundary==='limit'?2*m.c:2.2*m.c;
 svg+=foci();let r1=null,r2=null;
 if(state.boundary==='zero'){point=[0,m.b*state.q];svg+=infinite(w,[0,0],[0,1],'curve')}
 else if(state.boundary==='limit'){
 for(const s of [-1,1])svg+=line(f([s*m.c,0]),f([s*w.ext[1],0]),'curve',true);
 point=[state.branch*(m.c+m.a*(state.q+2.4)/4.8),0];
 }else point=null;
 if(point){r1=Math.hypot(point[0]+m.c,point[1]);r2=Math.hypot(point[0]-m.c,point[1]);svg+=line(f(m.f1),f(point))+line(f(m.f2),f(point))+dot(f(point),'P')}
 metrics=[['距离差常数 K',fmt(K)],['PF₁',fmt(r1)],['PF₂',fmt(r2)],['实际绝对差',point?fmt(Math.abs(r1-r2)):'无解']];
 status=state.boundary==='zero'?'独立边界：K=0，轨迹是焦点连线的垂直平分线。':state.boundary==='limit'?'独立边界：K=2c，轨迹是向外两条半射线，含焦点；当前参数沿所选射线取点。':'独立边界：K>2c，反三角不等式排除所有点，轨迹为空集。';
 legend=['当前边界轨迹','焦点距离','两个固定焦点'];
 }else{
 svg+=target(m,w)+line(f(m.f1),P)+line(f(m.f2),P)+foci()+dot(P,'P');
 metrics=[['PF₁',fmt(m.r1)],['PF₂',fmt(m.r2)],['有向差 PF₁−PF₂',fmt(m.signedDifference)],['差的绝对值 2a',fmt(Math.abs(m.signedDifference))]];legend=['双曲线两支','两段焦点距离','两个固定焦点'];status=`当前为${state.branch===1?'右':'左'}支：有向差为${state.branch===1?'正':'负'}，绝对值恒为 2a。`;
 }
 }else if(state.mode==='directrix'){
 svg+=target(m,w)+infinite(w,[m.directrix,0],[0,1],'aux')+line(P,f(m.H),'aux')+line(P,f(m.f2),'dim')+dot(f(m.f2),'F','fixed',10,23)+dot(f(m.H),'H','fixed',8,18)+dot(P,'P');
 svg+=text([f([m.directrix,0])[0]+9,63],'ℓ');
 metrics=[['焦半径 PF',fmt(m.r2)],['垂距 PH',fmt(m.directrixDistance)],['实际比值 PF/PH',fmt(m.r2/m.directrixDistance)],['离心率 e',fmt(m.e)]];legend=['目标双曲线','准线与垂直距离','焦点距离'];status='左右两支使用同一个右焦点、同一条右准线。PH 使用绝对值，始终为正。';
 }else if(state.mode==='triangle'){
 svg+=axes()+target(m,w)+line(f([0,0]),f([m.x,0]),'dim')+line(f([m.x,0]),P,'aux')+dot(P,'P')+sourceTriangle(m);
 metrics=[['固定边 a',fmt(m.a)],['有向量 v=aq',fmt(m.a*m.q)],['斜边 L=|x|',fmt(m.hypotenuse)],['纵坐标 y=(b/a)v',fmt(m.y)]];legend=['目标双曲线','源三角形与纵向转移','渐近线参照'];status=Math.abs(m.q)<1e-8?'v=0：源三角形退化，目标点是所选分支的顶点。':'小图边长使用 |v|，主图纵坐标保留 v 的正负。横坐标取斜边长度的正负两种。';
 }else if(state.mode==='product'){
 svg+=axes()+target(m,w)+dot(P,'P')+sourceProduct(m);
 metrics=[['u=x/a+y/b',fmt(m.u)],['v=x/a−y/b',fmt(m.v)],['恒定乘积 uv',fmt(m.u*m.v)],['标准方程左边',fmt(m.normalized)]];legend=['目标双曲线','uv 平面的恒积矩形','主图渐近线'];status='小图在单独的 u、v 正交平面中画恒积关系；变换到主图的渐近线方向一般不互相垂直。';
 }else if(state.mode==='circle'){
 svg+=target(m,w,true)+circle(f,m.circleCenter,m.circleRadius)+line(P,f(m.fixedPoint),'focus-line')+line(P,f(m.contact),'aux')+line(f(m.circleCenter),f(m.contact),'dim dash');
 svg+=dot(f(m.circleCenter),'圆心','fixed',8,22)+dot(f(m.fixedPoint),'F*','fixed',-24,23)+dot(f(m.contact),'Q','fixed',8,-12)+dot(P,'P');
 metrics=[['点距 PF*',fmt(m.nearDistance)],['圆周最短距离 PQ',fmt(m.circleDistance)],['到圆心的距离',fmt(m.farDistance)],['定圆半径 2a',fmt(m.circleRadius)]];legend=['当前实验满足等距的一支','点距与圆周最短距离','另一支仅作灰色参照'];status=`当前固定对象只生成${state.branch===1?'右':'左'}支。切换分支会交换圆心与外定点，灰色另一支不满足本次固定对象的等距条件。`;
 }else if(state.mode==='fold'){
 svg+=target(m,w)+circle(f,m.f2,2*m.a);
 if(state.envelope)for(const s of [-1,1])for(let q=-2.4;q<2.41;q+=.3){const p=at(m,q,s);svg+=infinite(w,p,[p[1]/(m.b*m.b),p[0]/(m.a*m.a)],'envelope')}
 svg+=infinite(w,m.p,[-m.foldNormal[1],m.foldNormal[0]],'aux')+line(f(m.f1),f(m.foldContact),'dim dash')+line(P,f(m.f1),'focus-line')+line(P,f(m.foldContact),'focus-line');
 svg+=dot(f(m.f1),'F₁','fixed',-23,22)+dot(f(m.f2),'F₂','fixed',7,23)+dot(f(m.foldContact),'Q','fixed',9,-10)+dot(P,'P');
 metrics=[['PF₁',fmt(m.r1)],['PQ',fmt(Math.hypot(m.x-m.foldContact[0],m.y-m.foldContact[1]))],['Q 到圆心 F₂',fmt(2*m.a)],['Q 的角色',state.branch===1?'最远点':'最近点']];legend=['目标双曲线与等长线段','当前折痕与折痕族','固定圆与 F₁Q'];status=state.branch===1?'右支的 Q 是最远圆周点；不能把 PF₁=PQ 称作到圆周最短距离相等。':'左支的 Q 是最近圆周点。折痕为 F₁Q 的垂直平分线，并在 P 处与双曲线相切。';
 }else if(state.mode==='distances'){
 svg+=axes()+target(m,w);
 if(state.conjugate)for(const s of [-1,1])svg+=curve(sample(q=>f([m.a*q,s*m.b*Math.hypot(1,q)])),'extra-curve');
 svg+=line(P,f(m.foot1),'aux')+line(P,f(m.foot2),'aux')+dot(f(m.foot1),'H₁','fixed',8,-10)+dot(f(m.foot2),'H₂','fixed',8,19)+dot(P,'P');
 metrics=[['到渐近线距离 d₁',fmt(m.d1)],['到渐近线距离 d₂',fmt(m.d2)],['距离积 d₁d₂',fmt(m.d1*m.d2)],['固定值 a²b²/c²',fmt(m.distanceProduct)]];legend=['限水平扇区的目标曲线','垂距与额外共轭曲线','两条渐近线'];status=state.conjugate?'漏掉扇区条件，额外出现上下方向的共轭双曲线（虚线）。它也满足相同的非负距离积。':'距离积不含代数符号，必须限制在左右扇区，才恰好得到目标曲线。';
 }
 return {svg,metrics,legend,status,point};
}
function pDrawing(m){
 let ext;
 if(state.mode==='foci'&&state.degenerate)ext=[-3*m.p,3*m.p,-2.9*m.p,2.9*m.p];
 if(state.mode==='quadratic')ext=[-3.4*m.p,3.4*m.p,-3*m.p,3.5*m.p];
 if(state.mode==='triangle')ext=[-2.4*m.p,3.4*m.p,-3*m.p,3*m.p];
 if(state.mode==='circle'){const R=m.r,extent=Math.max(2.9*m.p,Math.abs(m.y)+R+.2*m.p);ext=[Math.min(-.95*m.p,m.x-R-.2*m.p),Math.max(3.5*m.p,m.x+R+.2*m.p),-extent,extent]}
 const w=world(m,ext),f=w.f,P=f(m.point);activeWorld=w;let svg=w.grid,metrics=[],legend=[],status='',point=m.point;
 const focus=()=>dot(f(m.F),'F','fixed',8,23),directrix=()=>infinite(w,[-m.p/2,0],[0,1],'aux')+text([f([-m.p/2,0])[0]-17,63],'ℓ');
 if(state.mode==='foci'){
 if(state.degenerate){point=[m.p*m.q,0];const origin=f([0,0]);svg+=infinite(w,[0,0],[0,1],'aux')+infinite(w,[0,0],[1,0],'curve')+line(origin,f(point),'dim')+dot(origin,'F=H','fixed',-32,22)+dot(f(point),'P');metrics=[['到 F 的距离',fmt(Math.abs(point[0]))],['到准线距离',fmt(Math.abs(point[0]))],['距离相等','成立'],['原点处的比值','0/0 无定义']];legend=['退化后的整条直线','过 F 的准线','点距与垂距'];status='独立边界：F 落在准线上。距离等式的轨迹为整条 y=0，包含原点；原点处不能写有效距离比。'}
 else{svg+=target(m,w)+directrix()+line(P,f(m.F),'focus-line')+line(P,f(m.H),'aux')+focus()+dot(f(m.H),'H','fixed',-18,20)+dot(P,'P');metrics=[['焦半径 PF',fmt(m.r)],['准线垂距 PH',fmt(m.x+m.p/2)],['离心率 e',fmt(1)],['顶点到焦点 p/2',fmt(m.p/2)]];legend=['抛物线与动点 P','准线与垂距 PH','焦点距离 PF'];status='p 是焦点到准线的距离；顶点到焦点是 p/2。点到准线取垂距，PF=PH。'}
 }else if(state.mode==='circle'){
 svg+=target(m,w)+directrix()+circle(f,m.point,m.r)+line(P,f(m.F),'focus-line')+line(P,f(m.H),'aux')+focus()+dot(f(m.H),'H','fixed',-18,18)+dot(P,'圆心 P');
 metrics=[['圆半径 r',fmt(m.r)],['圆心到 F',fmt(m.r)],['圆心到准线',fmt(m.x+m.p/2)],['圆的最左点 x',fmt(m.x-m.r)]];legend=['圆心 P 的轨迹','准线与半径 PH','过 F 的动圆'];status='圆的最左点横坐标恒为 −p/2，正是准线；圆心 P 才是轨迹点。';
 }else if(state.mode==='fold'){
 svg+=target(m,w)+directrix();
 if(state.envelope)for(let q=-2.4;q<2.41;q+=.3){const p=at(m,q);svg+=infinite(w,p,[p[1],m.p],'envelope')}
 svg+=infinite(w,m.point,[m.y,m.p],'aux')+line(f(m.F),f(m.H),'dim dash')+line(P,f(m.F),'focus-line')+line(P,f(m.H),'focus-line')+focus()+dot(f(m.H),'H','fixed',-17,20)+dot(P,'P');
 metrics=[['PF',fmt(m.r)],['PH',fmt(m.x+m.p/2)],['折痕接触点 y₀',fmt(m.y)],['代入折痕的值',fmt(m.p*m.x-m.y*m.y+m.y*m.y/2)]];legend=['抛物线与两段等距','当前折痕及折痕族','F 与 H 的连线'];status=Math.abs(m.q)<1e-8?'顶点折痕为竖直线 x=0；无需除以 y₀，所以不会漏掉它。':'折痕是 FH 的垂直平分线；完全平方证明全曲线在其同侧且只在 P 接触。';
 }else if(state.mode==='quadratic'){
 const rotate=p=>{const a=-Math.PI/2*state.rotation;return [p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)]};
 svg+=curve(sample(q=>f([-m.p*q,m.p*q*q/2])),'dim')+target(m,w);
 if(state.rotation<.9999)svg+=curve(sample(q=>f(rotate([-m.p*q,m.p*q*q/2]))),'aux');
 svg+=dot(f(m.originalQ),'Q','fixed',-18,-12)+dot(P,'P');if(state.rotation<.9999)svg+=dot(f(rotate(m.originalQ)),'过渡点','fixed',9,18);
 metrics=[['源横坐标 u',fmt(-m.y)],['源纵坐标 u²/(2p)',fmt(m.x)],['目标横坐标 x',fmt(m.x)],['目标纵坐标 y',fmt(m.y)]];legend=['最终目标曲线 P','旋转过渡形状','原二次函数 Q'];status=state.rotation<.9999?'辅助颜色表示当前旋转过渡；目标曲线 P 与读数始终对应旋转满 90° 后的位置。':'顺时针 90°：坐标 (u,v) 变成 (v,−u)。整条目标不是单值函数 y=f(x)。';
 }else if(state.mode==='triangle'){
 svg+=circle(f,m.triangleCenter,m.triangleRadius,'dim')+target(m,w)+line(f(m.triangleA),f(m.triangleT),'aux')+line(f(m.triangleT),f(m.triangleB),'aux')+line(f(m.triangleA),f(m.triangleB),'dim')+line(f([0,0]),f(m.triangleT),'focus-line')+line(f(m.triangleT),P,'dim dash')+line(f(m.triangleB),P,'dim dash');
 svg+=dot(f(m.triangleA),'A','fixed',-18,21)+dot(f(m.triangleB),'B','fixed',10,22)+dot(f(m.triangleT),'T','fixed',-20,-10)+dot(P,'P');
 if(Math.abs(m.q)>.001){const T=f(m.triangleT),A=f(m.triangleA),B=f(m.triangleB),ua=[A[0]-T[0],A[1]-T[1]],ub=[B[0]-T[0],B[1]-T[1]],la=Math.hypot(...ua),lb=Math.hypot(...ub),a=ua.map(v=>v/la*9),b=ub.map(v=>v/lb*9);svg+=curve([[T[0]+a[0],T[1]+a[1]],[T[0]+a[0]+b[0],T[1]+a[1]+b[1]],[T[0]+b[0],T[1]+b[1]]],'dim')}
 metrics=[['固定段 AO=2p',fmt(2*m.p)],['变化段 OB=x',fmt(m.x)],['高的平方 TO²',fmt(m.y*m.y)],['两段乘积 AO·OB',fmt(2*m.p*m.x)]];legend=['目标点 P 与高 TO','直角三角形 ATB','以 AB 为直径的圆'];status=Math.abs(m.q)<1e-8?'顶点特例：B、O、T、P 重合，三角形退化；不标不存在的直角。':'直角在 T。高的长度为 |y|；上、下两个 T 都使用同一条几何平均关系。';
 }else if(state.mode==='motion'){
 svg+=target(m,w)+dot(P,'P');const vx=[m.x+.55*m.velocity[0],m.y],vy=[m.x,m.y+.55*m.velocity[1]],v=[vx[0],vy[1]];
 svg+=line(P,f(vx),'motion-vector',true)+line(P,f(vy),'motion-vector',true)+line(P,f(v),'dim dash',true)+text([f(vx)[0]+8,f(vx)[1]+17],'vₓ')+text([f(vy)[0]+8,f(vy)[1]-8],'vᵧ');
 metrics=[['相对时刻 t',fmt(m.t)],['横向速度 vₓ=t',fmt(m.velocity[0])],['纵向速度 vᵧ',fmt(m.velocity[1])],['横向加速度',fmt(1)]];legend=['位置轨迹与 P','速度分量（共同尺度）','合速度方向'];status=(m.t<0?'当前为负时刻，表示向过去延拓。':'当前为非负时刻。')+' 从顶点 t=0 只向前走、且纵向速度为正时，只覆盖上半部分；动画往返是观察控制。';
 }else if(state.mode==='reflection'){
 svg+=target(m,w);
 if(state.rays)for(const q of [-2,-1,0,1,2]){const p=at(m,q);svg+=line(f([3.4*m.p,p[1]]),f(p),'envelope')+line(f(p),f(m.F),'envelope')}
 svg+=infinite(w,m.point,[m.y,m.p],'dim dash')+line(f([3.4*m.p,m.y]),P,'ray',true)+line(P,f(m.F),'ray',true);
 const len=Math.hypot(...m.normal);svg+=line(P,f([m.x+.45*m.p*m.normal[0]/len,m.y+.45*m.p*m.normal[1]/len]),'dim')+focus()+dot(P,'P');
 const error=Math.hypot(m.reflected[0]-m.focusDirection[0],m.reflected[1]-m.focusDirection[1]);
 metrics=[['到焦点 PF',fmt(m.r)],['反射单位方向 x',fmt(m.reflected[0])],['反射单位方向 y',fmt(m.reflected[1])],['方向核验误差',fmt(error)]];legend=['目标抛物线','入射与反射光线','切线及法线参照'];status='光从开口右侧水平向左射入，再从 P 指向 F。反射方向与归一化的 F−P 完全一致；这是性质验证。';
 }
 return {svg,metrics,legend,status,point};
}
function drawing(m){
 let d,view='等比例正视图 · 有限画幅',hint='拖动点的位置 · ↑ ↓ 调节 q · 空格播放';
 if(state.mode==='cone'){
 activeWorld=null;view='透明空间示意 + 真实截面';hint='调节观察方位 · 主图空间长度不按屏幕线长读取';
 d={svg:coneDrawing(m),point:hyper?m.p:m.point,legend:['真实截线','截平面','有限高度的透明圆锥'],metrics:hyper?[['真实实半轴 a',fmt(m.a)],['真实虚半轴 b',fmt(m.b)],['圆锥开口比 b/a',fmt(m.ratio)],['所在圆锥叶',state.branch===1?'上叶':'下叶']]:[['焦准距 p',fmt(m.p)],['平面截距 h=√2p',fmt(m.h)],['世界高度 ζ',fmt(m.conePoint[2])],['截面真实横坐标',fmt(m.x)]],status:hyper?'两支分别位于上下两叶。改变 b/a 同时改变圆锥开口，截面内 x=ζ、y=η 是真实单位正交坐标。':'固定 45° 圆锥；截平面平行于一条母线。真实截面横坐标从顶点沿斜面量取，不是世界 ξ。'};
 }else d=hyper?hDrawing(m):pDrawing(m);
 $('#diagram').innerHTML='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="var(--amber)" stroke-width="1.4"/></marker></defs>'+d.svg;
 const disabled=state.mode==='cone'||(state.mode==='foci'&&(hyper?state.boundary!=='normal':state.degenerate));
 $('#diagram').classList.toggle('draggable',!disabled);$('#diagram').setAttribute('aria-label',CONTENT.find(c=>c.id===state.mode).title+'。'+d.status);
 $('#view-label').textContent=view;$('#hint').textContent=disabled&&state.mode!=='cone'?'独立边界示意 · 用位置参数调节':' '+hint;
 $('#point-readout').textContent=d.point?`P (${fmt(d.point[0],2)}, ${fmt(d.point[1],2)})`:'无满足条件的点';
 $('#legend').innerHTML=d.legend.map(s=>'<span>'+esc(s)+'</span>').join('');$('#metrics').innerHTML=d.metrics.map(([label,value])=>`<div class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('');
 if($('#status').textContent!==d.status)$('#status').textContent=d.status;
}
function render(){const m=model();$('#size').value=state.size;$('#size-out').textContent=fmt(state.size,1);$('#param').value=state.q;$('#param-out').textContent=fmt(state.q,2);if(hyper){$('#ratio').value=state.ratio;$('#ratio-out').textContent=fmt(state.ratio,2);$$('[data-branch]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.branch)===state.branch))}
 const boundary=state.mode==='foci'&&(hyper?state.boundary!=='normal':state.degenerate);
 $('#shared-values').textContent=(boundary?'以下普通曲线参数不适用于当前独立边界示意：':'')+(hyper?`a=${fmt(m.a,2)}　b=${fmt(m.b,2)}　c=${fmt(m.c,2)}　e=${fmt(m.e,3)}`:`p=${fmt(m.p,2)}　顶点到焦点=${fmt(m.p/2,2)}　e=1`);
 drawing(m);window.conicLab={kind:KIND,state:{...state},model:m};}
function modeControls(){let html='';
 if(state.mode==='foci')html=hyper?`<label for="boundary-case">距离差边界 <select id="boundary-case"><option value="normal">普通：K=2a</option><option value="zero">K=0：垂直平分线</option><option value="limit">K=2c：向外两射线</option><option value="empty">K>2c：无解</option></select></label>`:`<label><input id="degenerate" type="checkbox" ${state.degenerate?'checked':''}> 焦点落在准线上（独立边界）</label>`;
 if(state.mode==='cone')html=`<label for="yaw">观察方位 <input id="yaw" type="range" min="-80" max="80" step="1" value="${state.yaw}"><output id="yaw-out">${state.yaw}°</output></label>`;
 if(state.mode==='fold')html=`<label><input id="envelope" type="checkbox" ${state.envelope?'checked':''}> 保留更多折痕，观察切线包络</label>`;
 if(state.mode==='distances')html=`<label><input id="conjugate" type="checkbox" ${state.conjugate?'checked':''}> 漏掉扇区条件：显示额外共轭曲线</label>`;
 if(state.mode==='quadratic')html=`<label for="rotation">旋转过程 0° → 90° <input id="rotation" type="range" min="0" max="1" step=".01" value="${state.rotation}"></label>`;
 if(state.mode==='reflection')html=`<label><input id="rays" type="checkbox" ${state.rays?'checked':''}> 显示多条平行入射光线</label>`;
 $('#mode-controls').innerHTML=html;
 if($('#boundary-case')){$('#boundary-case').value=state.boundary;$('#boundary-case').addEventListener('change',e=>{play(false);state.boundary=e.target.value;render();saveHash()})}
 for(const id of ['degenerate','envelope','conjugate','rays'])if($('#'+id))$('#'+id).addEventListener('change',e=>{state[id]=e.target.checked;render();saveHash()});
 for(const id of ['yaw','rotation'])if($('#'+id))$('#'+id).addEventListener('input',e=>{state[id]=+e.target.value;if(id==='yaw')$('#yaw-out').textContent=state.yaw+'°';render();saveHash()});
}
function switchMode(mode,save=true){if(!MODES.includes(mode))return;state.mode=mode;const c=CONTENT.find(c=>c.id===mode);$$('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1});$('#experiment').setAttribute('aria-labelledby','tab-'+mode);$('#figure-no').textContent='FIG. 0'+(MODES.indexOf(mode)+1);
 for(const [id,value] of [['category',c.category],['mode-title',c.title],['mode-intro',c.intro],['condition',c.condition],['watch',c.watch],['question',c.question],['boundary',c.boundary]])$('#'+id).textContent=value;
 $('#formula').innerHTML=c.formula;$('#steps').innerHTML=c.steps.map(s=>'<li>'+esc(s)+'</li>').join('');$('#proof-body').innerHTML=c.proof.map(s=>'<p>'+s+'</p>').join('');modeControls();render();if(save)saveHash();}
function hash(){return new URLSearchParams({mode:state.mode,size:fmt(state.size,1),r:fmt(state.ratio,2),q:fmt(state.q,2),branch:state.branch,boundary:state.boundary,degenerate:state.degenerate?'1':'0',yaw:fmt(state.yaw,0),rotation:fmt(state.rotation,2),envelope:state.envelope?'1':'0',conjugate:state.conjugate?'1':'0',rays:state.rays?'1':'0'}).toString()}
function saveHash(){clearTimeout(hashTimer);hashTimer=setTimeout(()=>{try{history.replaceState(null,'','#'+hash())}catch{}},180)}
function readHash(){const params=new URLSearchParams(location.hash.slice(1));if(MODES.includes(params.get('mode')))state.mode=params.get('mode');for(const [key,min,max] of [['size',hyper?1.5:.8,hyper?5:4],['r',.35,1.5],['q',-2.4,2.4],['yaw',-80,80],['rotation',0,1]])if(params.has(key)){const v=Number(params.get(key));if(Number.isFinite(v))state[key==='r'?'ratio':key]=Math.max(min,Math.min(max,v))}
 if([-1,1].includes(Number(params.get('branch'))))state.branch=Number(params.get('branch'));if(['normal','zero','limit','empty'].includes(params.get('boundary')))state.boundary=params.get('boundary');for(const key of ['degenerate','envelope','conjugate','rays'])if(params.has(key))state[key]=params.get(key)==='1';switchMode(state.mode,false)}
function play(value){state.playing=Boolean(value)&&!reduced.matches;$('#play').textContent=state.playing?'Ⅱ 暂停轨迹':'▶ 播放轨迹';$('#play').setAttribute('aria-pressed',state.playing);last=0;}
for(const [id,key] of [['size','size'],['ratio','ratio'],['param','q']])if($('#'+id))$('#'+id).addEventListener('input',e=>{play(false);state[key]=+e.target.value;render();saveHash()});
$$('[data-mode]').forEach(b=>{b.addEventListener('click',()=>switchMode(b.dataset.mode));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();let i=MODES.indexOf(state.mode);i=e.key==='Home'?0:e.key==='End'?7:(i+(e.key==='ArrowRight'?1:7))%8;switchMode(MODES[i]);$('#tab-'+MODES[i]).focus()}})});
$$('[data-branch]').forEach(b=>b.addEventListener('click',()=>{play(false);state.branch=Number(b.dataset.branch);render();saveHash()}));
$$('[data-q]').forEach(b=>b.addEventListener('click',()=>{play(false);state.q=Number(b.dataset.q);render();saveHash()}));
$('#play').addEventListener('click',()=>play(!state.playing));$('#reset').addEventListener('click',()=>{play(false);Object.assign(state,{size:hyper?3:2,ratio:.75,q:.8,branch:1,yaw:32,rotation:1,envelope:false,conjugate:false,boundary:'normal',degenerate:false,rays:false});direction=1;modeControls();render();saveHash()});
$('#theme').addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'浅色纸面':'深色纸面'});
const diagram=$('#diagram');diagram.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End',' '].includes(e.key)){e.preventDefault();if(e.key===' ')play(!state.playing);else{play(false);if(e.key==='Home')state.q=0;else if(e.key==='End')state.q=2.4;else state.q=Math.max(-2.4,Math.min(2.4,state.q+(['ArrowUp','ArrowRight'].includes(e.key)?1:-1)*(e.shiftKey?.1:.01)));render();saveHash()}}});
function pointer(e){if(!activeWorld||!diagram.classList.contains('draggable'))return;const box=diagram.getBoundingClientRect(),x=((e.clientX-box.left)/box.width*820-activeWorld.ox)/activeWorld.scale,y=(activeWorld.oy-(e.clientY-box.top)/box.height*510)/activeWorld.scale;
 play(false);state.q=Math.max(-2.4,Math.min(2.4,y/(hyper?state.size*state.ratio:state.size)));if(hyper&&Math.abs(x)>state.size*.3)state.branch=x<0?-1:1;render();saveHash();}
diagram.addEventListener('pointerdown',e=>{if(!diagram.classList.contains('draggable'))return;dragging=true;diagram.setPointerCapture(e.pointerId);pointer(e)});diagram.addEventListener('pointermove',e=>{if(dragging)pointer(e)});diagram.addEventListener('pointerup',()=>dragging=false);diagram.addEventListener('pointercancel',()=>dragging=false);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0},{threshold:.05}).observe(diagram);document.addEventListener('visibilitychange',()=>last=0);
function motionSetting(){if(reduced.matches)play(false);$('#play').disabled=reduced.matches;$('#motion-note').textContent=reduced.matches?'系统减弱动态已启用；自动播放关闭，仍可手动拖动、调参和用方向键。':`默认静止。播放在有限参数区间往返${hyper?'，沿当前分支运动，不跨越两支':''}；往返是观察控制。`}reduced.addEventListener('change',motionSetting);
function frame(now){if(state.playing&&visible&&!document.hidden&&!dragging){if(last){state.q+=direction*Math.min(now-last,100)*.00055;if(state.q>=2.4){state.q=2.4;direction=-1}if(state.q<=-2.4){state.q=-2.4;direction=1}}render();last=now}else last=0;requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.addEventListener('hashchange',readHash);$('#copy-link').addEventListener('click',async()=>{clearTimeout(hashTimer);try{history.replaceState(null,'','#'+hash());await navigator.clipboard.writeText(location.href);$('#copy-result').textContent='已复制本机实验链接；分享网页请发送 HTML'}catch{$('#copy-result').textContent='参数已保存到地址栏。分享给别人请发送 HTML 文件。'}});window.addEventListener('beforeprint',()=>$('#proof').open=true);
readHash();motionSetting();})();
