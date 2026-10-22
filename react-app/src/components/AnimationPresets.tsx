import {useState} from 'react';
import type {Layer} from '../document/layers';
import type {Timeline,Track} from '../animation/timeline';
type Preset='spin-cw'|'spin-ccw'|'bounce-x'|'bounce-y'|'pulse'|'fade'|'sway'|'float'|'slide-in'|'blink'|'zoom-in'|'drift';
const presets:{id:Preset;name:string}[]=[{id:'spin-cw',name:'↻ Rotación horaria'},{id:'spin-ccw',name:'↺ Rotación antihoraria'},{id:'bounce-x',name:'↔ Rebote horizontal'},{id:'bounce-y',name:'↕ Rebote vertical'},{id:'pulse',name:'◉ Pulsación'},{id:'fade',name:'◐ Aparición'},{id:'sway',name:'↶ Oscilación'},{id:'float',name:'↕ Flotación'},{id:'slide-in',name:'→ Entrada lateral'},{id:'blink',name:'✦ Parpadeo'},{id:'zoom-in',name:'⊕ Ampliación'},{id:'drift',name:'➜ Desplazamiento continuo'}];
export function AnimationPresets({layerId,layerType,layer,timeline,onChange,onPreview}: {layerId:string|undefined;layerType:'pattern'|'text'|'image'|undefined;layer?:Layer;timeline:Timeline;onChange:(timeline:Timeline)=>void;onPreview?:()=>void}){
 const [preset,setPreset]=useState<Preset>('bounce-x');
 const [duration,setDuration]=useState(2);
 const [amount,setAmount]=useState(80);
 const apply=()=>{if(!layerId||!layerType||!layer)return;
 const t=Math.max(.2,duration),v=Math.max(1,amount);
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
 const keyframes=values.map((value,i)=>({time:i*t/(values.length-1),value,easing:'easeInOut' as const}));
 onChange({...timeline,duration:Math.max(t,timeline.duration),tracks:[...timeline.tracks.filter(track=>!(track.layerId===layerId&&track.property===property)),{layerId,property,keyframes}]});
 onPreview?.();
 };
 return <section className="animation-presets"><h2>Movimiento · Presets</h2><label>Efecto<select value={preset} onChange={e=>setPreset(e.target.value as Preset)}>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Duración: {duration}s<input type="range" min=".5" max="10" step=".5" value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label><label>Intensidad: {amount}<input type="range" min="5" max="180" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><button disabled={!layerId} onClick={apply}>+ Aplicar a capa</button><button disabled={!layerId||!timeline.tracks.some(t=>t.layerId===layerId)} onClick={()=>onChange({...timeline,tracks:timeline.tracks.filter(t=>t.layerId!==layerId)})}>Quitar animaciones de capa</button><p className="note">Al aplicar un movimiento se inicia una vista previa desde el comienzo.</p></section>
}
