/** Rasterize the SVG at its document aspect ratio, independent of CSS preview size. */
export async function downloadPNG(svg:string,filename='LAB-composicion.png',size=1600,board?:HTMLElement|null):Promise<void>{
 const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
 const parserError=parsed.querySelector('parsererror');
 if(parserError||parsed.documentElement.localName!=='svg')throw new Error(`SVG inválido: ${parserError?.textContent?.trim().slice(0,180)??'raíz SVG ausente'}`);
 const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 try{
  const img=new Image();
  await new Promise<void>((resolve,reject)=>{
   img.onload=()=>resolve();
   img.onerror=()=>reject(new Error('No se pudo renderizar el SVG'));
   img.src=url;
  });
  const root=parsed.documentElement;
  const viewBox=root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  const widthAttr=Number.parseFloat(root.getAttribute('width')??'');
  const heightAttr=Number.parseFloat(root.getAttribute('height')??'');
  const sourceWidth=viewBox?.length===4&&viewBox[2]>0?viewBox[2]:widthAttr>0?widthAttr:img.naturalWidth;
  const sourceHeight=viewBox?.length===4&&viewBox[3]>0?viewBox[3]:heightAttr>0?heightAttr:img.naturalHeight;
  if(!(sourceWidth>0&&sourceHeight>0))throw new Error('Dimensiones SVG no válidas');
  // The requested size is the longest edge. Never stretch a non-square canvas.
  const scale=Math.max(1,Math.round(size))/Math.max(sourceWidth,sourceHeight);
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(sourceWidth*scale));
  canvas.height=Math.max(1,Math.round(sourceHeight*scale));
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas no disponible');
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  // Composite browser-rendered WebGL and interactive canvas layers over the SVG.
  // Preview pixels map to export pixels; CSS zoom never changes document resolution.
  if(board){
   const bounds=board.getBoundingClientRect();
   if(bounds.width>0&&bounds.height>0){
    const surfaces=[
     ...board.querySelectorAll<HTMLCanvasElement>('.overlay-3d canvas'),
     ...board.querySelectorAll<HTMLCanvasElement>('.konva-text-overlay canvas'),
     ...board.querySelectorAll<HTMLCanvasElement>('.konva-overlay canvas')
    ];
    for(const surface of surfaces){
     const rect=surface.getBoundingClientRect();
     if(!surface.width||!surface.height||!rect.width||!rect.height)continue;
     ctx.drawImage(surface,(rect.left-bounds.left)/bounds.width*canvas.width,
      (rect.top-bounds.top)/bounds.height*canvas.height,
      rect.width/bounds.width*canvas.width,rect.height/bounds.height*canvas.height);
    }
   }
  }
  const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Error al exportar PNG')),'image/png'));
  const pngUrl=URL.createObjectURL(png);
  try{
   const link=document.createElement('a');
   link.href=pngUrl;link.download=filename;link.click();
  }finally{setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);}
 }finally{URL.revokeObjectURL(url);}
}
