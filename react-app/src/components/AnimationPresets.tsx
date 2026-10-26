import {useState} from 'react';
import type {Layer} from '../document/layers';
import type {Timeline,Track} from '../animation/timeline';
type Preset='spin-cw'|'spin-ccw'|'bounce-x'|'bounce-y'|'pulse'|'fade'|'sway'|'float'|'slide-in'|'blink'|'zoom-in'|'drift'|'morph-grid'|'wave-cells'|'rotate-cells'|'scale-cells'|'staggered';
const presets:{id:Preset;name:string}[]=[{id:'spin-cw',name:'↻ Rotación horaria'},{id:'spin-ccw',name:'↺ Rotación antihoraria'},{id:'bounce-x',name:'↔ Rebote horizontal'},{id:'bounce-y',name:'↕ Rebote vertical'},{id:'pulse',name:'◉ Pulsación'},{id:'fade',name:'◐ Aparición'},{id:'sway',name:'↶ Oscilación'},{id:'float',name:'↕ Flotación'},{id:'slide-in',name:'→ Entrada lateral'},{id:'blink',name:'✦ Parpadeo'},{id:'zoom-in',name:'⊕ Ampliación'},{id:'drift',name:'➜ Desplazamiento continuo'},{id:'morph-grid',name:'▦ Mutación de retícula'},{id:'wave-cells',name:'〰 Onda por módulos'},{id:'rotate-cells',name:'↻ Giro individual de módulos'},{id:'scale-cells',name:'◇ Respiración de módulos'},{id:'staggered',name:'✦ Secuencia escalonada'}];
export function AnimationPresets({layerId,layerType,layer,timeline,onChange,onPreview}: {layerId:string|undefined;layerType:'pattern'|'text'|'image'|undefined;layer?:Layer;timeline:Timeline;onChange:(timeline:Timeline)=>void;onPreview?:()=>void}){
 const [preset,setPreset]=useState<Preset>('bounce-x');
 const canEdit=Boolean(layerId&&layerType&&layer&&!layer.locked);const patternOnly=['morph-grid','wave-cells','rotate-cells','scale-cells','staggered'].includes(preset);const activeTracks=timeline.tracks.filter(track=>track.layerId===layerId);

 const [amount,setAmount]=useState(80);
 const apply=()=>{if(!canEdit||!layerId||!layerType||!layer||(patternOnly&&layer.type!=='pattern'))return;
 const t=Math.max(.2,timeline.duration),v=Math.max(1,amount);
 const isText=layer.type==='text';
 const initialX=layer.x??(isText?400:0),initialY=layer.y??(isText?400:0);
 const initialRotation=layer.type==='pattern'?(layer.pattern?.rotation??0):(layer.rotation??0);
 const initialOpacity=layer.opacity??100;
 const initialScale=layer.scale??1;
 let property:Track['property']='x',values=[initialX,initialX+v,initialX];
 if(preset==='bounce-y'){property='y';values=[initialY,initialY-v,initialY]}
 if(preset==='spin-cw'||preset==='spin-ccw'){property='rotation';values=[initialRotation,initialRotation+(preset==='spin-cw'?360:-360)]}
 if(preset==='pulse'){property='scale';values=[initialScale,initialScale*(1+v/200),initialScale]}
 if(preset==='fade'){property='opacity';values=[0,initialOpacity]}
 if(preset==='sway'){property='rotation';values=[initialRotation-v/4,initialRotation+v/4,initialRotation-v/4]}
 if(preset==='float'){property='y';values=[initialY,initialY-v/2,initialY]}
 if(preset==='slide-in'){property='x';values=[initialX-v,initialX]}
 if(preset==='blink'){property='opacity';values=[initialOpacity,0,initialOpacity,0,initialOpacity]}
 if(preset==='zoom-in'){property='scale';values=[Math.max(.01,initialScale*.2),initialScale]}
 if(preset==='drift'){property='x';values=[initialX,initialX+v]}
 if(preset==='morph-grid'){property='mix';values=[layer.pattern?.mix??50,100,0,layer.pattern?.mix??50]}
 if(preset==='wave-cells'){property='cellWave';values=[0,v/2,-v/2,0]}
 if(preset==='rotate-cells'){property='cellRotation';values=[0,180,360]}
 if(preset==='scale-cells'){property='cellScale';values=[1,Math.min(2,1+v/150),.4,1]}
 if(preset==='staggered'){property='cellRotation';values=[0,90,-90,180,0]}
 const keyframes=preset==='blink'?Array.from({length:9},(_,i)=>({time:i*t/8,value:i%2===0?initialOpacity:0,easing:'linear' as const})):values.map((value,i)=>({time:i*t/(values.length-1),value,easing:'easeInOut' as const}));
 onChange({...timeline,duration:t,tracks:[...timeline.tracks.filter(track=>!(track.layerId===layerId&&track.property===property)),{layerId,property,keyframes}]});
 onPreview?.();
 };
 return <section className="animation-presets"><h2>Animación 2D · Presets</h2><p className="note">{layer?`Capa seleccionada: ${layer.name}${layer.locked?" (bloqueada)":""}`:"Selecciona una capa para aplicar un efecto."} · {activeTracks.length} pista(s) activas</p><label>Efecto<select value={preset} onChange={e=>setPreset(e.target.value as Preset)}>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Intensidad: {amount}<input type="range" min="5" max="180" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><button disabled={!canEdit||(patternOnly&&layerType!=='pattern')} onClick={apply}>+ Aplicar a capa</button><button disabled={!canEdit||!activeTracks.length} onClick={()=>{onChange({...timeline,tracks:timeline.tracks.filter(t=>t.layerId!==layerId)});onPreview?.();}}>Quitar animaciones de capa</button><p className="note">Al aplicar un movimiento se inicia una vista previa desde el comienzo.</p></section>
}
