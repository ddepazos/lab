import type {StudioDocument} from '../document/types';
import {randomAt} from './seed';
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
/** Deterministic SVG wave field. No network or third-party runtime dependencies. */
export function generateWavesSVG(doc:StudioDocument):string{
 const w=800,h=800;
 const count=Math.round(clamp(doc.waveLines??60,4,150));
 const amplitude=clamp(doc.waveAmplitude??28,0,150);
 const frequency=clamp(doc.waveFrequency??3,0.1,16);
 const noise=clamp(doc.waveNoise??25,0,100)/100;
 const paths:string[]=[];
 for(let row=0;row<count;row++){
  const baseline=(row+0.5)*h/count;
  const phase=randomAt(doc.seed,row*13)*Math.PI*2;
  const points:string[]=[];
  for(let x=0;x<=w;x+=8){
   const t=x/w;
   const envelope=Math.pow(Math.max(0,Math.sin(Math.PI*t)),1.5);
   const wave=Math.sin(t*frequency*Math.PI*2+phase+row*0.09);
   const drift=Math.sin(t*frequency*Math.PI*5+row*0.19+doc.seed*0.01)*noise;
   const y=baseline+(wave+drift)*amplitude*envelope;
   points.push((x===0?'M':'L')+x+' '+y.toFixed(2));
  }
  paths.push('<path d="'+points.join(' ')+'" fill="none" stroke="'+doc.foreground+'" stroke-width="1.5"/>');
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><rect width="800" height="800" fill="'+doc.background+'"/>'+paths.join('')+'</svg>';
}
