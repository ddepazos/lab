import type {StudioDocument} from '../document/types';
import type {Layer} from '../document/layers';
import {generateSVG} from './grid';
import {generateWavesSVG} from './waves';
const escapeXml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
function svgTextContent(layer:Layer,fallback:StudioDocument):string{
 const x=layer.x??400,y=layer.y??400,size=layer.fontSize??100;
 const family=escapeXml(layer.fontFamily??'Inter'),fill=layer.fill??fallback.foreground;
 const area=layer.textMode==='area',width=layer.textWidth??500;
 const raw=layer.text??'LAB';
 const lines:string[]=[];
 if(area){
  const maxChars=Math.max(1,Math.floor(width/(size*.55)));
  for(const paragraph of raw.split('\n')){
   let line='';
   for(const word of paragraph.split(/\s+/)){
    if(line&&(line+' '+word).length>maxChars){lines.push(line);line=word}else line=line?line+' '+word:word;
    while(line.length>maxChars){lines.push(line.slice(0,maxChars));line=line.slice(maxChars)}
   }
   lines.push(line);
  }
 }else lines.push(...raw.split('\n'));
 const anchor=area?(layer.textAlign==='right'?'end':layer.textAlign==='center'?'middle':'start'):'start';
 const tx=area?(layer.textAlign==='right'?x+width:layer.textAlign==='center'?x+width/2:x):x;
 const lineHeight=(layer.lineHeight??1.2)*size;
 const spans=lines.map((line,i)=>'<tspan x="'+tx+'" y="'+(y+size+i*lineHeight)+'">'+escapeXml(line)+'</tspan>').join('');
 return '<text font-size="'+size+'" text-anchor="'+anchor+'" font-family="'+family+',sans-serif" font-weight="'+(layer.fontWeight??700)+'" fill="'+fill+'" transform="rotate('+(layer.rotation??0)+' '+x+' '+y+')">'+spans+'</text>';
}
export function composeSVG(background:string,layers:Layer[],fallback:StudioDocument):string {
 const parts=layers.filter(l=>l.visible).map(l=>{
  let content='';
  if(l.type==='pattern'){const settings={...fallback,...l.pattern,background:'transparent'};const svg=settings.generator==='waves'?generateWavesSVG(settings):generateSVG(settings);content=svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/<rect width="800" height="800" fill="transparent"\/>/,'');}
  if(l.type==='text')content=svgTextContent(l,fallback);
  const rotation=l.type==='pattern'?(l.pattern?.rotation??fallback.rotation??0):0;
  const transform=l.type==='pattern'?` transform="translate(${l.x??0} ${l.y??0}) rotate(${rotation} 400 400)"`:'';
  return `<g${transform} opacity="${l.opacity/100}" style="mix-blend-mode:${l.blend}">${content}</g>`;
 });
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><rect width="800" height="800" fill="${background}"/>${parts.join('')}</svg>`;
}
