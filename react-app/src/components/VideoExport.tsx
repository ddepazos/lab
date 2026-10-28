import {useState} from 'react';
import {videoDimensions} from '../export/videoDimensions';
import {BufferTarget,CanvasSource,Mp4OutputFormat,WebMOutputFormat,Output,Quality,Input,BlobSource,ALL_FORMATS} from 'mediabunny';
type Props={artboardSelector:string;duration:number;onTimeChange:(time:number)=>void;onComplete:()=>void;onExportStateChange?:(busy:boolean)=>void};
const raf=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
function drawCanvas(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,board:HTMLElement,width:number,height:number){
 const a=board.getBoundingClientRect(),r=canvas.getBoundingClientRect();
 if(!a.width||!a.height||!r.width||!r.height||!canvas.width||!canvas.height)return;
 ctx.drawImage(canvas,(r.left-a.left)/a.width*width,(r.top-a.top)/a.height*height,r.width/a.width*width,r.height/a.height*height);
}
function imageFromSvg(svg:SVGSVGElement,width:number,height:number):Promise<HTMLImageElement>{
 const clone=svg.cloneNode(true) as SVGSVGElement;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 // Imported PNG/JPG/WebP images are composited from the original SVG separately below.
 // Embedded data URLs in SVG image elements can make Chromium reject the entire SVG as an image.
 clone.querySelectorAll('image,foreignObject').forEach(node=>node.remove());
 clone.setAttribute('width',String(width));clone.setAttribute('height',String(height));
 const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo procesar el fondo SVG de la animación'))};
  img.src=url;
 });
}
async function drawImportedImages(ctx:CanvasRenderingContext2D,svg:SVGSVGElement,width:number,height:number){
 const view=svg.viewBox.baseVal;const sx=width/(view.width||width),sy=height/(view.height||height);
 const nodes=Array.from(svg.querySelectorAll<SVGImageElement>('image'));
 for(const node of nodes){
  const href=node.getAttribute('href')||node.getAttribute('xlink:href');if(!href||!href.startsWith('data:image/'))continue;
  const img=new Image();img.src=href;
  try{await img.decode()}catch{continue}
  const x=node.x.baseVal.value,y=node.y.baseVal.value,w=node.width.baseVal.value,h=node.height.baseVal.value;
  const transform=node.getCTM();
  ctx.save();ctx.scale(sx,sy);
  if(transform)ctx.transform(transform.a,transform.b,transform.c,transform.d,transform.e,transform.f);
  ctx.drawImage(img,x,y,w,h);ctx.restore();
 }
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
 const [fps,setFps]=useState(30);
 const [menuOpen,setMenuOpen]=useState(false);
 const record=async(selectedFormat:'mp4'|'webm')=>{
  if(busy)return;
  const board=document.querySelector<HTMLElement>(artboardSelector);
  if(!board){setStatus('No se encontró el lienzo');return}
  if(typeof VideoEncoder==='undefined'){setStatus('Este navegador no admite WebCodecs');return}
  const seconds=Math.max(1,Math.min(30,Number.isFinite(duration)?duration:5));
  const total=Math.round(seconds*fps);
  setBusy(true);onExportStateChange?.(true);setStatus('Preparando '+total+' fotogramas…');
  try{
   const sourceSvg=board.querySelector<SVGSVGElement>('.artboard-base svg');
   const vb=sourceSvg?.viewBox.baseVal;
   const sourceWidth=vb&&vb.width>0?vb.width:Math.max(1,board.clientWidth);
   const sourceHeight=vb&&vb.height>0?vb.height:Math.max(1,board.clientHeight);
   const {width:exportWidth,height:exportHeight}=videoDimensions(resolution,sourceWidth,sourceHeight);
   if(resolution===3840&&!(exportWidth===3840&&exportHeight===2160))setStatus('4K mantiene la proporción del proyecto: '+exportWidth+' × '+exportHeight);
   const canvas=document.createElement('canvas');canvas.width=exportWidth;canvas.height=exportHeight;
   const ctx=canvas.getContext('2d',{alpha:false});
   
   if(!ctx)throw new Error('No se pudo crear el canvas de exportación');
   await document.fonts.ready;
   await raf();await raf();
   const target=new BufferTarget();
   const output=new Output({format:selectedFormat==='mp4'?new Mp4OutputFormat():new WebMOutputFormat(),target});
   const source=new CanvasSource(canvas,{codec:selectedFormat==='mp4'?'avc':'vp9',quality:new Quality('high')});
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
    if(markup!==previousSvg){previousImage=await imageFromSvg(svg,exportWidth,exportHeight);previousSvg=markup}
    ctx.fillStyle='#171717';ctx.fillRect(0,0,exportWidth,exportHeight);
    if(previousImage)ctx.drawImage(previousImage,0,0,exportWidth,exportHeight);
    else throw new Error('No se pudo componer el fondo SVG');
    await drawImportedImages(ctx,svg,exportWidth,exportHeight);
    window.dispatchEvent(new CustomEvent('lab:render-3d-frame',{detail:{time:t,width:exportWidth,height:exportHeight}}));
    const gl=board.querySelector<HTMLCanvasElement>('.overlay-3d canvas');
    if(gl)drawCanvas(ctx,gl,board,exportWidth,exportHeight);
    board.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay .konvajs-content canvas').forEach(c=>drawCanvas(ctx,c,board,exportWidth,exportHeight));
    board.querySelectorAll<HTMLCanvasElement>('.konva-overlay .konvajs-content canvas').forEach(c=>drawCanvas(ctx,c,board,exportWidth,exportHeight));
    const pixels=ctx.getImageData(0,0,Math.min(exportWidth,800),Math.min(exportHeight,800)).data;
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
   const blob=new Blob([bytes],{type:selectedFormat==='mp4'?'video/mp4':'video/webm'});
   const check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
   const actualDuration=await check.computeDuration();
   if(!Number.isFinite(actualDuration)||Math.abs(actualDuration-seconds)>Math.max(.15,2/fps))throw new Error('Duración inválida: '+actualDuration.toFixed(2)+' s en lugar de '+seconds+' s. No se descargó el archivo.');
   download(blob,selectedFormat);
   setStatus('Exportación completada: '+seconds+' s · '+exportWidth+' × '+exportHeight+' · '+total+' fotogramas · '+(bytes.byteLength/1048576).toFixed(1)+' MB');
  }catch(error){console.error('LAB export',error);setStatus('Error: '+(error instanceof Error?error.message:String(error)))}
  finally{window.dispatchEvent(new Event('lab:export-end'));onComplete();onExportStateChange?.(false);setBusy(false)}
 };
 return <section className="video-export"><h2>Exportar animación</h2><label>Resolución<select value={resolution} disabled={busy} onChange={e=>setResolution(Number(e.target.value))}><option value={800}>800 px · lado mayor</option><option value={1080}>1080 px · lado mayor</option><option value={2160}>2160 px · lado mayor</option><option value={3840}>3840 px · 4K UHD (16:9)</option></select></label><label>FPS<select value={fps} disabled={busy} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option></select></label><div className="lab-download-menu"><button type="button" aria-haspopup="true" aria-expanded={menuOpen} disabled={busy} onClick={()=>setMenuOpen(value=>!value)}>{busy?'Renderizando…':'↓ Exportar video ▾'}</button>{menuOpen&&!busy&&<div className="lab-download-options" role="group" aria-label="Tipos de descarga"><button type="button" onClick={()=>{setMenuOpen(false);void record('mp4')}}>Descargar MP4 · H.264</button><button type="button" onClick={()=>{setMenuOpen(false);void record('webm')}}>Descargar WebM · VP9</button></div>}</div><p role="status" className="note">{status||'Renderiza cada fotograma con tiempos exactos e incluye las capas 2D y 3D.'}</p></section>;
}
