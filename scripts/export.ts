import {writeFileSync,mkdirSync,readFileSync,copyFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'vite';
import {catalog} from '../src/content/catalog';
import {studentDocument} from '../src/core/schema';
import {renderBlocks,escapeHtml} from '../src/renderers/text';
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')];}));
const lesson=catalog.find(l=>l.id===args.lesson),audience=args.audience;
if(!lesson||!['student','teacher'].includes(audience))throw new Error('用法：npm run export -- --lesson=parabola-midpoint-chord --audience=student|teacher');
const out=resolve('artifacts',lesson.id+'-'+audience);mkdirSync(out,{recursive:true});
if(audience==='teacher'){
 process.env.EXPLAINER_LESSON=lesson.id;process.env.EXPLAINER_SINGLE='1';
 await build({configFile:resolve('vite.config.ts'),build:{outDir:out,emptyOutDir:true}});
}else{
 const document=studentDocument(lesson),root=dirname(createRequire(import.meta.url).resolve('katex/package.json'));
 let css=readFileSync(join(root,'dist/katex.min.css'),'utf8');
 css=css.replace(/url\(([^)]+)\)/g,(_match,p)=>{const name=String(p).replace(/["']/g,'');if(!name.startsWith('fonts/'))throw new Error('unexpected KaTeX font URL');const ext=name.split('.').pop();return 'url(data:font/'+ext+';base64,'+readFileSync(join(root,'dist',name)).toString('base64')+')';});
 const notice=readFileSync(join(root,'LICENSE'),'utf8').replace(/--/g,'—');
 const html=`<!doctype html><!-- KaTeX ${notice} --><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="author" content="chengbai"><title>${escapeHtml(document.title)} · 学生练习</title><style>${css}body{max-width:820px;margin:40px auto;padding:0 22px;font:16px/1.9 "PingFang SC",sans-serif;color:#252d2b;background:#fcfbf6}h1{font:30px/1.5 "Songti SC",serif}.source{font-size:11px;color:#72796f}.katex-display{overflow:auto}.workspace{height:480px;border-top:1px solid #ccc;margin-top:32px}footer{font-size:11px;color:#72796f}@media print{body{margin:0;background:white}}</style></head><body><p class="source">学生练习</p><h1>${escapeHtml(document.title)}</h1>${renderBlocks(document.statement)}<p class="source">${escapeHtml(document.source.label)}</p><div class="workspace" aria-label="作答区域"></div><footer>请写出必要推理，并核对题设条件。</footer></body></html>`;
 writeFileSync(join(out,'index.html'),html);
}
console.log('Exported '+audience+' document: '+join(out,'index.html'));
