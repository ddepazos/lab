import type {StudioDocument} from '../document/types';
import type {Layer} from '../document/layers';
import {generateSVG} from './grid';
import {generateWavesSVG} from './waves';
import {generateLegacySVG} from './legacy';
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
 const width=Math.max(100,Math.min(8192,fallback.canvasWidth??800));const height=Math.max(100,Math.min(8192,fallback.canvasHeight??800));const factor=Math.min(width,height)/800;const offsetX=(width-800*factor)/2,offsetY=(height-800*factor)/2;
 const parts=layers.filter(l=>l.visible).map(l=>{
  let content='';
  if(l.type==='pattern'){const settings={...fallback,...l.pattern,gestalt:fallback.gestalt??l.pattern?.gestalt,expand:fallback.expand??l.pattern?.expand,canvasWidth:width,canvasHeight:height,background:'transparent'};const svg=settings.generator==='waves'?generateWavesSVG(settings):settings.generator&&settings.generator!=='grid'?generateLegacySVG(settings):generateSVG(settings);content=svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/<rect width="[^"]+" height="[^"]+" fill="transparent"\/>/,'');}
  if(l.type==='text')content=svgTextContent(l,fallback);
  if(l.type==='image'&&l.imageSrc&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(l.imageSrc))content=`<image href="${l.imageSrc}" x="${l.x??0}" y="${l.y??0}" width="${l.imageWidth??200}" height="${l.imageHeight??200}" preserveAspectRatio="xMidYMid meet"/>`;
  const rotation=l.rotation??0;
  const scale=Math.max(.01,l.scale??1);
  const transform=l.type==='image'?` transform="translate(${l.x??0} ${l.y??0}) scale(${scale}) translate(-${l.x??0} -${l.y??0})"`:l.type==='pattern'?` transform="translate(${l.x??0} ${l.y??0}) translate(${width/2} ${height/2}) rotate(${rotation}) scale(${scale}) translate(-${width/2} -${height/2})"`:scale!==1?` transform="translate(${l.x??400} ${l.y??400}) scale(${scale}) translate(-${l.x??400} -${l.y??400})"`:'';
  return `<g${l.type==='pattern'||l.type==='image'?'':`transform="translate(${offsetX} ${offsetY}) scale(${factor})"`}><g${transform} opacity="${l.opacity/100}" style="mix-blend-mode:${l.blend}">${content}</g></g>`;
 });
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${background}"/>${parts.join('')}</svg>`;
}
