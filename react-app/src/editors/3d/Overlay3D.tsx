import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export type OverlaySettings={kind:'torus'|'sphere'|'box'|'cone'|'cylinder'|'icosahedron'|'plane';material:'metal'|'chrome'|'plastic'|'matte'|'wireframe';modelUrl?:string;color:string;speed:number;scale:number;opacity:number;direction:'x'|'y'|'z';playing:boolean;motion?:'rotation'|'pulse'|'blink'|'bounce'|'float'|'swing'|'drift';motionDuration?:number;motionIntensity?:number;motionStart?:number};
export function Overlay3D({settings}:{settings:OverlaySettings}){
 const mount=useRef<HTMLDivElement>(null),settingsRef=useRef(settings);
 settingsRef.current=settings;
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch(error){console.error('WebGL 3D no disponible',error);return;}
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
   box:new THREE.BoxGeometry(2,2,2),
   cone:new THREE.ConeGeometry(1.35,2.5,48),
   cylinder:new THREE.CylinderGeometry(1.1,1.1,2.4,48),
   icosahedron:new THREE.IcosahedronGeometry(1.5,1),
   plane:new THREE.PlaneGeometry(2.7,2.7,12,12)
  };
  const mesh=new THREE.Mesh(meshes[settingsRef.current.kind],material);scene.add(mesh);
  let model:THREE.Group|null=null;let currentModelUrl='';let loadId=0;let modelBaseScale=1;
  const loader=new GLTFLoader();
  const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let frame=0,last=0,exporting=false,elapsed=0;
  const animate=(seconds:number,state:OverlaySettings)=>{const phase=(seconds-(state.motionStart??0))*2*Math.PI/Math.max(.2,state.motionDuration??3);const intensity=Math.max(0,Math.min(2,(state.motionIntensity??50)/100));const wave=Math.sin(phase);const motion=state.motion??'rotation';const scale=state.scale*(motion==='pulse'?1+intensity*.35*(1-wave)/2:1);mesh.scale.setScalar(scale);if(model)model.scale.setScalar(scale*modelBaseScale);const opacity=state.opacity/100*(motion==='blink'?(wave>=0?1:0.04):1);material.opacity=opacity;mesh.position.set(0,0,0);if(model)model.position.y=0;mesh.rotation.set(0,0,0);if(model)model.rotation.set(0,0,0);if(motion==='rotation'){mesh.rotation[state.direction]=seconds*state.speed;if(model)model.rotation[state.direction]=seconds*state.speed;}if(motion==='bounce'||motion==='float'){const y=motion==='bounce'?Math.abs(wave)*intensity:wave*intensity*.5;mesh.position.y=y;if(model)model.position.y=y;}if(motion==='swing'){mesh.rotation.z=wave*intensity*.6;if(model)model.rotation.z=wave*intensity*.6;}if(motion==='drift'){mesh.position.x=wave*intensity;if(model)model.position.x=wave*intensity;}};

  const renderAt=(event:Event)=>{const t=(event as CustomEvent<{time:number}>).detail.time;exporting=true;const state=settingsRef.current;mesh.geometry=meshes[state.kind];material.wireframe=state.material==='wireframe';material.metalness=state.material==='chrome'?1:state.material==='metal'?.8:state.material==='plastic'?.05:.1;material.roughness=state.material==='chrome'?.08:state.material==='metal'?.24:state.material==='plastic'?.35:.9;material.color.set(state.color);material.opacity=state.opacity/100;animate(t,state);renderer.render(scene,camera)};
  const resume=()=>{exporting=false;last=0};
  window.addEventListener('lab:render-3d-frame',renderAt);
  window.addEventListener('lab:export-end',resume);
  const loop=(t:number)=>{
   const s=settingsRef.current;
   if(mesh.geometry!==meshes[s.kind])mesh.geometry=meshes[s.kind];
   if(s.modelUrl!==currentModelUrl){currentModelUrl=s.modelUrl??'';const id=++loadId;if(model){scene.remove(model);model=null;}mesh.visible=!currentModelUrl;if(currentModelUrl){loader.load(currentModelUrl,gltf=>{if(id!==loadId)return;model=gltf.scene;const bounds=new THREE.Box3().setFromObject(model);const extent=bounds.getSize(new THREE.Vector3());const largest=Math.max(extent.x,extent.y,extent.z,.001);modelBaseScale=2.5/largest;model.scale.setScalar(modelBaseScale);const center=bounds.getCenter(new THREE.Vector3());model.position.copy(center).multiplyScalar(-2.5/largest);scene.add(model);},undefined,error=>console.error('No se pudo cargar GLB/GLTF',error))}}
   const mat=s.material;material.wireframe=mat==='wireframe';material.metalness=mat==='chrome'?1:mat==='metal'?.8:mat==='plastic'?.05:.1;material.roughness=mat==='chrome'?.08:mat==='metal'?.24:mat==='plastic'?.35:.9;
   material.color.set(s.color);if(!exporting&&last&&s.playing)elapsed+=Math.min(.05,(t-last)/1000)*s.speed;animate(elapsed,s);
   last=t;
   if(!exporting)renderer.render(scene,camera);
   frame=requestAnimationFrame(loop);
  };
  frame=requestAnimationFrame(loop);
  return ()=>{window.removeEventListener('lab:render-3d-frame',renderAt);window.removeEventListener('lab:export-end',resume);cancelAnimationFrame(frame);observer.disconnect();loadId++;if(model)scene.remove(model);scene.remove(mesh);Object.values(meshes).forEach(g=>g.dispose());material.dispose();renderer.dispose();renderer.domElement.remove()};
 },[]);
 return <div ref={mount} className="overlay-3d" aria-label="Objeto tridimensional animado" />;
}
