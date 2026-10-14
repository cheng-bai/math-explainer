import {lessonSchema,type Block,type Lesson,type Step} from '../core/schema';
const text=(text:string):Block=>({type:'text',text}),math=(tex:string):Block=>({type:'math',tex,display:true}),note=(title:string,text:string):Block=>({type:'note',title,text});
const S=(id:string,title:string,why:string,body:Block[],dependsOn:string[],scenePatch:Record<string,number>,highlight:string[]):Step=>({id,title,why,body,dependsOn,scenePatch,highlight});
const original={type:'original' as const,label:'项目自编教学示例；不是官方试题或学生作答',license:'MIT' as const};
export const catalog:Lesson[]=[lessonSchema.parse({
 schemaVersion:1,id:'quadratic-roots',kind:'concept',studentTitle:'二次函数与方程',title:'根的个数，藏在顶点的高度里',summary:'连接二次函数、配方与判别式，观察之后回到一般证明。',topic:'函数与方程',prerequisites:['二次方程的判别式','二次函数的顶点','配方法'],source:original,modelId:'quadratic',
 statement:[text('考察函数 f(x)=x²−2x+c，c 为实数。改变 c，观察它与 x 轴的交点数，并解释顶点高度、判别式和实根个数为什么同步变化。'),math('f(x)=x^2-2x+c=(x-1)^2+c-1')],
 paths:[{id:'complete-square',title:'从顶点到判别式',steps:[
 S('observe','01 / 先观察竖直平移','只改变常数项，图像整体上下移动，开口和对称轴保持不变。',[text('拖动 c，盯住顶点 V 与 x 轴。这里的观察是提出猜想的入口，不能代替证明。'),math('V=(1,c-1),\\qquad \\Delta=4-4c')],[],{c:0},['graph','vertex']),
 S('threshold','02 / 找到唯一临界位置','两个交点合成一个时，顶点恰在 x 轴上。',[math('c=1\\iff c-1=0\\iff \\Delta=0'),text('此时 (x−1)²=0，只有一个不同实根 x=1，按重数是二重根。')],['observe'],{c:1},['vertex','root-left']),
 S('prove','03 / 用配方把三种情况讲清楚','把根的问题化成一个平方等于多少，符号决定是否能开方。',[math('(x-1)^2=1-c'),math('c<1:\\ x=1\\pm\\sqrt{1-c};\\qquad c=1:\\ x=1;\\qquad c>1:\\ \\text{无实根}'),math('\\Delta=-4(c-1)'),text('判别式的符号与顶点高度的符号相反。这里只讨论开口向上的这一族，推广前必须重新处理首项系数。')],['threshold'],{c:2},['graph','vertex'])]}],
 boundaries:[note('模型范围','c 在数学上取所有实数。滑块的 −3 至 3 只是观察窗口。没有实根不等于函数图像不存在。'),text('重根时只有一个不同实根。推广到 ax²+bx+c 必须保留 a≠0，并区分开口方向。')],review:{status:'reviewed',note:'2026-10-14：当前源码经独立数学与教学复核、性质测试及视觉验收；见 docs/INDEPENDENT_REVIEW.md。'}
}),lessonSchema.parse({
 schemaVersion:1,id:'parabola-midpoint-chord',kind:'problem',studentTitle:'抛物线弦的中点与长度',title:'从弦中点，走到交点存在性',summary:'点差法求出候选直线，还必须再问：这条直线真的截得一条弦吗？',topic:'解析几何',prerequisites:['抛物线方程','两点斜率与中点公式','韦达定理与判别式'],source:original,modelId:'midpoint-chord',
 statement:[text('已知抛物线 C：y²=4x，直线与 C 交于两个不同点 A、B，弦 AB 的中点为 M(h,2)。'),text('（1）求直线 AB 的斜率，并求 h 的取值范围。'),text('（2）用 h 表示弦长 |AB|；求使 |AB|≥4 的 h 的取值范围。'),math('C:y^2=4x,\\quad M=(h,2),\\quad A\\ne B')],
 paths:[{id:'point-difference',title:'方法一 / 点差法',steps:[
 S('conditions','01 / 先排除不能相除的情况','要求斜率前，先确认横坐标不同；弦的中点条件可以排除竖直弦。',[text('竖直直线与 y²=4x 相交时，两交点纵坐标互为相反数，中点纵坐标为 0，与题设的 2 矛盾。因此 x₁≠x₂，也有 y₁≠y₂。'),math('y_1+y_2=4')],[],{h:2},['midpoint','point-a','point-b']),
 S('subtract','02 / 相减，把平方变成斜率','两个端点满足同一条二次曲线，作差能消去常量；中点提供和，恰好接上平方差。',[math('y_1^2-y_2^2=4(x_1-x_2)'),math('\\frac{y_1-y_2}{x_1-x_2}=\\frac{4}{y_1+y_2}=1'),text('斜率恒为 1，与 h 无关。由经过 M 得候选直线 y=x+2−h。')],['conditions'],{h:2.5},['chord','midpoint']),
 S('existence','03 / 候选直线，不自动是实弦','点差法只给出必要关系，还要回代确认确有两个不同交点。',[math('x=y+h-2,\\quad y^2=4(y+h-2)'),math('(y-2)^2=4(h-1)'),text('要有两个不同实数 y，必须且只需 h>1。此时两个根之和为 4，代回 x=y+h−2，两个横坐标平均值为 h，故反向也满足原中点条件。'),math('h>1')],['subtract'],{h:1},['tangent-point','secant','midpoint']),
 S('length','04 / 用根的差求弦长，再解不等式','斜率为 1，横纵坐标差相等；无需分别展开两个端点距离。',[math('y_1=2-2\\sqrt{h-1},\\quad y_2=2+2\\sqrt{h-1}'),math('|AB|=\\sqrt{2}\\,|y_2-y_1|=4\\sqrt{2(h-1)}'),math('|AB|\\ge4\\iff h\\ge\\frac32'),text('最后与原可行域 h>1 取交集，结果为 h∈[3/2,+∞)。h=3/2 确有两交点且弦长等于 4，可以取到。')],['existence'],{h:1.5},['chord','point-a','point-b'])
 ]},{id:'vieta',title:'方法二 / 韦达定理',steps:[
 S('setup','01 / 先设一般非竖直直线','竖直弦的中点纵坐标为 0，先排除它，再设 y=kx+m。',[text('若 k=0，水平直线与抛物线最多交于一点，也不符合两点不同。因此 k≠0。联立得 k²x²+(2km−4)x+m²=0。'),math('x_1+x_2=2h=\\frac{4-2km}{k^2}'),math('2=\\frac{y_1+y_2}{2}=kh+m')],[],{h:2},['secant','midpoint']),
 S('eliminate','02 / 用中点关系消掉截距','将 m=2−kh 代入根和式，二次项抵消，留下斜率。',[math('2hk^2=4-2k(2-kh)'),math('0=4-4k\\quad\\Longrightarrow\\quad k=1,\\ m=2-h')],['setup'],{h:2.5},['chord']),
 S('discriminant','03 / 判别式保留两个不同交点','把斜率和截距代回，不用“求出了直线”代替存在性。',[math('x^2-2hx+(h-2)^2=0'),math('\\Delta_x=4h^2-4(h-2)^2=16(h-1)>0'),math('h>1'),text('反向用两根和与 y=x+2−h 核验中点，故 h>1 也是充分条件。h=1 是切线，不能包含。')],['eliminate'],{h:1},['tangent-point','secant']),
 S('difference','04 / 用判别式直接求根差','首项系数为 1，根差的绝对值等于判别式的平方根。',[math('|x_1-x_2|=\\sqrt{\\Delta_x}=4\\sqrt{h-1}'),math('|AB|=4\\sqrt{2(h-1)},\\quad |AB|\\ge4\\iff h\\in[\\tfrac32,+\\infty)'),text('两条路线的共同关口都是交点存在性。点差法更直接利用中点，韦达法更方便与根差、弦长联系。')],['discriminant'],{h:1.5},['chord','point-a','point-b'])
 ]}],
 boundaries:[note('最容易漏掉的一步','h=1 的候选直线 y=x+1 与抛物线相切于 (1,2)。点差关系仍像是成立，但已没有两个不同端点，必须排除。'),text('h<1 时根不存在。h>1 无上界；滑块只取 0 至 5。图像和小残差只用于发现错误，不能替代上述充分性证明。')],review:{status:'reviewed',note:'2026-10-14：两条方法、可行域、反向覆盖及弦长经独立复核；见 docs/INDEPENDENT_REVIEW.md。'}
})];
