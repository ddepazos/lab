import {useState} from 'react';
import type {Layer} from '../document/layers';
import type {Timeline,Track} from '../animation/timeline';
type Preset='spin-cw'|'spin-ccw'|'bounce-x'|'bounce-y'|'pulse'|'fade'|'sway'|'float'|'slide-in'|'blink'|'zoom-in'|'drift'|'morph-grid'|'wave-cells'|'rotate-cells'|'scale-cells'|'staggered';
const presets:{id:Preset;name:string}[]=[{id:'spin-cw',name:'↻ Rotación horaria'},{id:'spin-ccw',name:'↺ Rotación antihoraria'},{id:'bounce-x',name:'↔ Rebote horizontal'},{id:'bounce-y',name:'↕ Rebote vertical'},{id:'pulse',name:'◉ Pulsación'},{id:'fade',name:'◐ Aparición'},{id:'sway',name:'↶ Oscilación'},{id:'float',name:'↕ Flotación'},{id:'slide-in',name:'→ Entrada lateral'},{id:'blink',name:'✦ Parpadeo'},{id:'zoom-in',name:'⊕ Ampliación'},{id:'drift',name:'➜ Desplazamiento continuo'},{id:'morph-grid',name:'▦ Mutación de retícula'},{id:'wave-cells',name:'〰 Onda por módulos'},{id:'rotate-cells',name:'↻ Giro individual de módulos'},{id:'scale-cells',name:'◇ Respiración de módulos'},{id:'staggered',name:'✦ Secuencia escalonada'}];
export function AnimationPresets({layerId,layerType,layer,timeline,onChange,onPreview}: {layerId:string|undefined;layerType:'pattern'|'text'|'image'|undefined;layer?:Layer;timeline:Timeline;onChange:(timeline:Timeline)=>void;onPreview?:()=>void}){
 const [preset,setPreset]=useState<Preset>('bounce-x');
 const canEdit=Boolean(layerId&&layerType&&layer&&!layer.locked);const patternOnly=['morph-grid','wave-cells','rotate-cells','scale-cells','staggered'].includes(preset);const activeTracks=timeline.tracks.filter(track=>track.layerId===layerId);

 const [amount,setAmount]=useState(80);
 const [parameter,setParameter]=useState<Track['property']>('waveAmplitude');
 const [variation,setVariation]=useState(30);
 const parameters:{id:Track['property'];label:string;fallback:number}[]=[
  {id:'waveAmplitude',label:'Amplitud',fallback:80},{id:'waveFrequency',label:'Frecuencia',fallback:2},
  {id:'waveNoise',label:'Ruido',fallback:0},{id:'waveStrokeWidth',label:'Grosor',fallback:6},
  {id:'waveDotSize',label:'Tamaño de puntos',fallback:6},{id:'waveDecay',label:'Decaimiento',fallback:0},
  {id:'waveDistortion',label:'Distorsión',fallback:0},{id:'waveLines',label:'Líneas',fallback:8},
  {id:'waveMeshColumns',label:'Columnas de malla',fallback:8},{id:'columns',label:'Columnas',fallback:8},
  {id:'rows',label:'Filas',fallback:8},{id:'density',label:'Densidad',fallback:85},{id:'expand',label:'Expansión',fallback:0}
 ];
 const animateParameter=()=>{
  if(!canEdit||layer?.type!=='pattern'||!layerId)return;
  const definition=parameters.find(item=>item.id===parameter);
  if(!definition)return;
  const current=(layer.pattern as unknown as Record<string,unknown>)?.[parameter];
  const base=typeof current==='number'?current:definition.fallback;
  const delta=Math.max(0.1,Math.abs(base)*variation/100);
  const duration=Math.max(.2,timeline.duration);
  const keyframes=[{time:0,value:base,easing:'easeInOut' as const},{time:duration/2,value:base+delta,easing:'easeInOut' as const},{time:duration,value:base,easing:'easeInOut' as const}];
  onChange({...timeline,tracks:[...timeline.tracks.filter(track=>!(track.layerId===layerId&&track.property===parameter)),{layerId,property:parameter,keyframes}]});
  onPreview?.();
 };
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
 onChange({...timeline,duration:t,tracks:[...timeline.tracks.filter(track=>track.layerId!==layerId||!['x','y','rotation','scale','opacity','mix','cellWave','cellRotation','cellScale'].includes(track.property)),{layerId,property,keyframes}]});
 onPreview?.();
 };
 return <section className="animation-presets"><h2>Animación 2D · Presets</h2><p className="note">{layer?`Capa seleccionada: ${layer.name}${layer.locked?" (bloqueada)":""}`:"Selecciona una capa para aplicar un efecto."} · {activeTracks.length} pista(s) activas</p><label>Efecto<select value={preset} onChange={e=>setPreset(e.target.value as Preset)}>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Intensidad: {amount}<input type="range" min="5" max="180" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><button disabled={!canEdit||(patternOnly&&layerType!=='pattern')} onClick={apply}>↻ Cambiar animación de capa</button><p className="note">El nuevo preset sustituye los movimientos anteriores de esta capa, pero conserva sus pistas de parámetros del generador y las animaciones de otras capas.</p><button disabled={!canEdit||!activeTracks.length} onClick={()=>{onChange({...timeline,tracks:timeline.tracks.filter(t=>t.layerId!==layerId)});onPreview?.();}}>Quitar animaciones de capa</button><div className="parameter-animation"><h3>Animar parámetros del generador</h3><label>Parámetro<select value={parameter} onChange={e=>setParameter(e.target.value as Track['property'])}>{parameters.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Variación: {variation}%<input type="range" min="1" max="200" value={variation} onChange={e=>setVariation(Number(e.target.value))}/></label><button disabled={!canEdit||layerType!=='pattern'} onClick={animateParameter}>+ Animar parámetro</button><p className="note">La pista se reproduce en la línea de tiempo y utiliza los mismos fotogramas durante la exportación de video.</p></div><p className="note">Al aplicar un movimiento se inicia una vista previa desde el comienzo.</p></section>
}
