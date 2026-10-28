import {geometryOptions,createGeometry,createSurfaceMaterial,disposeSurfaceMaterial,applyObjectAppearance,disposeSceneObject,animateObjectSurface} from './surfaces';
import type {GeometryKind,SurfaceKind} from './surfaces';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export type OverlaySettings={kind:GeometryKind;material:SurfaceKind;textureRepeat?:number;modelUrl?:string;color:string;speed:number;scale:number;opacity:number;direction:'x'|'y'|'z';playing:boolean;motion?:'rotation'|'pulse'|'blink'|'bounce'|'float'|'swing'|'drift';motionDuration?:number;motionIntensity?:number;motionStart?:number};
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
  // The composition overlay may inherit pointer-events:none from its CSS parent.
  // Re-enable hit testing on the WebGL canvas so the imported model can be dragged.
  host.style.pointerEvents='auto';renderer.domElement.style.pointerEvents='auto';
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,0,6);
  const placement=new THREE.Group();scene.add(placement);
  const rotationGroup=new THREE.Group();placement.add(rotationGroup);
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  let dragging=false,dragStartX=0,dragStartY=0,dragOriginX=0,dragOriginY=0;
  const positionAt=(event:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.at(6/Math.max(.01,-raycaster.ray.direction.z),new THREE.Vector3());};
  const onPointerDown=(event:PointerEvent)=>{if(event.button!==0)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(model?[model]:[mesh],true);if(!hits.length)return;const p=positionAt(event);dragging=true;dragStartX=p.x;dragStartY=p.y;dragOriginX=placement.position.x;dragOriginY=placement.position.y;renderer.domElement.setPointerCapture(event.pointerId);renderer.domElement.style.cursor='grabbing';event.preventDefault();};
  const onPointerMove=(event:PointerEvent)=>{if(!dragging)return;const p=positionAt(event);placement.position.x=dragOriginX+p.x-dragStartX;placement.position.y=dragOriginY+p.y-dragStartY;};
  const onPointerUp=(event:PointerEvent)=>{if(!dragging)return;dragging=false;renderer.domElement.style.cursor='';if(renderer.domElement.hasPointerCapture(event.pointerId))renderer.domElement.releasePointerCapture(event.pointerId);};
  renderer.domElement.style.touchAction='none';renderer.domElement.addEventListener('pointerdown',onPointerDown);renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerup',onPointerUp);renderer.domElement.addEventListener('pointercancel',onPointerUp);
  scene.add(new THREE.AmbientLight(0xffffff,1.8));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
  let material=createSurfaceMaterial({material:settingsRef.current.material,color:settingsRef.current.color,repeat:settingsRef.current.textureRepeat??1});material.transparent=true;
  const meshes=Object.fromEntries(geometryOptions.map(g=>[g.id,createGeometry(g.id)])) as Record<GeometryKind,THREE.BufferGeometry>;
  const mesh=new THREE.Mesh(meshes[settingsRef.current.kind],material);rotationGroup.add(mesh);
  let model:THREE.Group|null=null;let materialKey='',modelMaterialKey='';let currentModelUrl='';let loadId=0;let modelBaseScale=1;
  const loader=new GLTFLoader();
  const updateMaterial=(state:OverlaySettings)=>{const appearance={material:state.material,color:state.color,repeat:state.textureRepeat??1};const key=JSON.stringify(appearance);if(key!==materialKey){disposeSurfaceMaterial(material);material=createSurfaceMaterial(appearance);material.transparent=true;mesh.material=material;materialKey=key;}if(model&&key!==modelMaterialKey){applyObjectAppearance(model,appearance);modelMaterialKey=key;}};
  const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let frame=0,last=0,exporting=false,elapsed=0;
  let exportSize:{width:number;height:number}|null=null;
  const animate=(seconds:number,state:OverlaySettings)=>{animateObjectSurface(mesh,seconds);if(model)animateObjectSurface(model,seconds);const phase=(seconds-(state.motionStart??0))*2*Math.PI/Math.max(.2,state.motionDuration??3);const intensity=Math.max(0,Math.min(2,(state.motionIntensity??50)/100));const wave=Math.sin(phase);const motion=state.motion??'rotation';const scale=state.scale*(motion==='pulse'?1+intensity*.35*(1-wave)/2:1);mesh.scale.setScalar(scale);if(model)model.scale.setScalar(scale*modelBaseScale);const opacity=state.opacity/100*(motion==='blink'?(wave>=0?1:0.04):1);material.opacity=opacity;mesh.position.set(0,0,0);if(model)model.position.y=0;mesh.rotation.set(0,0,0);if(model)model.rotation.set(0,0,0);if(motion==='rotation'){mesh.rotation[state.direction]=seconds*state.speed;if(model)model.rotation[state.direction]=seconds*state.speed;}if(motion==='bounce'||motion==='float'){const y=motion==='bounce'?Math.abs(wave)*intensity:wave*intensity*.5;mesh.position.y=y;if(model)model.position.y=y;}if(motion==='swing'){mesh.rotation.z=wave*intensity*.6;if(model)model.rotation.z=wave*intensity*.6;}if(motion==='drift'){mesh.position.x=wave*intensity;if(model)model.position.x=wave*intensity;}};

  const renderAt=(event:Event)=>{const detail=(event as CustomEvent<{time:number;width?:number;height?:number}>).detail;const t=detail.time;exporting=true;
   if(detail.width&&detail.height){const width=Math.max(1,Math.round(detail.width)),height=Math.max(1,Math.round(detail.height));if(!exportSize||exportSize.width!==width||exportSize.height!==height){exportSize={width,height};renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}}const state=settingsRef.current;mesh.geometry=meshes[state.kind];updateMaterial(state);animate(t,state);renderer.render(scene,camera)};
  const resume=()=>{exporting=false;last=0;exportSize=null;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));resize()};
  window.addEventListener('lab:render-3d-frame',renderAt);
  window.addEventListener('lab:export-end',resume);
  const loop=(t:number)=>{
   const s=settingsRef.current;
   if(mesh.geometry!==meshes[s.kind])mesh.geometry=meshes[s.kind];
   if((s.modelUrl??'')!==currentModelUrl){currentModelUrl=s.modelUrl??'';const id=++loadId;if(model){rotationGroup.remove(model);disposeSceneObject(model);model=null;modelMaterialKey='';}mesh.visible=!currentModelUrl;if(currentModelUrl){loader.load(currentModelUrl,gltf=>{if(id!==loadId){disposeSceneObject(gltf.scene);return;}model=gltf.scene;modelMaterialKey='';const bounds=new THREE.Box3().setFromObject(model);const extent=bounds.getSize(new THREE.Vector3());const largest=Math.max(extent.x,extent.y,extent.z,.001);modelBaseScale=2.5/largest;model.scale.setScalar(modelBaseScale);const center=bounds.getCenter(new THREE.Vector3());model.position.copy(center).multiplyScalar(-2.5/largest);rotationGroup.add(model);},undefined,error=>console.error('No se pudo cargar GLB/GLTF',error))}}
   updateMaterial(s);if(!exporting&&last&&s.playing)elapsed+=Math.min(.05,(t-last)/1000)*s.speed;animate(elapsed,s);
   last=t;
   if(!exporting)renderer.render(scene,camera);
   frame=requestAnimationFrame(loop);
  };
  frame=requestAnimationFrame(loop);
  return ()=>{window.removeEventListener('lab:render-3d-frame',renderAt);window.removeEventListener('lab:export-end',resume);cancelAnimationFrame(frame);observer.disconnect();loadId++;if(model){scene.remove(model);disposeSceneObject(model);}rotationGroup.remove(mesh);renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('pointercancel',onPointerUp);Object.values(meshes).forEach(g=>g.dispose());disposeSurfaceMaterial(material);renderer.dispose();renderer.domElement.remove()};
 },[]);
 return <div ref={mount} className="overlay-3d" style={{pointerEvents:'auto'}} aria-label="Objeto tridimensional animado: arrastra con el mouse para moverlo" />;
}
