export async function downloadPNG(svg:string,filename='LAB-composicion.png',size=1600):Promise<void>{
 const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);
 try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('No se pudo renderizar el SVG'));img.src=url;});
 const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas no disponible');ctx.drawImage(img,0,0,size,size);
 const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Error al exportar PNG')),'image/png'));
 const link=document.createElement('a');const pngUrl=URL.createObjectURL(png);link.href=pngUrl;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);
 }finally{URL.revokeObjectURL(url);}
}
