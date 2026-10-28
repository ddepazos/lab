import {cloneElement,useEffect,useRef,useState} from 'react';
import type {CSSProperties,ReactElement} from 'react';
export function CanvasViewport({width,height,children}:{width:number;height:number;children:ReactElement<{style?:CSSProperties}>}){
 const viewport=useRef<HTMLDivElement>(null);
 const [available,setAvailable]=useState({width:600,height:420});
 const [zoom,setZoom]=useState(1),[viewHeight,setViewHeight]=useState(420);
 useEffect(()=>{const node=viewport.current;if(!node)return;const update=()=>setAvailable({width:node.clientWidth,height:node.clientHeight});const observer=new ResizeObserver(update);observer.observe(node);update();return()=>observer.disconnect();},[]);
 const fit=Math.max(.01,Math.min(Math.max(100,available.width-32)/width,Math.max(100,available.height-32)/height));
 const boardWidth=width*fit*zoom,boardHeight=height*fit*zoom;
 return <><div className="canvas-view-controls" role="group" aria-label="Vista del lienzo"><strong>Vista del lienzo</strong><button type="button" aria-label="Alejar lienzo" disabled={zoom<=.25} onClick={()=>setZoom(z=>Math.max(.25,z-.25))}>−</button><output aria-label="Zoom del lienzo">{Math.round(zoom*100)}%</output><button type="button" aria-label="Acercar lienzo" disabled={zoom>=4} onClick={()=>setZoom(z=>Math.min(4,z+.25))}>+</button><button type="button" onClick={()=>{setZoom(1);viewport.current?.scrollTo(0,0);}}>Ajustar lienzo</button><label>Altura de vista<input aria-label="Altura de vista" type="range" min="240" max="900" step="20" value={viewHeight} onChange={e=>setViewHeight(Number(e.target.value))}/><output>{viewHeight} px</output></label><small>Zoom de pantalla · desplázate con las barras</small></div><div ref={viewport} className="canvas-viewport" style={{height:viewHeight}} tabIndex={0} aria-label="Área desplazable del lienzo"><div className="canvas-zoom-surface" style={{width:Math.max(available.width,boardWidth+32),height:Math.max(available.height,boardHeight+32)}}>{cloneElement(children,{style:{...children.props.style,width:boardWidth,height:boardHeight,maxWidth:'none',flex:'none'}})}</div></div></>;
}
