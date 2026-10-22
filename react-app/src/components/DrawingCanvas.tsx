import {useEffect,useRef,useState} from 'react';
import {Stage,Layer,Line,Circle} from 'react-konva';
import type Konva from 'konva';

export type InkStroke={points:{x:number;y:number}[];color:string;width:number};
type Props={strokes:InkStroke[];setStrokes:React.Dispatch<React.SetStateAction<InkStroke[]>>;enabled:boolean;eraser:boolean;color:string;width:number;background:string};
export function DrawingCanvas({strokes,setStrokes,enabled,eraser,color,width,background}:Props){
 const holder=useRef<HTMLDivElement>(null);
 const active=useRef(false);
 const [size,setSize]=useState(800);
 useEffect(()=>{const node=holder.current;if(!node)return;const observer=new ResizeObserver(()=>setSize(Math.max(1,node.clientWidth)));observer.observe(node);setSize(Math.max(1,node.clientWidth));return()=>observer.disconnect()},[]);
 const point=(stage:Konva.Stage)=>{const pos=stage.getPointerPosition();if(!pos)return null;return {x:Math.max(0,Math.min(800,pos.x/size*800)),y:Math.max(0,Math.min(800,pos.y/size*800))}};
 const start=(stage:Konva.Stage)=>{if(!enabled)return;const p=point(stage);if(!p)return;active.current=true;setStrokes(prev=>[...prev,{points:[p],color:eraser?background:color,width}])};
 const move=(stage:Konva.Stage)=>{if(!enabled||!active.current)return;const p=point(stage);if(!p)return;setStrokes(prev=>prev.map((stroke,i)=>i===prev.length-1?{...stroke,points:[...stroke.points,p]}:stroke))};
 const stop=()=>{active.current=false};
 return <div ref={holder} className="konva-overlay" style={{touchAction:enabled?'none':'auto',pointerEvents:enabled?'auto':'none'}}>
  <Stage width={size} height={size} onMouseDown={e=>start(e.target.getStage()!)} onTouchStart={e=>start(e.target.getStage()!)} onMouseMove={e=>move(e.target.getStage()!)} onTouchMove={e=>move(e.target.getStage()!)} onMouseUp={stop} onTouchEnd={stop} onMouseLeave={stop} onTouchCancel={stop}>
   <Layer listening={false}>{strokes.map((stroke,i)=>stroke.points.length===1?
    <Circle key={i} x={stroke.points[0].x/800*size} y={stroke.points[0].y/800*size} radius={stroke.width/1600*size} fill={stroke.color}/>:
    <Line key={i} points={stroke.points.flatMap(p=>[p.x/800*size,p.y/800*size])} stroke={stroke.color} strokeWidth={stroke.width/800*size} lineCap="round" lineJoin="round" tension={0}/>)}</Layer>
  </Stage>
 </div>
}
