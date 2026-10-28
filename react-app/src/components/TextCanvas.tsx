import {useEffect,useRef,useState} from 'react';
import {Stage,Layer,Text,Image as KonvaImage} from 'react-konva';
import type {Layer as StudioLayer} from '../document/layers';
import {useStudio} from '../state/studio';
function DraggableImage({layer,scale,enabled,onSelect,onUpdate}:{layer:StudioLayer;scale:number;enabled:boolean;onSelect:()=>void;onUpdate:(changes:Partial<StudioLayer>)=>void}){const [image,setImage]=useState<HTMLImageElement|null>(null);useEffect(()=>{if(!layer.imageSrc){setImage(null);return;}let active=true;const img=new window.Image();img.onload=()=>{if(active)setImage(img)};img.src=layer.imageSrc;return()=>{active=false}},[layer.imageSrc]);if(!image)return null;return <KonvaImage image={image} x={(layer.x??0)*scale} y={(layer.y??0)*scale} width={(layer.imageWidth??image.width)*scale} height={(layer.imageHeight??image.height)*scale} scaleX={layer.scale??1} scaleY={layer.scale??1} rotation={layer.rotation??0} opacity={layer.opacity/100} visible={layer.visible} draggable={enabled&&!layer.locked} listening={enabled} onClick={onSelect} onTap={onSelect} onDragEnd={e=>onUpdate({x:e.target.x()/scale,y:e.target.y()/scale})}/>;}
type Props={layers:StudioLayer[];selectedLayer:string;enabled:boolean;onLayerChange?:(id:string,changes:Partial<StudioLayer>)=>void};
export function TextCanvas({layers,enabled,onLayerChange}:Props){
 const holder=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({width:800,height:800});
 const selectLayer=useStudio(s=>s.selectLayer),storeUpdate=useStudio(s=>s.updateLayer);const updateLayer=onLayerChange??storeUpdate;
 useEffect(()=>{const node=holder.current;if(!node)return;const resize=()=>setSize({width:Math.max(1,node.clientWidth),height:Math.max(1,node.clientHeight)});const observer=new ResizeObserver(resize);observer.observe(node);resize();return()=>observer.disconnect()},[]);

 const scale=size.width/Math.max(1,Number(holder.current?.closest('.artboard')?.querySelector('svg')?.getAttribute('width'))||800);
 const root=holder.current?.closest('.artboard')?.querySelector('svg');
 const docWidth=Number(root?.getAttribute('width'))||800,docHeight=Number(root?.getAttribute('height'))||800;
 const factor=Math.min(docWidth,docHeight)/800,textScale=scale*factor;
 const offsetX=(docWidth-800*factor)/2*scale,offsetY=(docHeight-800*factor)/2*scale;
 return <div ref={holder} className={'konva-text-overlay'+(enabled?' editing-images':'')} style={{pointerEvents:enabled?'auto':'none'}}>
  <Stage width={size.width} height={size.height}>
   <Layer>
    {layers.filter(l=>l.type==='image'&&l.visible).map(l=><DraggableImage key={l.id} layer={l} scale={scale} enabled={enabled} onSelect={()=>selectLayer(l.id)} onUpdate={changes=>updateLayer(l.id,changes)}/>)}
    {layers.filter(l=>l.type==='text'&&l.visible).map(l=><Text key={l.id} text={l.text||'Texto'} x={offsetX+(l.x??400)*textScale} y={offsetY+(l.y??400)*textScale} offsetX={0} offsetY={0} fontFamily={l.fontFamily??'Inter'} fontStyle={(l.fontWeight??700)>=600?'bold':'normal'} fontSize={(l.fontSize??100)*textScale} width={l.textMode==='area'?(l.textWidth??500)*textScale:undefined} wrap={l.textMode==='area'?'word':'none'} align={l.textAlign??'left'} lineHeight={l.lineHeight??1.2} fill={l.fill??'#ffffff'} opacity={l.opacity/100} scaleX={l.scale??1} scaleY={l.scale??1} rotation={l.rotation??0} draggable={enabled&&!l.locked} listening={enabled} onClick={()=>selectLayer(l.id)} onTap={()=>selectLayer(l.id)} onDragEnd={e=>updateLayer(l.id,{x:(e.target.x()-offsetX)/textScale,y:(e.target.y()-offsetY)/textScale})} onTransformEnd={e=>{const node=e.target;updateLayer(l.id,{x:(node.x()-offsetX)/textScale,y:(node.y()-offsetY)/textScale,rotation:node.rotation(),...(l.textMode==='area'?{textWidth:Math.max(40,Math.min(800,(l.textWidth??500)*node.scaleX()))}:{fontSize:Math.max(1,(l.fontSize??100)*node.scaleX())})});node.scale({x:1,y:1})}}/>)}

   </Layer>
  </Stage>
 </div>
}
