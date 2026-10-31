import {describe,it,expect} from 'vitest';
import {inspectGenre3DProject,isGlb} from './genre3dBridge';
function glb():Uint8Array {
 const json=new TextEncoder().encode('{"asset":{"version":"2.0"}}   ');
 const out=new Uint8Array(20+json.length);
 const view=new DataView(out.buffer);
 view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);
 view.setUint32(8,out.length,true);view.setUint32(12,json.length,true);
 view.setUint32(16,0x4e4f534a,true);out.set(json,20);
 return out;
}
describe('GENRE3D bridge',()=>{
 it('rejects malformed projects',()=>expect(()=>inspectGenre3DProject('{')).toThrow());
 it('detects embedded GLB without changing input',()=>{
  const bytes=glb();const binary=Array.from(bytes,x=>String.fromCharCode(x)).join('');
  const source=JSON.stringify({version:3,assets:[{name:'altar.glb',glbBase64:btoa(binary)}],layers:[{type:'2d',id:'keep'}]});
  const original=source;
  const result=inspectGenre3DProject(source);
  expect(source).toBe(original);expect(result.version).toBe(3);
  expect(result.assets).toHaveLength(1);expect(result.assets[0].name).toBe('altar.glb');
  expect(isGlb(result.assets[0].bytes)).toBe(true);
 });
 it('does not accept a fake GLB',()=>expect(isGlb(new Uint8Array(20))).toBe(false));
 it('reports missing assets',()=>expect(inspectGenre3DProject('{"version":3}').warnings.some(w=>w.includes('No se detectaron'))).toBe(true));
});
