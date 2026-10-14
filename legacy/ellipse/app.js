(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={mode:'foci',a:5,ratio:.8,degrees:35,playing:false,blend:1,yaw:32,boundary:false};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let visible=true,last=0,hashTimer;
const fmt=(n,d=3)=>Number.isFinite(n)?n.toFixed(d):'—';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pt=p=>p.map(n=>fmt(n,2)).join(',');
const path=(points,close=false)=>'M'+points.map(pt).join('L')+(close?'Z':'');
const line=(p,q,cls='aux')=>`<path class="${cls}" d="${path([p,q])}"/>`;
const dot=(p,label='',cls='dot',dx=10,dy=-12)=>`<circle class="${cls}" cx="${p[0]}" cy="${p[1]}" r="5"/>${label?`<text x="${p[0]+dx}" y="${p[1]+dy}">${escape(label)}</text>`:''}`;
const curve=(points,cls='curve',close=true)=>`<path class="${cls}" d="${path(points,close)}"/>`;
const sample=(fn,n=180)=>Array.from({length:n+1},(_,i)=>fn(i/n*Math.PI*2));
function world(m,custom){
 let ext=custom||[-m.a*1.3,m.a*1.3,-m.a*1.23,m.a*1.23];
 const [xmin,xmax,ymin,ymax]=ext,scale=Math.min(700/(xmax-xmin),410/(ymax-ymin));
 const ox=410-(xmin+xmax)/2*scale,oy=255+(ymin+ymax)/2*scale;
 const f=p=>[ox+p[0]*scale,oy-p[1]*scale];
 let grid='';const step=m.a/5;
 for(let x=Math.ceil(xmin/step)*step;x<=xmax;x+=step)grid+=line(f([x,ymin]),f([x,ymax]),'grid');
 for(let y=Math.ceil(ymin/step)*step;y<=ymax;y+=step)grid+=line(f([xmin,y]),f([xmax,y]),'grid');
 grid+=line(f([xmin,0]),f([xmax,0]),'axis')+line(f([0,ymin]),f([0,ymax]),'axis');
 grid+=`<text class="minor-label" x="${f([xmax,0])[0]-15}" y="${oy+20}">x</text><text class="minor-label" x="${ox+10}" y="${f([0,ymax])[1]+15}">y</text>`;
 grid+=`<text class="minor-label" x="${ox-18}" y="${oy+19}">O</text>`;
 for(const val of [-m.a,m.a])grid+=`<text class="minor-label" x="${f([val,0])[0]-12}" y="${oy+22}">${fmt(val,1)}</text>`;
 const ellipse=curve(sample(t=>f([m.a*Math.cos(t),m.b*Math.sin(t)])));
 return {f,scale,grid,ellipse};
}
function mini(m,title){
 const cx=678,cy=104,s=70/m.a;
 return `<g class="mini"><rect x="581" y="22" width="214" height="170" rx="6" fill="var(--paper)" stroke="var(--line)"/><text x="595" y="44">${title}</text>${line([598,cy],[778,cy],'axis')}${line([cx,56],[cx,157],'axis')}${curve(sample(t=>[cx+s*m.a*Math.cos(t),cy-s*m.b*Math.sin(t)]))}${dot([cx+s*m.x,cy-s*m.y],'P','dot',8,-8)}<text class="minor-label" x="604" y="179">真实半轴 a、b · 等比例</text></g>`;
}
function space(m){
 const yaw=state.yaw*Math.PI/180,elev=26*Math.PI/180;
 const raw=p=>[p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),-(p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw))*Math.sin(elev)-p[2]*Math.cos(elev)];
 const H=1.75*m.a;
 const bounds=state.mode==='cone'?sample(t=>raw([H*Math.cos(t),H*Math.sin(t),H])).concat([raw([0,0,0])]):[[-1.6*m.a,-2*m.a],[1.6*m.a,1*m.a]];
 const xs=bounds.map(p=>p[0]),ys=bounds.map(p=>p[1]);
 const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 const scale=Math.min(535/(xmax-xmin),365/(ymax-ymin));
 const f=p=>{const q=raw(p);return [320+(q[0]-(xmin+xmax)/2)*scale,278+(q[1]-(ymin+ymax)/2)*scale]};
 return {f,H,scale};
}
function drawing(m){
 const mode=state.mode;let svg='',legend=[],metrics=[],status='',view='等比例正视图',hint='拖动图中笔尖 · ← → 调整参数角';
 if(mode==='projection'||mode==='cone'){
 const {f,H}=space(m);view='空间姿态示意 + 真实截面';hint='调节观察方位 · 图中角度与长度由模型计算';
 if(mode==='projection'){
 const lift=m.a*Math.sin(m.projectionAngle)+.7;
 const q=t=>[m.a*Math.cos(t),m.b*Math.sin(t),m.c*Math.sin(t)+lift];
 const projected=t=>[m.a*Math.cos(t),m.b*Math.sin(t),0];
 svg+=curve([[-1.25*m.a,-1.3*m.a,0],[1.25*m.a,-1.3*m.a,0],[1.25*m.a,1.3*m.a,0],[-1.25*m.a,1.3*m.a,0]].map(f),'board');
 svg+=line(f([-m.a*1.2,0,0]),f([m.a*1.2,0,0]),'axis')+line(f([0,-m.a*1.2,0]),f([0,m.a*1.2,0]),'axis');
 for(let t=0;t<2*Math.PI;t+=Math.PI/6)svg+=line(f(q(t)),f(projected(t)),'dim dash');
 svg+=curve(sample(t=>f(projected(t))),'curve')+curve(sample(t=>f(q(t))),'aux');
 const Q=q(m.t),P=projected(m.t);svg+=line(f(Q),f(P),'aux')+dot(f(Q),'Q','fixed')+dot(f(P),'P')+mini(m,'投影面正视图');
 legend=['投影椭圆','倾斜圆与投射线','平行线垂直于投影面'];
 metrics=[['倾角 β',fmt(m.projectionAngle*180/Math.PI,1)+'°'],['半径 a',fmt(m.a)],['a cos β',fmt(m.a*Math.cos(m.projectionAngle))],['半短轴 b',fmt(m.b)]];
 status='空间图将圆整体抬高以便观察；竖直投射保持 x、y，读数不受抬高和观察方位影响。';
 }else{
 const base=sample(t=>f([H*Math.cos(t),H*Math.sin(t),H]));
 // Transparent geometry allows the full closed section to be inspected.
 svg+=`<path d="${path([f([0,0,0]),...base],true)}" fill="var(--soft)" opacity=".6" stroke="var(--line)"/>`;
 for(let t=0;t<2*Math.PI;t+=Math.PI/8)svg+=line(f([0,0,0]),f([H*Math.cos(t),H*Math.sin(t),H]),'dim');
 svg+=curve(base,'dim');
 const point=(u,v)=>[m.center[0]+u*m.u[0],v,m.center[2]+u*m.u[2]];
 const plane=[[-1.13*m.a,-1.16*m.b],[1.13*m.a,-1.16*m.b],[1.13*m.a,1.16*m.b],[-1.13*m.a,1.16*m.b]].map(([u,v])=>f(point(u,v)));
 svg+=`<path d="${path(plane,true)}" fill="var(--amber)" fill-opacity=".12" stroke="var(--amber)" stroke-width="1.4"/>`;
 svg+=line(f(point(-m.a,0)),f(point(m.a,0)),'aux dash')+line(f(point(0,-m.b)),f(point(0,m.b)),'aux dash');
 svg+=curve(sample(t=>f(point(m.a*Math.cos(t),m.b*Math.sin(t)))))+dot(f(m.conePoint),'P')+dot(f(m.center),'C','fixed',10,18)+mini(m,'截平面内的真实形状');
 legend=['真实圆锥截线','斜截平面','透明圆锥示意'];
 metrics=[['平面斜率 m',fmt(m.m)],['截距 h',fmt(m.h)],['截面半长轴',fmt(m.a)],['截面半短轴',fmt(m.b)]];
 status='截线每个点同时满足 x²+y²=z² 与 z=h+mx。真实长度在斜平面内计算；透明显示用于看清完整截线。';
 }
 }else{
 let ext;
 if(mode==='directrix'&&m.directrix!==null){const d=Math.min(m.directrix,1.9*m.a);ext=[-1.25*m.a,d+.25*m.a,-1.2*m.a,1.2*m.a]}
 if(mode==='trammel')ext=[-1.15*m.length,1.15*m.length,-1.15*m.length,1.15*m.length];
 if(mode==='equidistance')ext=[-3.4*m.a,3.3*m.a,-2.25*m.a,2.25*m.a];
 const {f,scale,grid,ellipse}=world(m,ext),P=f(m.p);svg+=grid;
 if(mode==='foci'){
 svg+=ellipse+line(f(m.f1),P)+line(P,f(m.f2))+dot(f(m.f1),'F₁','fixed',-18,22)+dot(f(m.f2),'F₂','fixed',4,22)+dot(P,'P');
 legend=['椭圆与动点 P','两段焦点距离','定点 F₁、F₂'];
 metrics=[['PF₁',fmt(m.r1)],['PF₂',fmt(m.r2)],['两距离之和',fmt(m.r1+m.r2)],['固定值 2a',fmt(2*m.a)]];
 status=m.c===0?'两焦点重合，轨迹是半径为 a 的圆。':'两段距离分别变化，和恒为 2a。';
 }else if(mode==='directrix'){
 svg+=ellipse;
 if(m.directrix===null){svg+=dot([410,255],'F₁=F₂','fixed',10,20)+dot(P,'P');status='圆边界：c=0，有限准线不存在，距离比读数不适用。'}
 else{
 const shown=Math.min(m.directrix,1.9*m.a),H=f([shown,m.y]);
 svg+=line(f([shown,-m.a*1.05]),f([shown,m.a*1.05]),'aux')+line(f(m.f2),P,'dim')+line(P,H)+dot(f(m.f2),'F','fixed',4,22)+dot(P,'P')+dot(H,'H','fixed',8,-12);
 const side=m.y>=0?1:-1;svg+=curve([H,[H[0]-9,H[1]],[H[0]-9,H[1]+side*9],[H[0],H[1]+side*9]],'dim',false);
 svg+=`<text x="${f([shown,0])[0]-30}" y="${f([shown,m.a*1.05])[1]-12}">ℓ</text>`;
 if(m.directrix>shown){const x=(P[0]+H[0])/2;svg+=line([x-8,P[1]-5],[x-3,P[1]+5],'dim')+line([x+2,P[1]-5],[x+7,P[1]+5],'dim');status=`准线 x=${fmt(m.directrix)} 超出画幅；PH 采用省略延伸画法，读数使用真实距离。`}
 else status='PH 垂直于准线；图中两种距离和比值来自真实平面坐标。';
 }
 legend=['椭圆与动点 P','准线与垂线 PH','焦半径 PF'];metrics=[['焦半径 PF',fmt(m.r2)],['准线距离 PH',fmt(m.directrixDistance)],['实际比值',m.c===0?'不适用':fmt(m.r2/m.directrixDistance)],['离心率 e',fmt(m.e)]];
 }else if(mode==='compression'){
 const r=1-(1-m.ratio)*state.blend,current=[m.x,m.a*r*Math.sin(m.t)];
 svg+=curve(sample(t=>f([m.a*Math.cos(t),m.a*Math.sin(t)])),'dim')+ellipse;
 if(state.blend<1)svg+=curve(sample(t=>f([m.a*Math.cos(t),m.a*r*Math.sin(t)])),'aux');
 svg+=line(f(m.circleLarge),P,'dim dash')+dot(f(m.circleLarge),'Q','fixed',10,-13)+dot(P,'P','dot',10,20);
 if(state.blend<1)svg+=dot(f(current),'过渡点','fixed',9,-12);
 legend=['目标椭圆 P','压缩过渡形状','原圆 Q'];metrics=[['横坐标 x',fmt(m.x)],['原纵坐标',fmt(m.circleLarge[1])],['目标纵坐标',fmt(m.y)],['压缩倍率 b/a',fmt(m.ratio)]];
 status=state.blend<1?'赭色是压缩过渡形状，蓝绿曲线始终表示目标椭圆；数值对应目标点 P。':'只缩放纵坐标，横坐标不动。';
 }else if(mode==='circles'){
 svg+=curve(sample(t=>f([m.a*Math.cos(t),m.a*Math.sin(t)])),'dim')+curve(sample(t=>f([m.b*Math.cos(t),m.b*Math.sin(t)])),'dim')+ellipse;
 svg+=line(f([0,0]),f(m.circleLarge),'aux')+line(f(m.circleLarge),P,'aux dash')+line(f(m.circleSmall),P,'aux dash')+dot(f(m.circleLarge),'Q','fixed',10,-12)+dot(f(m.circleSmall),'R','fixed',-20,-12)+dot(P,'P','dot',10,20);
 legend=['构造点 P 的轨迹','公共射线与投影线','大小同心圆'];metrics=[['公共参数角 t',fmt(m.degrees,0)+'°'],['P 的横坐标',fmt(m.x)],['P 的纵坐标',fmt(m.y)],['OP 极角',fmt((Math.atan2(m.y,m.x)*180/Math.PI+360)%360,1)+'°']];status='Q、R 来自同一条射线。一般情况下，参数角 t 与 OP 的极角不同。';
 }else if(mode==='trammel'){
 svg+=`<path d="${path([f([-m.length*1.1,0]),f([m.length*1.1,0])])}" stroke="var(--rail)" stroke-width="15"/><path d="${path([f([0,-m.length*1.1]),f([0,m.length*1.1])])}" stroke="var(--rail)" stroke-width="15"/>`;
 svg+=line(f([-m.length*1.1,0]),f([m.length*1.1,0]),'axis')+line(f([0,-m.length*1.1]),f([0,m.length*1.1]),'axis')+ellipse;
 for(const p of [m.A,m.B]){const q=f(p);svg+=`<rect class="slider" x="${q[0]-9}" y="${q[1]-9}" width="18" height="18" rx="3"/>`}
 svg+=line(f(m.A),f(m.B),'rod')+line(f(m.A),f(m.B),'rod-edge')+dot(f(m.A),'A','fixed',10,23)+dot(f(m.B),'B','fixed',10,-13)+dot(P,'P','dot',9,-13);
 legend=['杆上固定笔尖 P','固定杆上的分点','互相垂直的完整滑轨'];metrics=[['整杆 AB',fmt(Math.hypot(m.A[0],m.B[1]))],['AP = b',fmt(m.b)],['PB = a',fmt(m.a)],['固定杆长 a+b',fmt(m.length)]];status='两条轨道均允许正负位置。杆上的笔尖固定，距 A 为 b、距 B 为 a。';
 }else if(mode==='equidistance'){
 if(state.boundary){
 const a=m.a,F1=[-a,0],F2=[a,0];
 svg+=curve(sample(t=>f([a+2*a*Math.cos(t),2*a*Math.sin(t)])),'dim');
 svg+=line(f([-3.3*a,0]),f([a,0]),'curve')+`<path d="${path([f([-3.12*a,.12*a]),f([-3.3*a,0]),f([-3.12*a,-.12*a])])}" class="curve"/>`;
 const x=a-5*a*(state.degrees/360),p=[x,0],r2=Math.abs(x-a),q=r2<1e-10?[-a,0]:[a+2*a*(x-a)/r2,0];
 svg+=line(f(p),f(F1),'aux')+line(f(p),f(q),'aux dash')+dot(f(F1),'F₁=Q','fixed',-25,-18)+dot(f(F2),'F₂','fixed',8,-18)+dot(f(p),'P','dot',10,24);
 legend=['边界轨迹：向左无限延伸','PF₁ 与圆周最短距离','定圆周 Γ'];metrics=[['边界半焦距 c',fmt(a)],['点距 PF₁',fmt(Math.abs(x+a))],['圆周最短距离',fmt(Math.abs(r2-2*a))],['轨迹条件','x ≤ a']];
 status='独立边界示意 c=a：全平面轨迹为半射线，不是闭线段。参数角控件在这里改为沿半射线取样；图只显示有限窗口。';
 }else{
 svg+=curve(sample(t=>f([m.c+2*m.a*Math.cos(t),2*m.a*Math.sin(t)])),'dim')+ellipse+line(f(m.f1),P)+line(P,f(m.contact),'aux dash')+line(f(m.f2),f(m.contact),'dim dash');
 svg+=dot(f(m.f1),'F₁','fixed',-20,22)+dot(f(m.f2),'F₂','fixed',5,22)+dot(P,'P')+dot(f(m.contact),'Q','fixed',6,-10);
 legend=['等距轨迹椭圆','PF₁ 与 PQ','圆心 F₂、半径 2a 的定圆'];metrics=[['点距 PF₁',fmt(m.r1)],['圆周最短距离',fmt(m.circleDistance)],['到圆心 PF₂',fmt(m.r2)],['定圆半径',fmt(2*m.a)]];status='Q 是圆周上离 P 最近的点。P 严格在圆内，因此圆周距离为 2a−PF₂。';
 }
 }
 }
 $('#diagram').innerHTML=svg;
 $('#diagram').classList.toggle('draggable',!['projection','cone'].includes(mode)&&!(mode==='equidistance'&&state.boundary));
 $('#diagram').setAttribute('aria-label',CONTENT.find(c=>c.id===mode).title+'；'+view+'；'+status);
 $('#view-label').textContent=view;$('#hint').textContent=hint;
 $('#legend').innerHTML=legend.map(s=>`<span>${escape(s)}</span>`).join('');
 $('#metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><small>${escape(label)}</small><strong>${escape(value)}</strong></div>`).join('');
 // Keep the live region quiet while a point moves; only announce changed geometry status.
 if($('#status').textContent!==status)$('#status').textContent=status;
}
function render(){
 const m=ellipseModel(state.a,state.ratio,state.degrees);
 $('#a').value=state.a;$('#ratio').value=state.ratio;$('#angle').value=state.degrees;
 $('#a-out').textContent=fmt(m.a,1);$('#ratio-out').textContent=fmt(m.ratio,2);$('#angle-out').textContent=fmt(m.degrees,0)+'°';
 $('#point-readout').textContent=state.mode==='equidistance'&&state.boundary?'边界：y=0, x≤a':`P (${fmt(m.x,2)}, ${fmt(m.y,2)})`;
 $('#shared-values').textContent=(state.mode==='equidistance'&&state.boundary?'以下为普通椭圆参数，不适用于当前半射线边界示意：':'')+`a = ${fmt(m.a,2)}　b = ${fmt(m.b,2)}　c = ${fmt(m.c,2)}　e = ${fmt(m.e,3)}`;
 drawing(m);window.ellipseLab={state:{...state},model:m,setMode:switchMode};
}
function controls(){
 let s='';if(state.mode==='compression')s='<label for="blend">压缩过程：重合 → 目标 <input id="blend" type="range" min="0" max="1" step="0.01" value="'+state.blend+'"></label>';
 if(['projection','cone'].includes(state.mode))s='<label for="yaw">观察方位 <input id="yaw" type="range" min="-80" max="80" step="1" value="'+state.yaw+'"><output id="yaw-out">'+state.yaw+'°</output></label>';
 if(state.mode==='equidistance')s='<label><input id="boundary-toggle" type="checkbox" '+(state.boundary?'checked':'')+'> 查看定点落在圆周上的边界（独立示意 c=a）</label>';
 $('#mode-controls').innerHTML=s;
 if($('#blend'))$('#blend').addEventListener('input',e=>{state.blend=+e.target.value;render()});
 if($('#yaw'))$('#yaw').addEventListener('input',e=>{state.yaw=+e.target.value;$('#yaw-out').textContent=state.yaw+'°';render()});
 if($('#boundary-toggle'))$('#boundary-toggle').addEventListener('change',e=>{state.boundary=e.target.checked;render()});
}
function switchMode(mode,save=true){
 if(!MODES.includes(mode))return;
 state.mode=mode;const c=CONTENT.find(c=>c.id===mode),i=MODES.indexOf(mode);
 $$('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1});
 $('#experiment').setAttribute('aria-labelledby','tab-'+mode);
 $('#figure-no').textContent='FIG. 0'+(i+1);
 for(const [selector,value] of [['#category',c.category],['#mode-title',c.title],['#mode-intro',c.intro],['#condition',c.condition],['#watch',c.watch],['#question',c.question],['#boundary',c.boundary]])$(selector).textContent=value;
 $('#formula').innerHTML=c.formula;$('#steps').innerHTML=c.steps.map(s=>`<li>${escape(s)}</li>`).join('');$('#proof-body').innerHTML=c.proof.map(s=>`<p>${s}</p>`).join('');
 controls();render();if(save)saveHash();
}
function saveHash(){clearTimeout(hashTimer);hashTimer=setTimeout(()=>{try{history.replaceState(null,'','#'+new URLSearchParams({mode:state.mode,a:fmt(state.a,1),r:fmt(state.ratio,2),t:fmt(state.degrees,0)}))}catch{}},180)}
function readHash(){const p=new URLSearchParams(location.hash.slice(1));if(MODES.includes(p.get('mode')))state.mode=p.get('mode');for(const [key,name,min,max] of [['a','a',3,7],['r','ratio',.2,1],['t','degrees',0,360]]){if(p.has(key)){const n=Number(p.get(key));if(Number.isFinite(n))state[name]=Math.max(min,Math.min(max,n));}}switchMode(state.mode,false)}
function play(value){state.playing=value&&!reduced.matches;$('#play').textContent=state.playing?'Ⅱ 暂停轨迹':'▶ 播放轨迹';$('#play').setAttribute('aria-pressed',state.playing);last=0}
for(const [id,key] of [['a','a'],['ratio','ratio'],['angle','degrees']])$('#'+id).addEventListener('input',e=>{play(false);state[key]=+e.target.value;render();saveHash()});
$$('[data-mode]').forEach(b=>{b.addEventListener('click',()=>switchMode(b.dataset.mode));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();let i=MODES.indexOf(state.mode);i=e.key==='Home'?0:e.key==='End'?7:(i+(e.key==='ArrowRight'?1:7))%8;switchMode(MODES[i]);$('#tab-'+MODES[i]).focus()}})});
$$('[data-ratio]').forEach(b=>b.addEventListener('click',()=>{play(false);state.ratio=+b.dataset.ratio;if(state.ratio===.8)state.a=5;state.boundary=false;controls();render();saveHash()}));
$('#play').addEventListener('click',()=>play(!state.playing));
$('#reset').addEventListener('click',()=>{play(false);Object.assign(state,{a:5,ratio:.8,degrees:35,blend:1,yaw:32,boundary:false});controls();render();saveHash()});
$('#theme').addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'light';$('#theme').textContent=dark?'浅色纸面':'深色纸面'});
const diagram=$('#diagram');diagram.tabIndex=0;
diagram.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End',' '].includes(e.key)){e.preventDefault();if(e.key===' ')play(!state.playing);else{play(false);state.degrees=e.key==='Home'?0:e.key==='End'?360:(state.degrees+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?10:1)+360)%360;render();saveHash()}}});
let dragging=false;
function pointer(e){if(!diagram.classList.contains('draggable'))return;const m=ellipseModel(state.a,state.ratio,state.degrees);let ext;
 if(state.mode==='directrix'&&m.directrix!==null)ext=[-1.25*m.a,Math.min(m.directrix,1.9*m.a)+.25*m.a,-1.2*m.a,1.2*m.a];
 if(state.mode==='trammel')ext=[-1.15*m.length,1.15*m.length,-1.15*m.length,1.15*m.length];
 if(state.mode==='equidistance')ext=[-3.4*m.a,3.3*m.a,-2.25*m.a,2.25*m.a];
 const w=world(m,ext),origin=w.f([0,0]),box=diagram.getBoundingClientRect();
 const x=((e.clientX-box.left)/box.width*820-origin[0])/w.scale,y=(origin[1]-(e.clientY-box.top)/box.height*510)/w.scale;
 state.degrees=(Math.atan2(y/m.b,x/m.a)*180/Math.PI+360)%360;play(false);render();saveHash();}
