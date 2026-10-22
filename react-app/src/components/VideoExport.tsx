import {useState} from 'react';
type Props={artboardSelector:string;duration:number;onTimeChange:(time:number)=>void;onComplete:()=>void};
const sleep=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
async function svgBitmap(svg:SVGSVGElement):Promise<ImageBitmap>{
 const xml=new XMLSerializer().serializeToString(svg);
 const blob=new Blob([xml],{type:'image/svg+xml'});
 return createImageBitmap(blob);
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
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    context.clearRect(0,0,800,800);
    const svg=artboard.querySelector<SVGSVGElement>('.artboard-base svg');
    if(svg){const bitmap=await svgBitmap(svg);context.drawImage(bitmap,0,0,800,800);bitmap.close()}
    const gl=artboard.querySelector<HTMLCanvasElement>('.overlay-3d canvas');
    if(gl)context.drawImage(gl,0,0,800,800);
    const text=artboard.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay canvas');
    text.forEach(c=>context.drawImage(c,0,0,800,800));
    const ink=artboard.querySelectorAll<HTMLCanvasElement>('.konva-overlay canvas');
    ink.forEach(c=>context.drawImage(c,0,0,800,800));
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
   setStatus('Video WebM guardado ('+(blob.size/1048576).toFixed(1)+' MB)');
  }else if(!failed)setStatus('La grabación terminó sin fotogramas');
  onComplete();setBusy(false);
 };
 return <section className="video-export"><h2>Exportar animación</h2><label>FPS<select value={fps} disabled={busy} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option></select></label><button disabled={busy} onClick={record}>{busy?'Grabando…':'↓ Guardar video WebM'}</button><p role="status" className="note">{status||'Captura el fondo 2D, el objeto 3D, texto y dibujo.'}</p></section>;
}
