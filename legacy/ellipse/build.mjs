import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import katex from 'katex';
import {createRequire} from 'node:module';
import {makeContent} from './content.mjs';
import {ellipseModel,MODES} from './model.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const katexRoot=dirname(createRequire(import.meta.url).resolve('katex/package.json'));
let formulas=0;
const tex=(s,displayMode=false)=>{formulas++;return katex.renderToString(s,{displayMode,throwOnError:true,strict:'error',output:'htmlAndMathml'});};
const content=makeContent(tex);
let css=readFileSync(join(katexRoot,'dist/katex.min.css'),'utf8').replace(/url\(([^)]+)\)/g,(match,path)=>{
 path=path.replace(/["']/g,'');return path.endsWith('.woff2')?`url(data:font/woff2;base64,${readFileSync(join(katexRoot,'dist',path)).toString('base64')})`:match;
}).replace(/,url\([^)]*\) format\("(?:woff|truetype)"\)/g,'');
css+='\n'+readFileSync(join(here,'style.css'),'utf8');
const old=readFileSync(join(here,'../assets/ellipse-string-instrument.html'),'utf8');
const nav=content.map((m,i)=>`<button role="tab" id="tab-${m.id}" aria-controls="experiment" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-mode="${m.id}"><span class="nav-number">0${i+1}</span><span><b>${m.title}</b><small>${m.category} · ${m.short}</small></span></button>`).join('');
const initial=`const MODES=${JSON.stringify(MODES)}; const CONTENT=${JSON.stringify(content).replace(/</g,'\\u003c')}; const INSTRUMENT=${JSON.stringify(old).replace(/</g,'\\u003c')}; const ellipseModel=${ellipseModel.toString()};\n`;
const notices='Anatomy\n'+readFileSync(join(here,'../../third-party/Anatomy-LICENSE'),'utf8')+'\nKaTeX\n'+readFileSync(join(here,'../../third-party/KaTeX-LICENSE'),'utf8');
const html=`<!doctype html><!-- ${notices} --><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="author" content="chengbai"><title>椭圆的八种入口 · 数学实验室</title><style>${css}</style></head><body>
<header class="masthead"><a href="#" class="wordmark" aria-label="回到椭圆实验室首页">几何实验室<span>GEOMETRY / 01</span></a><button id="theme" class="quiet">深色纸面</button></header>
<main><header class="intro"><div class="eyebrow">从不同的约束，走向同一条曲线</div><h1>一条椭圆，<em>八种入口。</em></h1><p>拉紧一根绳，压缩一个圆，斜切一只圆锥。改变的是构造，保持的是同一组长短轴。<br class="desktop">先动手观察，再用距离、坐标与勾股说明为什么。</p></header>
<nav class="mode-nav" role="tablist" aria-label="选择椭圆定义或构造">${nav}</nav>
<section id="experiment" role="tabpanel" aria-labelledby="tab-foci">
<div class="experiment-grid"><div class="workbench"><div class="figure-heading"><span id="figure-no">FIG. 01</span><span id="view-label">等比例正视图</span></div><div class="drawing"><svg id="diagram" viewBox="0 0 820 510" role="img" aria-label="椭圆构造图"></svg></div><div class="figure-bottom"><span id="hint">拖动图中笔尖 · ← → 调整参数角</span><span id="point-readout"></span></div><div id="legend" class="legend"></div>
<div class="controls"><div class="sliders"><label for="a">半长轴 a <output id="a-out"></output><input id="a" type="range" min="3" max="7" step="0.1" value="5"></label><label for="ratio">轴比 b/a <output id="ratio-out"></output><input id="ratio" type="range" min="0.2" max="1" step="0.01" value="0.8"></label><label for="angle">参数角 t <output id="angle-out"></output><input id="angle" type="range" min="0" max="360" step="1" value="35"></label></div><div class="button-row"><button id="play" aria-pressed="false">▶ 播放轨迹</button><button id="reset" class="quiet">复位</button><button data-ratio="1" class="quiet">圆</button><button data-ratio="0.8" class="quiet">3–4–5</button><button data-ratio="0.3" class="quiet">扁椭圆</button></div><div id="mode-controls"></div><small id="motion-note">默认静止；播放时参数角匀速，曲线上的点不一定匀速。</small></div></div>
<aside class="explanation"><div id="category" class="eyebrow"></div><h2 id="mode-title"></h2><p id="mode-intro"></p><div id="formula" class="formula"></div><p id="condition" class="condition"></p><div class="observe"><span>观察任务</span><p id="watch"></p></div><div id="metrics" class="metrics" aria-label="实时几何读数"></div><p id="status" role="status" aria-live="polite"></p></aside></div>
<div class="lesson-grid"><section><div class="eyebrow">HOW TO BUILD</div><h3>怎样构造</h3><ol id="steps"></ol></section><section class="question"><div class="eyebrow">留给课堂的一个问题</div><h3 id="question"></h3><p>先让学生描述什么在变、什么不变，再展开下面的推导核对。</p></section></div>
<details id="proof" class="proof"><summary><span>教师备课 · 为什么得到同一条椭圆？</span><small>高中方法 / 推导与边界</small></summary><div id="proof-body"></div><div class="boundary"><b>边界与易错点</b><p id="boundary"></p></div></details>
</section>
<section class="shared"><div><div class="eyebrow">同一条曲线的共同语言</div><h3>定义不同，标准方程相同。</h3><p>前两种与第八种给出距离约束；中间三种给出平面或机械构造；第六、第七种说明空间来源。这里的八种入口，包含轨迹定义、等价刻画和生成方法。</p></div><div class="shared-math">${tex('\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1',true)}${tex('c^2=a^2-b^2,\\quad e=\\frac ca')}<p id="shared-values"></p></div></section>
<details id="instrument"><summary>实物机制补充 · Anatomy 椭圆拉绳绘图仪 <small>独立实验，固定 a=5</small></summary><p>原拉绳装置包含焦点重合、退化线段与无解情形；它有自己的控制台，与上方参数独立。展开后加载，支持离线运行。</p><div id="instrument-mount"></div></details>
<footer><span>几何实验室 / 椭圆的八种入口</span><p>所有读数来自同一数学模型；动画和采样用于观察，论证见教师区。参数角一般不等于极角。空间图是正交投影示意，真实长度见正视小图。<br>本地单文件 · 公式与字体已内嵌 · 不上传任何数据。Anatomy 与 KaTeX 使用 MIT 许可。</p><button id="copy-link" class="quiet">复制当前实验链接</button><span id="copy-result" role="status"></span></footer>
</main><script>${initial}${readFileSync(join(here,'app.js'),'utf8')}</script></body></html>`;
writeFileSync(join(here,'ellipse-definitions.html'),html);
writeFileSync(join(here,'build-info.json'),JSON.stringify({formulas,bytes:Buffer.byteLength(html),modes:MODES.length,embeddedInstrument:true,offline:true},null,2));
console.log({formulas,bytes:Buffer.byteLength(html),modes:MODES.length});