diagram.addEventListener('pointerdown',e=>{if(!diagram.classList.contains('draggable'))return;dragging=true;diagram.setPointerCapture(e.pointerId);pointer(e)});
diagram.addEventListener('pointermove',e=>{if(dragging)pointer(e)});diagram.addEventListener('pointerup',()=>dragging=false);diagram.addEventListener('pointercancel',()=>dragging=false);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0},{threshold:.05}).observe(diagram);
document.addEventListener('visibilitychange',()=>last=0);
function motionSetting(){if(reduced.matches)play(false);$('#play').disabled=reduced.matches;$('#motion-note').textContent=reduced.matches?'系统已启用减弱动态：自动播放关闭，仍可拖动、调参和使用方向键。':'默认静止；播放时参数角匀速，曲线上的点不一定匀速。'}reduced.addEventListener('change',motionSetting);
function frame(now){if(state.playing&&visible&&!document.hidden&&!dragging){if(last)state.degrees=(state.degrees+Math.min(now-last,100)*.018)%360;render();last=now}else last=0;requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.addEventListener('hashchange',readHash);
$('#copy-link').addEventListener('click',async()=>{clearTimeout(hashTimer);try{history.replaceState(null,'','#'+new URLSearchParams({mode:state.mode,a:fmt(state.a,1),r:fmt(state.ratio,2),t:fmt(state.degrees,0)}));await navigator.clipboard.writeText(location.href);$('#copy-result').textContent='已复制当前入口与参数'}catch{$('#copy-result').textContent='可直接复制地址栏链接；入口和参数已保存。'}});
$('#instrument').addEventListener('toggle',()=>{if($('#instrument').open&&!$('#instrument-frame')){const iframe=document.createElement('iframe');iframe.id='instrument-frame';iframe.title='Anatomy 椭圆拉绳绘图仪，独立控制台';iframe.srcdoc=INSTRUMENT;$('#instrument-mount').appendChild(iframe)}});
window.addEventListener('beforeprint',()=>$('#proof').open=true);
readHash();motionSetting();
})();
