import {useEffect,useRef,useState} from 'react';
import {Stage,Layer,Text,Transformer} from 'react-konva';
import type Konva from 'konva';
import type {Layer as StudioLayer} from '../document/layers';
import {useStudio} from '../state/studio';
type Props={layers:StudioLayer[];selectedLayer:string;enabled:boolean};
export function TextCanvas({layers,selectedLayer,enabled}:Props){
 const holder=useRef<HTMLDivElement>(null),transformer=useRef<Konva.Transformer>(null),nodes=useRef<Record<string,Konva.Text|null>>({});
 const [size,setSize]=useState(800);
 const selectLayer=useStudio(s=>s.selectLayer),updateLayer=useStudio(s=>s.updateLayer);
 useEffect(()=>{const node=holder.current;if(!node)return;const resize=()=>setSize(Math.max(1,node.clientWidth));const observer=new ResizeObserver(resize);observer.observe(node);resize();return()=>observer.disconnect()},[]);
 useEffect(()=>{const node=nodes.current[selectedLayer];if(enabled&&node&&transformer.current){transformer.current.nodes([node]);transformer.current.getLayer()?.batchDraw()}else transformer.current?.nodes([])},[selectedLayer,layers,enabled,size]);
 const scale=size/800;
 return <div ref={holder} className="konva-text-overlay" style={{pointerEvents:enabled?'auto':'none'}}>
  <Stage width={size} height={size}>
   <Layer>
    {layers.filter(l=>l.type==='text'&&l.visible).map(l=><Text key={l.id} ref={node=>{nodes.current[l.id]=node}} text={l.text||'Texto'} x={(l.x??400)*scale} y={(l.y??400)*scale} offsetX={0} offsetY={0} fontFamily={l.fontFamily??'Inter'} fontStyle={(l.fontWeight??700)>=600?'bold':'normal'} fontSize={(l.fontSize??100)*scale} width={l.textMode==='area'?(l.textWidth??500)*scale:undefined} wrap={l.textMode==='area'?'word':'none'} align={l.textAlign??'left'} lineHeight={l.lineHeight??1.2} fill={l.fill??'#ffffff'} opacity={l.opacity/100} rotation={l.rotation??0} draggable={enabled&&!l.locked} listening={enabled} onClick={()=>selectLayer(l.id)} onTap={()=>selectLayer(l.id)} onDragEnd={e=>updateLayer(l.id,{x:e.target.x()/scale,y:e.target.y()/scale})} onTransformEnd={e=>{const node=e.target;updateLayer(l.id,{x:node.x()/scale,y:node.y()/scale,rotation:node.rotation(),...(l.textMode==='area'?{textWidth:Math.max(40,Math.min(800,(l.textWidth??500)*node.scaleX()))}:{fontSize:Math.max(1,(l.fontSize??100)*node.scaleX())})});node.scale({x:1,y:1})}}/>)}
    {enabled&&<Transformer ref={transformer} rotateEnabled={true} flipEnabled={false} keepRatio={true} />}
   </Layer>
  </Stage>
 </div>
}
