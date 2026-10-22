import {create} from 'zustand';
import type {StudioDocument,ModuleKind} from '../document/types';
import type {Layer} from '../document/layers';
import type {ProjectFile} from '../document/project';
import {createPatternLayer,createTextLayer,createParagraphLayer} from '../document/layers';
interface StudioState {
 doc:StudioDocument;layers:Layer[];selectedLayer:string;
 set:<K extends keyof StudioDocument>(key:K,value:StudioDocument[K])=>void;
 toggleModule:(id:ModuleKind)=>void;newSeed:()=>void;reset:()=>void;
 loadProject:(project:ProjectFile)=>void;
 selectLayer:(id:string)=>void;addImage:(name:string,src:string,width:number,height:number)=>void;addLayer:(type:'pattern'|'text'|'paragraph')=>void;
 updateLayer:(id:string,changes:Partial<Layer>)=>void;
 moveLayer:(id:string,direction:number)=>void;deleteLayer:(id:string)=>void;
}
export const initialDocument:StudioDocument={seed:426,columns:8,rows:8,density:85,mix:70,rotation:0,active:['circle','ring','cross','quarter'],foreground:'#ff5a00',background:'#191919'};
const makeLayers=()=>[createPatternLayer('pattern-1',initialDocument)];
export const useStudio=create<StudioState>((set)=>({
 doc:{...initialDocument},layers:makeLayers(),selectedLayer:'pattern-1',
 loadProject:(project)=>set({doc:{...(project.layers[0].pattern??project.document),background:project.document.background},layers:project.layers,selectedLayer:project.layers[0].id}),
 selectLayer:(id)=>set(s=>{const layer=s.layers.find(l=>l.id===id);return layer?{selectedLayer:id,doc:layer.pattern?{...layer.pattern,background:s.doc.background}:s.doc}:{};}),
 addImage:(name,src,width,height)=>set(s=>{const id='image-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);return {layers:[...s.layers,{id,name,type:'image' as const,visible:true,locked:false,opacity:100,blend:'normal' as const,imageSrc:src,imageWidth:width,imageHeight:height,x:(800-width)/2,y:(800-height)/2,scale:1}],selectedLayer:id};}),
 addLayer:(type)=>set(s=>{const id=type+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);const l=type==='paragraph'?createParagraphLayer(id):type==='text'?createTextLayer(id):createPatternLayer(id,s.doc);return {layers:[...s.layers,l],selectedLayer:id};}),
 updateLayer:(id,changes)=>set(s=>({layers:s.layers.map(l=>{if(l.id!==id)return l;if(l.locked&&!Object.keys(changes).every(key=>key==='locked'||key==='visible'))return l;const safeChanges=Object.fromEntries(Object.entries(changes).filter(([key])=>key!=='id'&&key!=='type')) as Partial<Layer>;return {...l,...safeChanges};})})),
 moveLayer:(id,direction)=>set(s=>{const layers=[...s.layers],i=layers.findIndex(l=>l.id===id),j=i+direction;if(i<0||j<0||j>=layers.length)return {};[layers[i],layers[j]]=[layers[j],layers[i]];return {layers};}),
 deleteLayer:(id)=>set(s=>{if(s.layers.length<2)return {};const layers=s.layers.filter(l=>l.id!==id);const selectedLayer=s.selectedLayer===id?layers[layers.length-1].id:s.selectedLayer;const selected=layers.find(l=>l.id===selectedLayer);return {layers,selectedLayer,doc:selected?.pattern?{...selected.pattern,background:s.doc.background}:s.doc};}),
 set:(key,value)=>set(s=>{if(key==='background')return {doc:{...s.doc,background:value as StudioDocument['background']}};const selected=s.layers.find(l=>l.id===s.selectedLayer);if(!selected||selected.type!=='pattern'||selected.locked)return {};return {doc:{...s.doc,[key]:value},layers:s.layers.map(l=>l.id===s.selectedLayer?{...l,pattern:{...l.pattern!,[key]:value}}:l)};}),
 toggleModule:(id)=>set(s=>{const selected=s.layers.find(l=>l.id===s.selectedLayer);if(!selected||selected.type!=='pattern'||selected.locked)return {};const active=s.doc.active.includes(id)?s.doc.active.filter(x=>x!==id):[...s.doc.active,id];return {doc:{...s.doc,active},layers:s.layers.map(l=>l.id===s.selectedLayer&&l.type==='pattern'&&!l.locked?{...l,pattern:{...l.pattern!,active}}:l)};}),
 newSeed:()=>set(s=>{const selected=s.layers.find(l=>l.id===s.selectedLayer);if(!selected||selected.type!=='pattern'||selected.locked)return {};const seed=(s.doc.seed%999999)+1;return {doc:{...s.doc,seed},layers:s.layers.map(l=>l.id===s.selectedLayer&&l.type==='pattern'&&!l.locked?{...l,pattern:{...l.pattern!,seed}}:l)};}),
 reset:()=>set({doc:{...initialDocument,active:[...initialDocument.active]},layers:makeLayers(),selectedLayer:'pattern-1'})
}));
