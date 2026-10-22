import {useState} from 'react';
import type {Timeline,Track} from '../animation/timeline';
type Preset='spin-cw'|'spin-ccw'|'bounce-x'|'bounce-y'|'pulse'|'fade';
const presets:{id:Preset;name:string}[]=[{id:'spin-cw',name:'↻ Rotación horaria'},{id:'spin-ccw',name:'↺ Rotación antihoraria'},{id:'bounce-x',name:'↔ Rebote horizontal'},{id:'bounce-y',name:'↕ Rebote vertical'},{id:'pulse',name:'◉ Pulsación'},{id:'fade',name:'◐ Aparición'}];
export function AnimationPresets({layerId,layerType,timeline,onChange}: {layerId:string|undefined;layerType:'pattern'|'text'|undefined;timeline:Timeline;onChange:(timeline:Timeline)=>void}){
 const [preset,setPreset]=useState<Preset>('bounce-x');
 const [duration,setDuration]=useState(2);
 const [amount,setAmount]=useState(80);
 const apply=()=>{if(!layerId||!layerType)return;const t=Math.max(.2,duration),v=Math.max(1,amount);
 let property:Track['property']='x',values=[0,v,0];
 if(preset==='spin-cw'||preset==='spin-ccw'){property='rotation';values=[0,preset==='spin-cw'?360:-360]}
 if(preset==='bounce-y'){property='y';values=[400,400-v,400]}
 if(preset==='bounce-x'){values=[400,400+v,400]}
 if(preset==='pulse'){property=layerType==='text'?'scale':'opacity';values=layerType==='text'?[80,80+v,80]:[100,Math.max(0,100-v),100]}
 if(preset==='fade'){property='opacity';values=[0,100]}
 if(layerType==='pattern'&&['x','y'].includes(property)){property='rotation';values=[-v/2,v/2,-v/2]}
 if(layerType==='text'&&property==='rotation'){property='x';values=[400,400+(preset==='spin-cw'?v:-v),400]}
 const keyframes=values.map((value,i)=>({time:i*t/(values.length-1),value,easing:'easeInOut' as const}));
 onChange({...timeline,duration:Math.max(t,timeline.duration),tracks:[...timeline.tracks.filter(track=>!(track.layerId===layerId&&track.property===property)),{layerId,property,keyframes}]});
 };
 return <section className="animation-presets"><h2>Movimiento · Presets</h2><label>Efecto<select value={preset} onChange={e=>setPreset(e.target.value as Preset)}>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Duración: {duration}s<input type="range" min=".5" max="10" step=".5" value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label><label>Intensidad: {amount}<input type="range" min="5" max="180" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><button disabled={!layerId} onClick={apply}>+ Aplicar a capa</button><button disabled={!layerId||!timeline.tracks.some(t=>t.layerId===layerId)} onClick={()=>onChange({...timeline,tracks:timeline.tracks.filter(t=>t.layerId!==layerId)})}>Quitar animaciones de capa</button><p className="note">Los movimientos se incorporan a la línea de tiempo y se pueden seguir editando.</p></section>
}
