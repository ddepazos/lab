import {useEffect,useRef,useState} from 'react';
import type {Timeline,Track} from '../animation/timeline';
import type {Layer} from '../document/layers';
export function TimelinePanel({layers,selectedLayer,time,setTime,timeline,setTimeline,exportActive=false,previewToken=0}:{exportActive?:boolean;previewToken?:number;layers:Layer[];selectedLayer:string;time:number;setTime:(t:number)=>void;timeline:Timeline;setTimeline:(t:Timeline)=>void}){
 const [playing,setPlaying]=useState(false);
 const [autoPreview,setAutoPreview]=useState(false);
 const clock=useRef(0);
 const timeRef=useRef(time);
 useEffect(()=>{timeRef.current=time;},[time]);
 useEffect(()=>{if(!playing||exportActive)return;let frame=0;const tick=(now:number)=>{if(clock.current){const next=timeRef.current+(now-clock.current)/1000;const t=timeline.loop?next%timeline.duration:Math.min(next,timeline.duration);timeRef.current=t;setTime(t);if(!timeline.loop&&t>=timeline.duration){setPlaying(false);return;}}clock.current=now;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);clock.current=0;};},[playing,exportActive,timeline.duration,timeline.loop,setTime]);
 useEffect(()=>{if(exportActive)setPlaying(false)},[exportActive]);
 useEffect(()=>{if(previewToken>0&&!exportActive){clock.current=0;timeRef.current=0;setPlaying(true)}},[previewToken]);
 const layer=layers.find(l=>l.id===selectedLayer);
 const property:Track['property']=layer?.type==='text'?'x':'rotation';
 const hasTrack=timeline.tracks.some(t=>t.layerId===selectedLayer&&t.property===property);
 const play=()=>{if(!playing && timeline.tracks.length===0 && layer){const end=property==='rotation'?360:650;setTimeline({...timeline,tracks:[...timeline.tracks,{layerId:selectedLayer,property,keyframes:[{time:0,value:property==='rotation'?0:100},{time:timeline.duration,value:end,easing:'easeInOut'}]}]});setAutoPreview(true);}setPlaying(p=>!p);};
 const addTrack=()=>{if(!layer||hasTrack)return;const end=property==='rotation'?360:650;setTimeline({...timeline,tracks:[...timeline.tracks,{layerId:selectedLayer,property,keyframes:[{time:0,value:property==='rotation'?0:100},{time:timeline.duration,value:end,easing:'easeInOut'}]}]});};
 return <section className="timeline-panel"><div className="timeline-top"><strong>Animación 2D</strong>{autoPreview&&<span>Vista previa automática activa</span>}<button disabled={exportActive} onClick={play}>{playing?'⏸ Pausar':'▶ Reproducir'}</button><button onClick={()=>{setPlaying(false);setTime(0);}}>↺ Inicio</button><label>Duración <input type="number" min="1" max="30" value={timeline.duration} onChange={e=>setTimeline({...timeline,duration:Math.max(1,Math.min(30,Number(e.target.value)||1))})}/> s</label><label><input type="checkbox" checked={timeline.loop} onChange={e=>setTimeline({...timeline,loop:e.target.checked})}/> Bucle</label></div><input aria-label="Tiempo de animación" type="range" min="0" max={timeline.duration} step=".01" value={time} onChange={e=>setTime(Number(e.target.value))}/><div className="timeline-top"><span>{time.toFixed(2)} / {timeline.duration.toFixed(2)} s</span><button disabled={!layer||hasTrack} onClick={addTrack}>+ Animar {property==='rotation'?'rotación':'posición X'}</button><button disabled={!hasTrack} onClick={()=>setTimeline({...timeline,tracks:timeline.tracks.filter(t=>!(t.layerId===selectedLayer&&t.property===property))})}>Quitar pista</button></div></section>;
}
