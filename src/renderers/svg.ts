import type {Scene,Vec2} from '../core/schema';
import {escapeHtml as e} from './text';
export function renderScene(svg:SVGSVGElement,scene:Scene,highlight:readonly string[]){
 const [xmin,xmax,ymin,ymax]=scene.viewport,width=720,height=510,pad=48;
 const scale=Math.min((width-2*pad)/(xmax-xmin),(height-2*pad)/(ymax-ymin));
 const x0=width/2-(xmin+xmax)*scale/2,y0=height/2+(ymin+ymax)*scale/2;
 const point=(p:Vec2)=>[x0+p[0]*scale,y0-p[1]*scale];
 const path=(pts:readonly Vec2[])=>'M'+pts.map(p=>point(p).map(n=>n.toFixed(2)).join(',')).join('L');
 let grid='';
 for(let x=Math.ceil(xmin);x<=xmax;x++)grid+=`<path class="grid" d="${path([[x,ymin],[x,ymax]])}"/>`;
 for(let y=Math.ceil(ymin);y<=ymax;y++)grid+=`<path class="grid" d="${path([[xmin,y],[xmax,y]])}"/>`;
 grid+=`<path class="axis" d="${path([[xmin,0],[xmax,0]])}${path([[0,ymin],[0,ymax]])}"/>`;
 for(const x of [0,1,2,4,6,8])if(x>=xmin&&x<=xmax){const p=point([x,0]);grid+=`<text class="tick" x="${p[0]+5}" y="${p[1]+19}">${x}</text>`;}
 let graphics='';
 for(const g of scene.graphics){
  const active=highlight.includes(g.id),cls=`${g.tone??'main'} ${active?'highlight':''}`;
  if(g.type==='point'){const p=point(g.at);graphics+=`<g data-object="${e(g.id)}" class="${cls}"><circle cx="${p[0]}" cy="${p[1]}" r="5"/>${g.label?`<text x="${p[0]+10}" y="${p[1]-12}">${e(g.label)}</text>`:''}</g>`;}
  else graphics+=`<path data-object="${e(g.id)}" class="${cls}" d="${path(g.type==='curve'?g.points:[g.from,g.to])}"/>`;
 }
 const a=point([xmin,ymax]),b=point([xmax,ymin]);
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('aria-label',scene.message);
 svg.innerHTML=`<defs><clipPath id="plot-clip"><rect x="${a[0]}" y="${a[1]}" width="${b[0]-a[0]}" height="${b[1]-a[1]}"/></clipPath></defs><g clip-path="url(#plot-clip)">${grid}${graphics}</g>`;
}
