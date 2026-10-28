import {useEffect,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import type {Layer} from '../document/layers';
import {beginStudioGesture,endStudioGesture} from '../state/studio';
export function layerBox(layer:Layer,width:number,height:number){
 const factor=Math.min(width,height)/800;
 const offsetX=(width-800*factor)/2,offsetY=(height-800*factor)/2;
 if(layer.type==='pattern')return {originX:width/2+(layer.x??0),originY:height/2+(layer.y??0),left:-width/2,top:-height/2,width,height,unit:1};
 if(layer.type==='image')return {originX:layer.x??0,originY:layer.y??0,left:0,top:0,width:layer.imageWidth??200,height:layer.imageHeight??200,unit:1};
 const font=layer.fontSize??100;
 const lines=(layer.text??'LAB').split('\n');
 const w=layer.textMode==='area'?(layer.textWidth??500):Math.max(font*.6,...lines.map(line=>line.length*font*.65));
 const lineCount=layer.textMode==='area'?Math.max(lines.length,Math.ceil((layer.text??'').length/Math.max(1,w/(font*.55)))):lines.length;
 return {originX:offsetX+(layer.x??400)*factor,originY:offsetY+(layer.y??400)*factor,left:0,top:0,width:w*factor,height:font*(layer.lineHeight??1.2)*lineCount*factor,unit:factor};
}
type Drag={kind:'move'|'scale'|'rotate';startX:number;startY:number;x:number;y:number;scale:number;rotation:number;distance:number;angle:number};
export function LayerHandles({layer,width,height,onChange}:{layer:Layer|undefined;width:number;height:number;onChange:(id:string,changes:Partial<Layer>)=>void}){
 const ref=useRef<SVGSVGElement>(null),drag=useRef<Drag|null>(null);const [displayWidth,setDisplayWidth]=useState(0);
 useEffect(()=>{const node=ref.current;if(!node)return;const update=()=>setDisplayWidth(node.clientWidth);const observer=new ResizeObserver(update);observer.observe(node);update();return()=>observer.disconnect();},[layer?.id,layer?.locked,layer?.visible]);
 useEffect(()=>()=>{if(drag.current){drag.current=null;endStudioGesture();}},[layer?.id]);
 if(!layer||!layer.visible||layer.locked)return null;
 const box=layerBox(layer,width,height),scale=layer.scale??1,rotation=layer.rotation??0;
 const pixel=width/Math.max(100,displayWidth||width),radius=7*pixel/scale;
 const point=(e:PointerEvent)=>{const svg=ref.current!,matrix=svg.getScreenCTM();if(!matrix)return {x:0,y:0};const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());return {x:p.x,y:p.y};};
 const start=(kind:Drag['kind'],e:PointerEvent)=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();window.dispatchEvent(new Event('lab:pause-preview'));const p=point(e);beginStudioGesture();drag.current={kind,startX:p.x,startY:p.y,x:layer.x??(layer.type==='text'?400:0),y:layer.y??(layer.type==='text'?400:0),scale,rotation,distance:Math.max(1,Math.hypot(p.x-box.originX,p.y-box.originY)),angle:Math.atan2(p.y-box.originY,p.x-box.originX)};ref.current?.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent)=>{const d=drag.current;if(!d)return;const p=point(e);if(d.kind==='move')onChange(layer.id,{x:d.x+(p.x-d.startX)/box.unit,y:d.y+(p.y-d.startY)/box.unit,...(layer.type==='pattern'?{tileMotion:false}:{})});if(d.kind==='scale')onChange(layer.id,{scale:Math.max(.05,Math.min(4,d.scale*Math.hypot(p.x-box.originX,p.y-box.originY)/d.distance))});if(d.kind==='rotate')onChange(layer.id,{rotation:d.rotation+(Math.atan2(p.y-box.originY,p.x-box.originX)-d.angle)*180/Math.PI});};
 const stop=()=>{if(drag.current){drag.current=null;endStudioGesture();}};
 const inset=layer.type==='pattern'?radius*1.5:0;
 const x1=box.left+inset,y1=box.top+inset,x2=box.left+box.width-inset,y2=box.top+box.height-inset;
 return <svg ref={ref} className="layer-handles" viewBox={`0 0 ${width} ${height}`} aria-label={`Manejadores de ${layer.name}`} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
 <g transform={`translate(${box.originX} ${box.originY}) rotate(${rotation}) scale(${scale})`}>
 <rect className="layer-selection-box" x={x1} y={y1} width={Math.max(1,x2-x1)} height={Math.max(1,y2-y1)} fill={layer.type==='pattern'?'none':'transparent'} pointerEvents={layer.type==='pattern'?'stroke':'all'} onPointerDown={e=>start('move',e)}/>
 <circle data-handle="move" role="button" aria-label="Mover capa seleccionada" cx={(x1+x2)/2} cy={(y1+y2)/2} r={radius*1.5} onPointerDown={e=>start('move',e)}><title>Arrastrar para mover la capa</title></circle>
 {[ [x1,y1],[x2,y1],[x1,y2],[x2,y2] ].map(([x,y],i)=><rect key={i} data-handle="scale" role="button" aria-label={`Escalar capa, esquina ${i+1}`} x={x-radius} y={y-radius} width={radius*2} height={radius*2} onPointerDown={e=>start('scale',e)}/>)}
 <circle data-handle="rotate" role="button" aria-label="Girar capa seleccionada" cx={(x1+x2)/2} cy={layer.type==='pattern'?y1+radius*5:y1-radius*4} r={radius*1.25} onPointerDown={e=>start('rotate',e)}><title>Arrastrar para girar</title></circle>
 </g></svg>;
}
