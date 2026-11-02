import {useEffect,useRef,useState} from 'react';
import {Stage,Layer,Line,Circle} from 'react-konva';
import type Konva from 'konva';
import {widthFromPressure} from '../wacomPen';

export type InkStroke={points:{x:number;y:number}[];color:string;width:number;pressures?:number[];presetId?:string;layerId?:string};
type Props={strokes:InkStroke[];setStrokes:React.Dispatch<React.SetStateAction<InkStroke[]>>;enabled:boolean;eraser:boolean;color:string;width:number;background:string};
export function DrawingCanvas({strokes,setStrokes,enabled,eraser,color,width,background}:Props){
 const holder=useRef<HTMLDivElement>(null);
 const active=useRef(false);
 const [size,setSize]=useState(800);
 useEffect(()=>{const node=holder.current;if(!node)return;const observer=new ResizeObserver(()=>setSize(Math.max(1,node.clientWidth)));observer.observe(node);setSize(Math.max(1,node.clientWidth));return()=>observer.disconnect()},[]);
 const point=(stage:Konva.Stage)=>{const pos=stage.getPointerPosition();if(!pos)return null;return {x:Math.max(0,Math.min(800,pos.x/size*800)),y:Math.max(0,Math.min(800,pos.y/size*800))}};
 const pressure=(event:Event)=>event instanceof PointerEvent && event.pointerType==='pen' ? Math.max(0.05,event.pressure) : 0.5;
 const start=(stage:Konva.Stage,event:Event)=>{if(!enabled)return;const p=point(stage);if(!p)return;active.current=true;setStrokes(prev=>[...prev,{points:[p],pressures:[pressure(event)],color:eraser?background:color,width}])};
 const move=(stage:Konva.Stage,event:Event)=>{if(!enabled||!active.current)return;const p=point(stage);if(!p)return;setStrokes(prev=>prev.map((stroke,i)=>i===prev.length-1?{...stroke,points:[...stroke.points,p],pressures:[...(stroke.pressures??[]),pressure(event)]}:stroke))};
 const stop=()=>{active.current=false};
 useEffect(()=>{if(!enabled)active.current=false},[enabled]);
 return <div ref={holder} className="konva-overlay" style={{touchAction:enabled?'none':'auto',pointerEvents:enabled?'auto':'none'}}>
  <Stage width={size} height={size} onPointerDown={e=>{start(e.target.getStage()!,e.evt);(e.evt.target as Element)?.setPointerCapture?.(e.evt.pointerId)}} onPointerMove={e=>move(e.target.getStage()!,e.evt)} onPointerUp={stop} onPointerCancel={stop} onMouseUp={stop} onTouchEnd={stop} onMouseLeave={stop} onTouchCancel={stop}>
   <Layer listening={false}>{strokes.map((stroke,i)=>stroke.points.length===1?
    <Circle key={i} x={stroke.points[0].x/800*size} y={stroke.points[0].y/800*size} radius={stroke.width/1600*size} fill={stroke.color}/>:
    <Line key={i} points={stroke.points.flatMap(p=>[p.x/800*size,p.y/800*size])} stroke={stroke.color} strokeWidth={stroke.width/800*size} lineCap="round" lineJoin="round" tension={0}/>)}</Layer>
  </Stage>
 </div>
}
