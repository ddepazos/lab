import {useState} from 'react';
type Props={artboardSelector:string;duration:number;onTimeChange:(time:number)=>void;onComplete:()=>void};
const frame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
function drawLayer(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,board:HTMLElement){
 const a=board.getBoundingClientRect(),r=canvas.getBoundingClientRect();
 if(!canvas.width||!canvas.height||!a.width||!a.height||!r.width||!r.height)return;
 ctx.drawImage(canvas,(r.left-a.left)/a.width*800,(r.top-a.top)/a.height*800,r.width/a.width*800,r.height/a.height*800);
}
function loadSvg(svg:SVGSVGElement):Promise<HTMLImageElement>{
 const clone=svg.cloneNode(true) as SVGSVGElement;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width','800');clone.setAttribute('height','800');
 const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('SVG no decodificable'))};
  image.src=url;
 });
}
export function VideoExport({artboardSelector,duration,onTimeChange,onComplete}:Props){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const [fps,setFps]=useState(30);
 const record=async()=>{
  if(busy)return;
  const board=document.querySelector<HTMLElement>(artboardSelector);
  if(!board){setStatus('No se encontró el lienzo');return}
  if(!('MediaRecorder'in window)){setStatus('El navegador no admite grabación WebM');return}
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime){setStatus('WebM no disponible en este navegador');return}
  setBusy(true);setStatus('Preparando las capas…');
  let stream:MediaStream|null=null;
  try{
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=800;
   const ctx=canvas.getContext('2d',{alpha:false});
   if(!ctx)throw new Error('No se pudo crear el lienzo de grabación');
   stream=canvas.captureStream(fps);
   const chunks:Blob[]=[];
   const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
   let recordingError:Error|null=null;
   const finished=new Promise<void>((resolve,reject)=>{
    recorder.addEventListener('dataavailable',e=>{if(e.data.size)chunks.push(e.data)});
    recorder.addEventListener('error',e=>{recordingError=new Error('Falló MediaRecorder: '+e.type)});
    recorder.addEventListener('stop',()=>recordingError?reject(recordingError):resolve(),{once:true});
   });
   const seconds=Math.max(1,Math.min(120,Number.isFinite(duration)?duration:5));
   let lastSvgMarkup='',lastImage:HTMLImageElement|null=null,svgWarnings=0;
   const start=performance.now();
   recorder.start(1000);
   let nextTick=start;
   while(recorder.state==='recording'){
    const elapsed=(performance.now()-start)/1000;
    if(elapsed>=seconds)break;
    onTimeChange(elapsed);
    await frame();await frame();
    ctx.fillStyle='#171717';ctx.fillRect(0,0,800,800);
    const svg=board.querySelector<SVGSVGElement>('.artboard-base svg');
    if(svg){
     const markup=svg.outerHTML;
     if(markup!==lastSvgMarkup){
      try{lastImage=await loadSvg(svg);lastSvgMarkup=markup}
      catch(error){if(svgWarnings++===0)console.warn('Fallo al decodificar SVG',error)}
     }
     if(lastImage)ctx.drawImage(lastImage,0,0,800,800);
    }
    const gl=board.querySelector<HTMLCanvasElement>('.overlay-3d canvas');
    if(gl)drawLayer(ctx,gl,board);
    board.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay canvas').forEach(c=>drawLayer(ctx,c,board));
    board.querySelectorAll<HTMLCanvasElement>('.konva-overlay canvas').forEach(c=>drawLayer(ctx,c,board));
    const elapsedNow=(performance.now()-start)/1000;
    setStatus('Grabando '+elapsedNow.toFixed(1)+' / '+seconds.toFixed(1)+' s');
    nextTick+=1000/fps;
    const wait=nextTick-performance.now();
    if(wait>0)await new Promise<void>(resolve=>setTimeout(resolve,wait));
    else nextTick=performance.now();
   }
   if(recorder.state!=='inactive')recorder.stop();
   await Promise.race([finished,new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('El codificador no finalizó en 15 segundos')),15000))]);
   if(!chunks.length)throw new Error('No se generaron datos de video');
   const blob=new Blob(chunks,{type:mime});
   if(blob.size<1024)throw new Error('El archivo de video está vacío o incompleto');
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='LAB-composicion-2D-3D.webm';document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   setStatus('Video descargado: '+(blob.size/1048576).toFixed(2)+' MB'+(svgWarnings?' · Revisar fondo SVG':''));
  }catch(error){console.error('LAB video export',error);setStatus('Error de exportación: '+String(error))}
  finally{stream?.getTracks().forEach(t=>t.stop());onComplete();setBusy(false)}
 };
 return <section className="video-export"><h2>Exportar animación</h2><label>FPS<select value={fps} disabled={busy} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option></select></label><button disabled={busy} onClick={record}>{busy?'Grabando…':'↓ Guardar video WebM'}</button><p role="status" className="note">{status||'Graba patrón 2D, modelo 3D, texto y dibujo en un solo archivo.'}</p></section>;
}
