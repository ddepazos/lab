import {useEffect,useRef} from 'react';
import * as THREE from 'three';
export type OverlaySettings={kind:'torus'|'sphere'|'box';color:string;speed:number;scale:number;opacity:number;direction:'x'|'y'|'z';playing:boolean};
export function Overlay3D({settings}:{settings:OverlaySettings}){
 const mount=useRef<HTMLDivElement>(null),settingsRef=useRef(settings);
 settingsRef.current=settings;
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch(error){console.error('WebGL 3D no disponible',error);return;}
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,0,6);
  scene.add(new THREE.AmbientLight(0xffffff,1.8));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  const material=new THREE.MeshStandardMaterial({color:settingsRef.current.color,metalness:.35,roughness:.3,transparent:true});
  const meshes={
   torus:new THREE.TorusKnotGeometry(.85,.28,120,16),
   sphere:new THREE.SphereGeometry(1.25,48,32),
   box:new THREE.BoxGeometry(2,2,2)
  };
  const mesh=new THREE.Mesh(meshes[settingsRef.current.kind],material);scene.add(mesh);
  const resize=()=>{const side=Math.max(1,host.clientWidth);camera.aspect=1;camera.updateProjectionMatrix();renderer.setSize(side,side,false)};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let frame=0,last=0;
  const loop=(t:number)=>{
   const s=settingsRef.current;
   if(mesh.geometry!==meshes[s.kind])mesh.geometry=meshes[s.kind];
   material.color.set(s.color);material.opacity=s.opacity/100;
   mesh.scale.setScalar(s.scale);
   if(last&&s.playing)mesh.rotation[s.direction]+=Math.min(.05,(t-last)/1000)*s.speed;
   last=t;
   renderer.render(scene,camera);
   frame=requestAnimationFrame(loop);
  };
  frame=requestAnimationFrame(loop);
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();scene.remove(mesh);Object.values(meshes).forEach(g=>g.dispose());material.dispose();renderer.dispose();renderer.domElement.remove()};
 },[]);
 return <div ref={mount} className="overlay-3d" aria-label="Objeto tridimensional animado" />;
}
