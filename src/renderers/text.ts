import katex from 'katex';
import type {Block} from '../core/schema';
export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function renderBlocks(blocks:readonly Block[]):string{
 return blocks.map(b=>b.type==='math'?katex.renderToString(b.tex,{displayMode:b.display,throwOnError:true,strict:'error',trust:false}):b.type==='note'?`<aside class="note"><b>${escapeHtml(b.title)}</b><p>${escapeHtml(b.text)}</p></aside>`:`<p>${escapeHtml(b.text)}</p>`).join('');
}
