/**
 * LAB GENRE3D v3 -> LAB Studio bridge.
 * Pure parser: never mutates a Studio document or its 2D layers.
 * A caller must explicitly confirm and append returned GLB resources to a 3D scene.
 */
export type Genre3DAsset = { name: string; bytes: Uint8Array; sourcePath: string };
export type Genre3DReport = { assets: Genre3DAsset[]; warnings: string[]; version: number };
const MAX_JSON = 80 * 1024 * 1024;
const MAX_GLB = 40 * 1024 * 1024;
const MAX_ASSETS = 32;
const BASE64 = /^(?:data:model\/gltf-binary;base64,|data:application\/octet-stream;base64,)?([A-Za-z0-9+/]+={0,2})$/;
const keys = ['glb','glbBase64','base64','data','uri','src','content','modelData','embeddedGlb'];
function bytesFromBase64(value: string): Uint8Array | null {
  const match = value.replace(/\s/g,'').match(BASE64);
  if (!match) return null;
  const payload = match[1];
  if (payload.length > Math.ceil(MAX_GLB / 3) * 4 + 4) throw new Error('GLB excede 40 MB');
  const raw = atob(payload);
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  return isGlb(bytes) ? bytes : null;
}
export function isGlb(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 20 || bytes.byteLength > MAX_GLB) return false;
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  return view.getUint32(0,true)===0x46546c67 &&
    view.getUint32(4,true)===2 &&
    view.getUint32(8,true)===bytes.byteLength &&
    view.getUint32(12,true)+20<=bytes.byteLength &&
    view.getUint32(16,true)===0x4e4f534a;
}
export function inspectGenre3DProject(text: string): Genre3DReport {
  if (text.length > MAX_JSON) throw new Error('JSON excede 80 MB');
  let root: unknown;
  try { root=JSON.parse(text); } catch { throw new Error('JSON inválido'); }
  if (!root || typeof root!=='object' || Array.isArray(root)) throw new Error('Proyecto inválido');
  const record=root as Record<string,unknown>;
  const version=Number(record.version ?? record.projectVersion ?? record.schemaVersion ?? 0);
  const warnings:string[]=[];
  if (version!==3) warnings.push('Versión no confirmada como v3: '+String(version));
  const assets:Genre3DAsset[]=[];
  const visited=new WeakSet<object>();
  function visit(value:unknown,path:string,depth:number):void {
    if (depth>16 || assets.length>=MAX_ASSETS || !value || typeof value!=='object') return;
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) { value.forEach((v,i)=>visit(v,path+'['+i+']',depth+1));return; }
    const node=value as Record<string,unknown>;
    const name=String(node.name??node.filename??node.fileName??node.id??'modelo-'+(assets.length+1));
    for (const key of keys) {
      if (typeof node[key]!=='string') continue;
      const str=node[key] as string;
      if (str.length<32 || str.length>MAX_JSON) continue;
      let bytes:Uint8Array|null=null;
      try { bytes=bytesFromBase64(str); } catch(e) { warnings.push(path+'.'+key+': '+String(e)); }
      if (bytes) {
        assets.push({name:name.endsWith('.glb')?name:name+'.glb',bytes,sourcePath:path+'.'+key});
        break;
      }
    }
    for (const [key,child] of Object.entries(node)) if (child && typeof child==='object') visit(child,path+'.'+key,depth+1);
  }
  visit(root,'$',0);
  if (!assets.length) warnings.push('No se detectaron GLB embebidos; revisar esquema v3 real');
  warnings.push('No se transfieren automáticamente constraints, scripts, física, cámaras, luces ni timeline propietario.');
  warnings.push('La importación es aditiva; preservar el documento 2D requiere confirmación explícita del usuario.');
  return {assets,warnings,version};
}
