import {defineConfig,type Plugin} from 'vite';
import {readFileSync} from 'node:fs';
// Vite already embeds fonts as data URLs. This adapter only joins its own trusted build outputs.
function offlineEntry():Plugin{return {name:'offline-entry',apply:'build',enforce:'post',generateBundle(_options,bundle){
 const entry=bundle['index.html'];if(!entry||entry.type!=='asset')throw new Error('缺少入口HTML');
 let html=String(entry.source);
 for(const [name,file] of Object.entries(bundle)){
  if(file.type==='chunk'){
   const tag=/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g;
   html=html.replace(tag,(all,src)=>src.replace(/^\.\//,'')===name?`<script type="module">${file.code.replace(/<\/script/gi,'<\\/script')}</script>`:all);
  }else if(name.endsWith('.css')){
   html=html.replace(/<link\b[^>]*href="([^"]+)"[^>]*>/g,(all,href)=>href.replace(/^\.\//,'')===name?`<style>${String(file.source)}</style>`:all);
  }
 }
 if(/<(?:script|link)\b[^>]*(?:src|href)="\.\/assets\//.test(html))throw new Error('离线HTML仍有外部构建资源');
 entry.source=html.replace('<!doctype html>','<!doctype html><!-- KaTeX ' + readFileSync(new URL('./third-party/KaTeX-LICENSE',import.meta.url),'utf8').replace(/--/g,'—') + ' -->');for(const name of Object.keys(bundle))if(name!=='index.html')delete bundle[name];
}};}
export default defineConfig({base:'./',plugins:[offlineEntry()],
 define:{__LESSON_FILTER__:JSON.stringify(process.env.EXPLAINER_LESSON??''),__LEGACY_AVAILABLE__:JSON.stringify(process.env.EXPLAINER_SINGLE!=='1')},
 build:{assetsInlineLimit:10000000,cssCodeSplit:false,sourcemap:false,modulePreload:false,rolldownOptions:{output:{codeSplitting:false}}},
 server:{fs:{deny:['.env','.env.*','**/.git/**']}}
});
