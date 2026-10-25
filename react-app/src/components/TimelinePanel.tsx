import {useEffect,useRef,useState} from 'react';
import type {Timeline,Track} from '../animation/timeline';
import type {Layer} from '../document/layers';
export function TimelinePanel({layers,selectedLayer,time,setTime,timeline,setTimeline,exportActive=false,previewToken=0}:{exportActive?:boolean;previewToken?:number;layers:Layer[];selectedLayer:string;time:number;setTime:(t:number)=>void;timeline:Timeline;setTimeline:(t:Timeline)=>void}){
 const [playing,setPlaying]=useState(false);
 const [speed,setSpeed]=useState(1);
 const clock=useRef(0);
 const timeRef=useRef(time);
 useEffect(()=>{timeRef.current=time;},[time]);
 useEffect(()=>{if(!playing||exportActive)return;let frame=0;const tick=(now:number)=>{if(clock.current){const next=timeRef.current+((now-clock.current)/1000)*speed;const t=timeline.loop?next%timeline.duration:Math.min(next,timeline.duration);timeRef.current=t;setTime(t);if(!timeline.loop&&t>=timeline.duration){setPlaying(false);return;}}clock.current=now;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);clock.current=0;};},[playing,exportActive,timeline.duration,timeline.loop,setTime,speed]);
 useEffect(()=>{if(exportActive)setPlaying(false)},[exportActive]);
 useEffect(()=>{if(previewToken>0&&!exportActive){clock.current=0;timeRef.current=0;setPlaying(true)}},[previewToken]);
 const layer=layers.find(l=>l.id===selectedLayer);
 const property:Track['property']=layer?.type==='text'?'x':'rotation';
 const hasTrack=timeline.tracks.some(t=>t.layerId===selectedLayer&&t.property===property);
 const play=()=>{if(exportActive)return;if(!playing&&time>=timeline.duration){timeRef.current=0;setTime(0);}setPlaying(p=>!p);};
 const addTrack=()=>{if(!layer||hasTrack)return;const end=property==='rotation'?360:650;setTimeline({...timeline,tracks:[...timeline.tracks,{layerId:selectedLayer,property,keyframes:[{time:0,value:property==='rotation'?0:100},{time:timeline.duration,value:end,easing:'easeInOut'}]}]});};
 return <section className="timeline-panel"><div className="timeline-top"><strong>Animación 2D</strong><button disabled={exportActive} onClick={play}>{playing?'⏸ Pausar':'▶ Reproducir'}</button><button disabled={exportActive} onClick={()=>{setPlaying(false);clock.current=0;timeRef.current=0;setTime(0);}}>↺ Inicio</button><label>Velocidad <select aria-label="Velocidad de reproducción" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.25}>0,25×</option><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={1.5}>1,5×</option><option value={2}>2×</option></select></label><label>Duración <input type="number" min="1" max="30" value={timeline.duration} onChange={e=>setTimeline({...timeline,duration:Math.max(1,Math.min(30,Number(e.target.value)||1))})}/> s</label><label><input type="checkbox" checked={timeline.loop} onChange={e=>setTimeline({...timeline,loop:e.target.checked})}/> Bucle</label></div><input aria-label="Tiempo de animación" type="range" min="0" max={timeline.duration} step=".01" value={time} onChange={e=>{setPlaying(false);clock.current=0;const next=Number(e.target.value);timeRef.current=next;setTime(next)}}/><div className="timeline-top"><span aria-live="off">{time.toFixed(2)} / {timeline.duration.toFixed(2)} s</span><span>{timeline.tracks.length?`${timeline.tracks.length} pista(s) de animación`:"Sin pistas: añade una animación para ver movimiento"}</span><button disabled={!layer||hasTrack} onClick={addTrack}>+ Animar {property==='rotation'?'rotación':'posición X'}</button><button disabled={!hasTrack} onClick={()=>setTimeline({...timeline,tracks:timeline.tracks.filter(t=>!(t.layerId===selectedLayer&&t.property===property))})}>Quitar pista</button></div></section>;
}
