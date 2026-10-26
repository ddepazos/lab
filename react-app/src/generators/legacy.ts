import type {StudioDocument,ModuleKind} from '../document/types';
import {randomAt} from './seed';
import {geometry} from './modules';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
/** Legacy-inspired deterministic generators. SVG is shared by preview and export. */
export function generateLegacySVG(d:StudioDocument):string {
 const w=clamp(d.canvasWidth??800,100,8192),h=clamp(d.canvasHeight??800,100,8192);
 const mode=d.generator??'mosaic',g=d.gestalt??'none',ink=d.foreground;
 const n=clamp(Math.round(d.columns??8),2,35),rows=clamp(Math.round(d.rows??8),2,35);
 const amp=clamp(d.waveAmplitude??48,0,150),freq=clamp(d.waveFrequency??4,.1,20);
 const noise=clamp((d.waveNoise??25)/100,0,1),exp=clamp((d.expand??100)/100,.4,6);
 const density=clamp((d.density??85)/100,0,1),phase=(d.cellRotation??0)*Math.PI/180;
 const parts:string[]=[];const cx=w/2,cy=h/2;
 const point=(x:number,y:number,i:number)=>{let xx=x,yy=y;
  if(g==='symmetry')xx=cx-Math.abs(x-cx);
  if(g==='proximity'){xx+=Math.sin(Math.floor(i/3)*2)*w/n*.14;yy+=Math.cos(Math.floor(i/3)*2)*h/rows*.14;}
  if(g==='focalPoint'){const t=clamp(1-Math.hypot(x-cx,y-cy)/Math.hypot(cx,cy),0,1);xx=cx+(xx-cx)*(1-.28*t);yy=cy+(yy-cy)*(1-.28*t);}
  return [xx,yy] as const;};
 const shape=(kind:ModuleKind,x:number,y:number,sz:number,angle=0)=>'<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+sz/100+') translate(-50 -50)">'+geometry(kind,ink)+'</g>';
 const kinds:ModuleKind[]=d.active.length?d.active:['circle','ring','square','triangle'];
 if(mode==='mosaic'||mode==='modules'||mode==='dots'){
  const cols=mode==='dots'?clamp(n*3,6,75):n,rr=mode==='dots'?clamp(rows*3,6,75):rows;
  const sx=w/cols,sy=h/rr;
  for(let y=0;y<rr;y++)for(let x=0;x<cols;x++){
   const i=y*cols+x,rand=randomAt(d.seed,i*17);
   if(rand>density)continue;
   const [px,py]=point((x+.5)*sx,(y+.5)*sy,i);
   const radial=Math.hypot(px-cx,py-cy)/Math.hypot(cx,cy);
   const size=Math.min(sx,sy)*exp*(g==='focalPoint'?1.65-radial:1);
   const angle=g==='parallelism'?45:g==='commonFate'?Math.atan2(py-cy,px-cx)*180/Math.PI:d.rotation+(d.cellRotation??0)*Math.sin(i*.4);
   if(mode==='dots'){
    const localPhase=x/freq+y*.2+phase;const variation=Math.sin(localPhase)+noise*(randomAt(d.seed,i*31+3)*2-1);const localSize=size*(1+.55*noise*(randomAt(d.seed,i*29+9)*2-1));const r=clamp(localSize*(.08+.34*(.5+.5*variation))*(.35+amp/100),.4,Math.max(sx,sy)*3);
    parts.push('<circle cx="'+px+'" cy="'+py+'" r="'+r+'" fill="'+ink+'"/>');
   }else{
    const kind:ModuleKind=g==='similarity'||g==='praegnanz'?'circle':mode==='mosaic'?(['square','triangle','quarter','checker','diamond'] as ModuleKind[])[Math.floor(randomAt(d.seed,i*7)*5)]:kinds[Math.floor(randomAt(d.seed,i*7)*kinds.length)];
    parts.push(shape(kind,px-size/2,py-size/2,size,angle));
   }
  }
 }else if(mode==='spiral'){
  const count=clamp(n,2,30),steps=260;
  for(let arm=0;arm<count;arm++){
   let path='';
   for(let j=0;j<=steps;j++){
    const t=j/steps,theta=t*Math.PI*2*freq+arm*2*Math.PI/count+phase;
    const radius=t*Math.min(w,h)*.44*exp+Math.sin(theta*3+arm)*noise*amp;
    const x=cx+Math.cos(theta)*radius,y=cy+Math.sin(theta)*radius;
    const [px,py]=point(x,y,arm);
    path+=(j?' L':'M')+px.toFixed(2)+' '+py.toFixed(2);
   }
   parts.push('<path d="'+path+'" fill="none" stroke="'+ink+'" stroke-width="'+clamp((d.waveStrokeWidth??2),.5,12)+'" opacity=".85"/>');
  }
 }else if(mode==='flow'){
  const count=clamp(rows*4,8,90),steps=110;
  for(let line=0;line<count;line++){
   let path='';
   for(let j=0;j<=steps;j++){
    const t=j/steps,x=t*w;
    const wave=Math.sin(t*freq*Math.PI*2+line*.17+phase)*amp*exp;
    const drift=Math.sin(t*freq*Math.PI*3+line*.33+d.seed)*noise*amp;
    const y=(line+.5)*h/count+wave+drift;
    const [px,py]=point(x,y,line);
    path+=(j?' L':'M')+px.toFixed(2)+' '+py.toFixed(2);
   }
   parts.push('<path d="'+path+'" fill="none" stroke="'+ink+'" stroke-width="'+clamp(d.waveStrokeWidth??2,.5,12)+'"/>');
  }
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'"><rect width="'+w+'" height="'+h+'" fill="'+d.background+'"/>'+parts.join('')+'</svg>';
}
