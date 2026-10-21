import type {StudioDocument} from '../document/types';
import type {Layer} from '../document/layers';
import {generateSVG} from './grid';
import {generateWavesSVG} from './waves';
const escapeXml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function composeSVG(background:string,layers:Layer[],fallback:StudioDocument):string {
 const parts=layers.filter(l=>l.visible).map(l=>{
  let content='';
  if(l.type==='pattern'){const settings={...fallback,...l.pattern,background:'transparent'};const svg=settings.generator==='waves'?generateWavesSVG(settings):generateSVG(settings);content=svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/<rect width="800" height="800" fill="transparent"\/>/,'');}
  if(l.type==='text')content=`<text x="${l.x??400}" y="${l.y??400}" font-size="${l.fontSize??100}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" fill="${fallback.foreground}">${escapeXml(l.text??'LAB')}</text>`;
  return `<g opacity="${l.opacity/100}" style="mix-blend-mode:${l.blend}">${content}</g>`;
 });
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><rect width="800" height="800" fill="${background}"/>${parts.join('')}</svg>`;
}
