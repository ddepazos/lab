import {useState} from 'react';
type Props={artboardSelector:string;duration:number;onTimeChange:(time:number)=>void;onComplete:()=>void};
const sleep=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
const nextFrame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
function drawCanvasLayer(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,artboard:HTMLElement){
 const art=artboard.getBoundingClientRect(),rect=canvas.getBoundingClientRect();
 if(!canvas.width||!canvas.height||!rect.width||!rect.height)return;
 const x=(rect.left-art.left)/art.width*800,y=(rect.top-art.top)/art.height*800;
 const w=rect.width/art.width*800,h=rect.height/art.height*800;
 ctx.drawImage(canvas,x,y,w,h);
}

async function svgImage(svg:SVGSVGElement):Promise<HTMLImageElement>{
 const clone=svg.cloneNode(true) as SVGSVGElement;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width','800');clone.setAttribute('height','800');
 const xml=new XMLSerializer().serializeToString(clone);
 const blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 try{
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{
   image.onload=()=>resolve();
   image.onerror=()=>reject(new Error('No se pudo decodificar el SVG del fondo'));
   image.src=url;
  });
  return image;
 }finally{URL.revokeObjectURL(url)}
}
export function VideoExport({artboardSelector,duration,onTimeChange,onComplete}:Props){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const [fps,setFps]=useState(30);
 const record=async()=>{
  if(busy)return;
  const artboard=document.querySelector<HTMLElement>(artboardSelector);
  if(!artboard){setStatus('No se encontró el lienzo');return}
  if(!('MediaRecorder' in window)){setStatus('Este navegador no admite MediaRecorder');return}
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
  if(!mime){setStatus('Este navegador no admite exportación WebM');return}
  setBusy(true);setStatus('Preparando grabación…');
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=800;
  const context=canvas.getContext('2d');
  if(!context){setStatus('No se pudo crear el canvas');setBusy(false);return}
  const stream=canvas.captureStream(fps);
  const chunks:Blob[]=[];
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  let failed=false;
  try{
   recorder.start();
   const total=Math.ceil(Math.max(1,duration)*fps);
   for(let i=0;i<total;i++){
    const t=i/fps;
    onTimeChange(t);
    await nextFrame();await nextFrame();
    context.clearRect(0,0,800,800);
    const svg=artboard.querySelector<SVGSVGElement>('.artboard-base svg');
    if(svg){try{const image=await svgImage(svg);context.drawImage(image,0,0,800,800)}catch(error){console.warn('Fondo SVG omitido en este fotograma',error);context.fillStyle=getComputedStyle(artboard).backgroundColor||'#171717';context.fillRect(0,0,800,800)}}
    const gl=artboard.querySelector<HTMLCanvasElement>('.overlay-3d canvas');
    if(gl)drawCanvasLayer(context,gl,artboard);
    const text=artboard.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay canvas');
    text.forEach(c=>drawCanvasLayer(context,c,artboard));
    const ink=artboard.querySelectorAll<HTMLCanvasElement>('.konva-overlay canvas');
    ink.forEach(c=>drawCanvasLayer(context,c,artboard));
    await sleep(1000/fps);
    if(i%fps===0)setStatus('Grabando '+Math.min(duration,Math.round(t))+' / '+duration+' s');
   }
  }catch(error){failed=true;setStatus('Error de exportación: '+String(error))}
  const stopped=new Promise<void>(resolve=>{recorder.onstop=()=>resolve()});
  if(recorder.state!=='inactive')recorder.stop();
  await stopped;
  stream.getTracks().forEach(track=>track.stop());
  if(!failed&&chunks.length){
   const blob=new Blob(chunks,{type:mime});
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='LAB-composicion-2D-3D.webm';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),10000);
   setStatus('Video WebM guardado ('+(blob.size/1048576).toFixed(1)+' MB). Comprueba la composición completa.');
  }else if(!failed)setStatus('La grabación terminó sin fotogramas');
  onComplete();setBusy(false);
 };
 return <section className="video-export"><h2>Exportar animación</h2><label>FPS<select value={fps} disabled={busy} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option></select></label><button disabled={busy} onClick={record}>{busy?'Grabando…':'↓ Guardar video WebM'}</button><p role="status" className="note">{status||'Captura el fondo 2D, el objeto 3D, texto y dibujo.'}</p></section>;
}
