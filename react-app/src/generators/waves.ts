import type {StudioDocument} from '../document/types';
import {randomAt} from './seed';
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
/** Deterministic SVG wave field. No network or third-party runtime dependencies. */
export function generateWavesSVG(doc:StudioDocument):string{
 const w=Math.max(100,Math.min(8192,doc.canvasWidth??800)),h=Math.max(100,Math.min(8192,doc.canvasHeight??800));
 const count=Math.round(clamp(doc.waveLines??60,4,150));
 const amplitude=clamp(doc.waveAmplitude??28,0,150);
 const frequency=clamp(doc.waveFrequency??3,0.1,16);
 const noise=clamp(doc.waveNoise??25,0,100)/100;
 const decay=clamp(doc.waveDecay??65,0,100)/100;
 const distortion=clamp(doc.waveDistortion??18,0,100)/100;
 const strokeWidth=clamp(doc.waveStrokeWidth??1.5,0.2,16);
 const paths:string[]=[];
 const style=doc.waveStyle??'lines';
 const dotRadius=clamp(doc.waveDotSize??2,0.5,16);
 const meshColumns=Math.round(clamp(doc.waveMeshColumns??30,4,120));
 const meshPoints:number[][]=[];
 for(let row=0;row<count;row++){
  const baseline=(row+0.5)*h/count;
  const phase=randomAt(doc.seed,row*13)*Math.PI*2;
  const points:string[]=[];
  const rowValues:number[]=[];
  const step=w/100;
  for(let index=0;index<=100;index++){const x=index*step;
   const t=x/w;
   const envelope=Math.pow(Math.max(0,Math.sin(Math.PI*t)),0.2+decay*3);
   const bend=Math.sin(t*Math.PI*2+row*0.13)*distortion*amplitude*0.6;
   const wave=Math.sin(t*frequency*Math.PI*2+phase+row*0.09);
   const drift=Math.sin(t*frequency*Math.PI*5+row*0.19+doc.seed*0.01)*noise;
   const y=baseline+(wave+drift)*amplitude*envelope+bend;
   points.push((x===0?'M':'L')+x+' '+y.toFixed(2));
   rowValues.push(y);
  }
  meshPoints.push(rowValues);
  if(style==='ribbons')paths.push('<path d="'+points.join(' ')+' L'+w+' '+(baseline+amplitude*.45).toFixed(2)+' L0 '+(baseline+amplitude*.45).toFixed(2)+' Z" fill="'+doc.foreground+'" opacity="0.7"/>');
  if(style==='contours'&&row%3===0)paths.push('<path d="'+points.join(' ')+'" fill="none" stroke="'+doc.foreground+'" stroke-width="'+(strokeWidth*2).toFixed(2)+'"/>');
  if(style==='lines')paths.push('<path d="'+points.join(' ')+'" fill="none" stroke="'+doc.foreground+'" stroke-width="'+strokeWidth+'"/>');
  if(style==='dots')for(let i=0;i<rowValues.length;i+=2){paths.push('<circle cx="'+(i*w/100)+'" cy="'+rowValues[i].toFixed(2)+'" r="'+dotRadius+'" fill="'+doc.foreground+'"/>');}
 }
 if(style==='mesh'){
  for(let row=0;row<meshPoints.length;row++){
   const values=meshPoints[row];
   paths.push('<path d="'+values.map((y,i)=>(i?'L':'M')+(i*8)+' '+y.toFixed(2)).join(' ')+'" fill="none" stroke="'+doc.foreground+'" stroke-width="'+strokeWidth+'"/>');
  }
  for(let column=0;column<=meshColumns;column++){
   const x=column*w/meshColumns,idx=Math.min(100,Math.round(x/step));
   paths.push('<path d="'+meshPoints.map((values,i)=>(i?'L':'M')+x.toFixed(2)+' '+values[idx].toFixed(2)).join(' ')+'" fill="none" stroke="'+doc.foreground+'" stroke-width="'+strokeWidth+'"/>');
  }
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'"><rect width="'+w+'" height="'+h+'" fill="'+doc.background+'"/>'+paths.join('')+'</svg>';
}
