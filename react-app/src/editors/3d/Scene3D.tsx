import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function Scene3D(){
 const mount=useRef<HTMLDivElement>(null);
 const object=useRef<THREE.Object3D|null>(null);
 const sceneRef=useRef<THREE.Scene|null>(null);
 const [kind,setKind]=useState<'box'|'sphere'|'torus'>('torus');
 const [speed,setSpeed]=useState(1);
 const [playing,setPlaying]=useState(true);
 const [scale,setScale]=useState(1);
 const [color,setColor]=useState('#ff5a00');
 const [status,setStatus]=useState('Arrastra para orbitar · rueda para acercar');
 const [renderer,setRenderer]=useState<THREE.WebGLRenderer|null>(null);
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#171717');sceneRef.current=scene;
  const camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.set(4,3,6);
  const gl=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});gl.setPixelRatio(Math.min(window.devicePixelRatio,2));host.appendChild(gl.domElement);setRenderer(gl);
  const controls=new OrbitControls(camera,gl.domElement);controls.enableDamping=true;
  scene.add(new THREE.AmbientLight(0xffffff,1.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);scene.add(light);
  const grid=new THREE.GridHelper(10,10,0x444444,0x292929);scene.add(grid);
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();gl.setSize(w,h);};resize();
  const observer=new ResizeObserver(resize);observer.observe(host);
  let frame=0;const loop=()=>{frame=requestAnimationFrame(loop);controls.update();gl.render(scene,camera);};loop();
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();if(object.current){scene.remove(object.current);}gl.dispose();gl.domElement.remove();sceneRef.current=null;object.current=null;};
 },[]);
 useEffect(()=>{const scene=sceneRef.current;if(!scene)return;if(object.current){scene.remove(object.current);object.current.traverse(n=>{if(n instanceof THREE.Mesh){n.geometry.dispose();(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>m.dispose());}});}
 const geometry=kind==='box'?new THREE.BoxGeometry(2,2,2):kind==='sphere'?new THREE.SphereGeometry(1.3,40,24):new THREE.TorusKnotGeometry(.9,.3,120,16);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.35}));mesh.scale.setScalar(scale);scene.add(mesh);object.current=mesh;
 },[kind]);
 useEffect(()=>{object.current?.scale.setScalar(scale);},[scale]);
 useEffect(()=>{object.current?.traverse(n=>{if(n instanceof THREE.Mesh){const mats=Array.isArray(n.material)?n.material:[n.material];mats.forEach(m=>{if(m instanceof THREE.MeshStandardMaterial)m.color.set(color);});}});},[color]);
 useEffect(()=>{if(!playing)return;let id=0,last=0;const tick=(t:number)=>{if(last&&object.current)object.current.rotation.y+=(t-last)*.001*speed;last=t;id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(id);},[playing,speed]);
 async function upload(file:File){if(!/\.(glb|gltf)$/i.test(file.name)){setStatus('Usa un archivo GLB o GLTF');return;}try{const url=URL.createObjectURL(file);const loader=new GLTFLoader();const result=await loader.loadAsync(url);URL.revokeObjectURL(url);const scene=sceneRef.current;if(!scene)return;if(object.current)scene.remove(object.current);const model=result.scene;const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3()).length();if(size>0)model.scale.setScalar(3/size);const center=box.getCenter(new THREE.Vector3());model.position.sub(center.multiplyScalar(3/Math.max(size,.00001)));scene.add(model);object.current=model;setStatus('Modelo cargado: '+file.name);}catch(e){setStatus('No se pudo abrir el modelo: '+String(e));}}
 function record(){const canvas=renderer?.domElement;if(!canvas||!('MediaRecorder'in window)){setStatus('Grabación WebM no disponible en este navegador');return;}const stream=canvas.captureStream(30);const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime){setStatus('Este navegador no admite WebM');return;}const chunks:Blob[]=[];const recorder=new MediaRecorder(stream,{mimeType:mime});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{const url=URL.createObjectURL(new Blob(chunks,{type:mime}));const a=document.createElement('a');a.href=url;a.download='LAB-3D.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);stream.getTracks().forEach(t=>t.stop());setStatus('Video WebM exportado');};setPlaying(true);recorder.start();setStatus('Grabando 5 segundos…');setTimeout(()=>recorder.state==='recording'&&recorder.stop(),5000);}
 return <section className="scene3d"><div className="scene3d-bar"><strong>LAB · Vista 3D</strong><select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="torus">Nudo toroidal</option><option value="box">Cubo</option><option value="sphere">Esfera</option></select><label>Importar GLB/GLTF <input type="file" accept=".glb,.gltf" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label></div><div className="scene3d-canvas" ref={mount}/><div className="scene3d-bar"><button onClick={()=>setPlaying(v=>!v)}>{playing?'⏸ Pausar':'▶ Animar'}</button><label>Velocidad <input type="range" min="0" max="5" step=".1" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label><label>Escala <input type="range" min=".2" max="3" step=".1" value={scale} onChange={e=>setScale(+e.target.value)}/></label><input type="color" aria-label="Color del material" value={color} onChange={e=>setColor(e.target.value)}/><button onClick={record}>● Video WebM (5 s)</button></div><p role="status">{status}</p></section>;
}
