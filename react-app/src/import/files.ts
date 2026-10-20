export type SupportedAsset='image'|'svg'|'model';
export function classifyAsset(file:File):SupportedAsset|null{
 const ext=file.name.split('.').pop()?.toLowerCase();
 if(ext==='glb'||ext==='gltf')return 'model';
 if(ext==='svg')return 'svg';
 if(['png','jpg','jpeg','webp','gif'].includes(ext??''))return 'image';
 return null;
}
export function readImage(file:File):Promise<string>{
 if(classifyAsset(file)!=='image')return Promise.reject(new Error('Formato de imagen no admitido'));
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
}
