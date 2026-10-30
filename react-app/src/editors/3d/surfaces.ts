import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';
export const geometryOptions=[
 {id:'torus',name:'Nudo toroidal'},{id:'box',name:'Cubo'},{id:'sphere',name:'Esfera'},
 {id:'cone',name:'Cono'},{id:'cylinder',name:'Cilindro'},{id:'icosahedron',name:'Icosaedro'},
 {id:'plane',name:'Plano'},{id:'torus-ring',name:'Toro / dona'},{id:'tetrahedron',name:'Tetraedro'},
 {id:'octahedron',name:'Octaedro'},{id:'dodecahedron',name:'Dodecaedro'},{id:'capsule',name:'Cápsula'},
 {id:'prism',name:'Prisma triangular'},{id:'hex-prism',name:'Prisma hexagonal'},{id:'pyramid',name:'Pirámide'}
] as const;
export type GeometryKind=typeof geometryOptions[number]['id'];
export function createGeometry(kind:GeometryKind):THREE.BufferGeometry{
 switch(kind){
  case 'box':return new THREE.BoxGeometry(2,2,2);
  case 'sphere':return new THREE.SphereGeometry(1.3,40,24);
  case 'cone':return new THREE.ConeGeometry(1.25,2.5,40);
  case 'cylinder':return new THREE.CylinderGeometry(1.1,1.1,2.4,40);
  case 'icosahedron':return new THREE.IcosahedronGeometry(1.5,0);
  case 'plane':return new THREE.PlaneGeometry(2.7,2.7,12,12);
  case 'torus-ring':return new THREE.TorusGeometry(1,.35,24,64);
  case 'tetrahedron':return new THREE.TetrahedronGeometry(1.6);
  case 'octahedron':return new THREE.OctahedronGeometry(1.5);
  case 'dodecahedron':return new THREE.DodecahedronGeometry(1.45);
  case 'capsule':return new THREE.CapsuleGeometry(.7,1.3,8,24);
  case 'prism':return new THREE.CylinderGeometry(1.35,1.35,2.3,3);
  case 'hex-prism':return new THREE.CylinderGeometry(1.2,1.2,2.3,6);
  case 'pyramid':return new THREE.ConeGeometry(1.6,2.4,4);
  default:return new THREE.TorusKnotGeometry(.9,.3,120,16);
 }
}
export const materialOptions=[{id:'original',name:'Original del objeto'},{id:'metal',name:'Metal'},{id:'chrome',name:'Cromo'},{id:'plastic',name:'Plástico'},{id:'matte',name:'Mate'},{id:'wireframe',name:'Malla de alambre'},{id:'snake',name:'Piel de serpiente'},{id:'leopard',name:'Piel de leopardo'},{id:'fire',name:'Fuego incandescente'},{id:'lava',name:'Lava volcánica'},{id:'marble',name:'Mármol cósmico'},{id:'iridescent',name:'Ópalo iridiscente'}] as const;
export type SurfaceKind=typeof materialOptions[number]['id'];
export type Appearance={material:SurfaceKind;color:string;repeat:number};
export type TextureKind='snake'|'leopard'|'fire'|'lava'|'marble'|'iridescent';
export const isTexture=(kind:SurfaceKind):kind is TextureKind=>['snake','leopard','fire','lava','marble','iridescent'].includes(kind);
const clamp=(n:number)=>Math.max(0,Math.min(255,Math.round(n)));
const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
/** Tileable procedural color fields: generated locally, no external assets. */
export function texturePixels(kind:TextureKind,size=256):Uint8Array{
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;let r=0,g=0,b=0;
  if(kind==='snake'){
   const row=Math.floor(v*12),sx=(u*12+(row%2)*.5)%1,sy=(v*12)%1;
   const distance=Math.pow(Math.abs((sx-.5)/.5),1.3)+Math.pow(Math.abs((sy-.5)/.56),1.7);
   const edge=distance>.91?0.19:1;
   const diamond=.6+.4*Math.cos(u*Math.PI*8)*Math.cos(v*Math.PI*8);
   const light=.65+.35*(1-sy);
   r=(70+85*diamond)*edge*light;g=(85+85*diamond)*edge*light;b=(32+45*diamond)*edge*light;
  }else if(kind==='leopard'){
   const gx=Math.floor(u*7),gy=Math.floor(v*7);let mark=0;
   for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
    const cellX=gx+i,cellY=gy+j,wrapX=(cellX+7)%7,wrapY=(cellY+7)%7;
    const dx=u*7-cellX-.5-(hash(wrapX,wrapY)-.5)*.35,dy=v*7-cellY-.5-(hash(wrapX+9,wrapY)-.5)*.35;
    const angle=Math.atan2(dy,dx),d=Math.hypot(dx,dy)*(1+.16*Math.sin(angle*5+hash(wrapX,wrapY)*6));
    if((d>.23&&d<.36&&Math.sin(angle*3+wrapX)>.05)||d<.07)mark=1;
   }
   const fur=hash(x,y)*14;r=mark?35:211+fur;g=mark?25:143+fur;b=mark?17:65+fur;
  }else if(kind==='lava'){
   const field=Math.sin(u*Math.PI*12+Math.sin(v*Math.PI*8)*1.3)*Math.sin(v*Math.PI*10+Math.cos(u*Math.PI*6));
   const crack=Math.pow(Math.max(0,1-Math.abs(field)*10),2);
   r=24+231*crack;g=16+140*crack*crack;b=20+14*crack;
  }else if(kind==='marble'){
   const vein=Math.abs(Math.sin(u*Math.PI*6+Math.sin(v*Math.PI*4+Math.sin(u*Math.PI*4)*1.2)*2.7));
   const dark=Math.pow(1-vein,12),glow=Math.pow(1-vein,3);
   r=225-185*dark;g=223-195*dark-35*glow;b=243-100*dark;
  }else if(kind==='iridescent'){
   const phase=u*Math.PI*4+v*Math.PI*2+Math.sin(v*Math.PI*6)*.6;
   r=145+105*Math.sin(phase);g=145+105*Math.sin(phase+2.1);b=145+105*Math.sin(phase+4.2);
  }else{
   const flame=(Math.sin(u*Math.PI*12+Math.sin(v*Math.PI*4)*2)+Math.sin(u*Math.PI*20-v*Math.PI*8)*.5+Math.sin(u*Math.PI*6+v*Math.PI*4)*.5)/2;
   const heat=Math.max(0,Math.min(1,(flame+1)*.5));
   r=50+205*Math.min(1,heat*1.7);g=Math.max(0,heat-.25)*310;b=Math.max(0,heat-.68)*520;
  }
  const index=(y*size+x)*4;data[index]=clamp(r);data[index+1]=clamp(g);data[index+2]=clamp(b);data[index+3]=255;
 }
 return data;
}
export function createSurfaceTexture(kind:TextureKind,repeat=1){
 const texture=new THREE.DataTexture(texturePixels(kind),256,256,THREE.RGBAFormat);
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
export function createSurfaceMaterial(appearance:Appearance){
 const kind=appearance.material;
 const material=new THREE.MeshPhysicalMaterial({color:appearance.color,metalness:kind==='chrome'?1:kind==='metal'?.8:.05,roughness:kind==='chrome'?.08:kind==='metal'?.25:kind==='plastic'?.35:.8,wireframe:kind==='wireframe',side:THREE.DoubleSide});
 if(isTexture(kind)){
  material.map=createSurfaceTexture(kind,appearance.repeat);
  if(kind==='snake'){material.bumpMap=material.map;material.bumpScale=.055;}
  if(kind==='iridescent'){material.iridescence=1;material.iridescenceIOR=1.3;material.roughness=.18;material.metalness=.3;material.clearcoat=1;}
  if(kind==='fire'||kind==='lava'){material.emissive.set('#ffffff');material.emissiveMap=material.map;material.emissiveIntensity=.65;}
 }
 material.userData.labSurface=kind;
 return material;
}
const originals=new WeakMap<THREE.Mesh,THREE.Material|THREE.Material[]>();
const list=(m:THREE.Material|THREE.Material[])=>Array.isArray(m)?m:[m];
function disposeMaterials(materials:THREE.Material[]){const textures=new Set<THREE.Texture>();for(const material of new Set(materials)){for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);material.dispose();}textures.forEach(t=>t.dispose());}
export function applyObjectAppearance(root:THREE.Object3D,appearance:Appearance){
 root.traverse(node=>{if(!(node instanceof THREE.Mesh))return;if(!originals.has(node))originals.set(node,node.material);const original=originals.get(node)!;if(node.material!==original)disposeMaterials(list(node.material));node.material=appearance.material==='original'?original:createSurfaceMaterial(appearance);});
 root.userData.labAppearance={...appearance};
}
export function disposeSceneObject(root:THREE.Object3D){const geometries=new Set<THREE.BufferGeometry>(),materials:THREE.Material[]=[];root.traverse(node=>{if(node instanceof THREE.Mesh){geometries.add(node.geometry);materials.push(...list(node.material));const original=originals.get(node);if(original)materials.push(...list(original));originals.delete(node);}});geometries.forEach(g=>g.dispose());disposeMaterials(materials);}
const cloneMaterial=(material:THREE.Material)=>{const copy=material.clone();const textures=new Map<THREE.Texture,THREE.Texture>();for(const [key,value] of Object.entries(copy))if(value instanceof THREE.Texture){if(!textures.has(value))textures.set(value,value.clone());(copy as unknown as Record<string,unknown>)[key]=textures.get(value);}return copy;};
export function cloneSceneObject(root:THREE.Object3D){const clone=cloneSkeleton(root),sources:THREE.Mesh[]=[];root.traverse(n=>{if(n instanceof THREE.Mesh)sources.push(n);});let index=0;clone.traverse(n=>{if(!(n instanceof THREE.Mesh))return;const source=sources[index++];n.geometry=source.geometry.clone();n.material=Array.isArray(source.material)?source.material.map(cloneMaterial):cloneMaterial(source.material);const original=originals.get(source);if(original)originals.set(n,Array.isArray(original)?original.map(cloneMaterial):cloneMaterial(original));});return clone;}
export function disposeSurfaceMaterial(material:THREE.Material){disposeMaterials([material]);}
/** Time-based flow stays reproducible when seeking or exporting a frame. */
export function animateObjectSurface(root:THREE.Object3D,seconds:number){root.traverse(node=>{if(!(node instanceof THREE.Mesh))return;for(const material of list(node.material)){if(!(material instanceof THREE.MeshStandardMaterial)||!material.map)continue;const kind=material.userData.labSurface;if(!isTexture(kind))continue;material.map.offset.set(kind==='lava'?Math.sin(seconds*.25)*.08:kind==='iridescent'?seconds*.035:0,kind==='fire'?-seconds*.12:0);}});}
