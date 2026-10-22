import {useState} from 'react';
import {BufferTarget,CanvasSource,Mp4OutputFormat,WebMOutputFormat,Output,Quality,Input,BlobSource,ALL_FORMATS} from 'mediabunny';
type Props={artboardSelector:string;duration:number;onTimeChange:(time:number)=>void;onComplete:()=>void;onExportStateChange?:(busy:boolean)=>void};
const raf=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
function drawCanvas(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,board:HTMLElement){
 const a=board.getBoundingClientRect(),r=canvas.getBoundingClientRect();
 if(!a.width||!a.height||!r.width||!r.height||!canvas.width||!canvas.height)return;
 ctx.drawImage(canvas,(r.left-a.left)/a.width*800,(r.top-a.top)/a.height*800,r.width/a.width*800,r.height/a.height*800);
}
function imageFromSvg(svg:SVGSVGElement,size:number):Promise<HTMLImageElement>{
 const clone=svg.cloneNode(true) as SVGSVGElement;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width',String(size));clone.setAttribute('height',String(size));
 const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo procesar el fondo SVG de la animación'))};
  img.src=url;
 });
}
function download(blob:Blob,ext:'mp4'|'webm'){
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');anchor.href=url;anchor.download='LAB-composicion-2D-3D.'+ext;
 document.body.appendChild(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
export function VideoExport({artboardSelector,duration,onTimeChange,onComplete,onExportStateChange}:Props){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const [resolution,setResolution]=useState(800);
 const [fps,setFps]=useState(30),[format,setFormat]=useState<'mp4'|'webm'>('mp4');
 const record=async()=>{
  if(busy)return;
  const board=document.querySelector<HTMLElement>(artboardSelector);
  if(!board){setStatus('No se encontró el lienzo');return}
  if(typeof VideoEncoder==='undefined'){setStatus('Este navegador no admite WebCodecs');return}
  const seconds=Math.max(1,Math.min(30,Number.isFinite(duration)?duration:5));
  const total=Math.round(seconds*fps);
  setBusy(true);onExportStateChange?.(true);setStatus('Preparando '+total+' fotogramas…');
  try{
   const canvas=document.createElement('canvas');canvas.width=resolution;canvas.height=resolution;
   const ctx=canvas.getContext('2d',{alpha:false});
   ctx?.scale(resolution/800,resolution/800);
   if(!ctx)throw new Error('No se pudo crear el canvas de exportación');
   await document.fonts.ready;
   await raf();await raf();
   const target=new BufferTarget();
   const output=new Output({format:format==='mp4'?new Mp4OutputFormat():new WebMOutputFormat(),target});
   const source=new CanvasSource(canvas,{codec:format==='mp4'?'avc':'vp9',quality:new Quality('high')});
   output.addVideoTrack(source,{frameRate:fps});
   await output.start();
   let previousSvg='',previousImage:HTMLImageElement|null=null;
   let visibleFrames=0;
   for(let i=0;i<total;i++){
    const t=i/fps;
    onTimeChange(t);
    await raf();await raf();
    const svg=board.querySelector<SVGSVGElement>('.artboard-base svg');
    if(!svg)throw new Error('Falta el SVG del fondo');
    const markup=svg.outerHTML;
    if(markup!==previousSvg){previousImage=await imageFromSvg(svg,resolution);previousSvg=markup}
    ctx.fillStyle='#171717';ctx.fillRect(0,0,800,800);
    if(previousImage)ctx.drawImage(previousImage,0,0,800,800);
    else throw new Error('No se pudo componer el fondo SVG');
    window.dispatchEvent(new CustomEvent('lab:render-3d-frame',{detail:{time:t}}));
    const gl=board.querySelector<HTMLCanvasElement>('.overlay-3d canvas');
    if(gl)drawCanvas(ctx,gl,board);
    board.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay .konvajs-content canvas').forEach(c=>drawCanvas(ctx,c,board));
    board.querySelectorAll<HTMLCanvasElement>('.konva-overlay .konvajs-content canvas').forEach(c=>drawCanvas(ctx,c,board));
    const pixels=ctx.getImageData(0,0,Math.min(resolution,800),Math.min(resolution,800)).data;
    let variation=false;
    for(let k=0;k<pixels.length;k+=4096){if(pixels[k]!==pixels[0]||pixels[k+1]!==pixels[1]||pixels[k+2]!==pixels[2]){variation=true;break}}
    if(variation)visibleFrames++;
    await source.add(t,1/fps,{keyFrame:i%fps===0});
    if(i%5===0||i===total-1)setStatus('Renderizando '+(i+1)+' / '+total+' fotogramas ('+Math.round((i+1)/total*100)+'%)');
   }
   if(visibleFrames===0)throw new Error('Todos los fotogramas aparecen uniformes. Se canceló el video para evitar exportar una pantalla vacía.');
   source.close();
   setStatus('Finalizando archivo…');
   await output.finalize();
   if(!target.buffer||target.buffer.byteLength<1024)throw new Error('El codificador devolvió un archivo vacío');
   const bytes=new Uint8Array(target.buffer);
   const blob=new Blob([bytes],{type:format==='mp4'?'video/mp4':'video/webm'});
   const check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
   const actualDuration=await check.computeDuration();
   if(!Number.isFinite(actualDuration)||Math.abs(actualDuration-seconds)>Math.max(.15,2/fps))throw new Error('Duración inválida: '+actualDuration.toFixed(2)+' s en lugar de '+seconds+' s. No se descargó el archivo.');
   download(blob,format);
   setStatus('Exportación completada: '+seconds+' s · '+resolution+' × '+resolution+' · '+total+' fotogramas · '+(bytes.byteLength/1048576).toFixed(1)+' MB');
  }catch(error){console.error('LAB export',error);setStatus('Error: '+(error instanceof Error?error.message:String(error)))}
  finally{window.dispatchEvent(new Event('lab:export-end'));onComplete();onExportStateChange?.(false);setBusy(false)}
 };
 return <section className="video-export"><h2>Exportar animación</h2><label>Formato<select value={format} disabled={busy} onChange={e=>setFormat(e.target.value as 'mp4'|'webm')}><option value="mp4">MP4</option><option value="webm">WebM</option></select></label><label>Resolución<select value={resolution} disabled={busy} onChange={e=>setResolution(Number(e.target.value))}><option value={800}>800 × 800 · Original</option><option value={1080}>1080 × 1080 · HD cuadrado</option><option value={2160}>2160 × 2160 · 4K cuadrado</option></select></label><label>FPS<select value={fps} disabled={busy} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option></select></label><button disabled={busy} onClick={record}>{busy?'Renderizando…':'↓ Exportar video'}</button><p role="status" className="note">{status||'Renderiza cada fotograma con tiempos exactos e incluye las capas 2D y 3D.'}</p></section>;
}
