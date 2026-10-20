import {create} from 'zustand';
import type {StudioDocument,ModuleKind} from '../document/types';
import type {Layer} from '../document/layers';
import {createPatternLayer,createTextLayer} from '../document/layers';
interface StudioState {
 doc:StudioDocument;layers:Layer[];selectedLayer:string;
 set:<K extends keyof StudioDocument>(key:K,value:StudioDocument[K])=>void;
 toggleModule:(id:ModuleKind)=>void;newSeed:()=>void;reset:()=>void;
 selectLayer:(id:string)=>void;addLayer:(type:'pattern'|'text')=>void;
 updateLayer:(id:string,changes:Partial<Layer>)=>void;
 moveLayer:(id:string,direction:number)=>void;deleteLayer:(id:string)=>void;
}
export const initialDocument:StudioDocument={seed:426,columns:8,rows:8,density:85,mix:70,rotation:0,active:['circle','ring','cross','quarter'],foreground:'#ff5a00',background:'#191919'};
const makeLayers=()=>[createPatternLayer('pattern-1',initialDocument)];
export const useStudio=create<StudioState>((set)=>({
 doc:{...initialDocument},layers:makeLayers(),selectedLayer:'pattern-1',
 selectLayer:(id)=>set(s=>({selectedLayer:id,doc:s.layers.find(l=>l.id===id)?.pattern??s.doc})),
 addLayer:(type)=>set(s=>{const id=type+'-'+Date.now();const l=type==='text'?createTextLayer(id):createPatternLayer(id,s.doc);return {layers:[...s.layers,l],selectedLayer:id};}),
 updateLayer:(id,changes)=>set(s=>({layers:s.layers.map(l=>l.id===id?{...l,...changes}:l)})),
 moveLayer:(id,direction)=>set(s=>{const layers=[...s.layers],i=layers.findIndex(l=>l.id===id),j=i+direction;if(i<0||j<0||j>=layers.length)return {};[layers[i],layers[j]]=[layers[j],layers[i]];return {layers};}),
 deleteLayer:(id)=>set(s=>{if(s.layers.length<2)return {};const layers=s.layers.filter(l=>l.id!==id);return {layers,selectedLayer:s.selectedLayer===id?layers[layers.length-1].id:s.selectedLayer};}),
 set:(key,value)=>set(s=>({doc:{...s.doc,[key]:value},layers:s.layers.map(l=>l.id===s.selectedLayer&&l.type==='pattern'&&!l.locked?{...l,pattern:{...l.pattern!,[key]:value}}:l)})),
 toggleModule:(id)=>set(s=>{const active=s.doc.active.includes(id)?s.doc.active.filter(x=>x!==id):[...s.doc.active,id];return {doc:{...s.doc,active},layers:s.layers.map(l=>l.id===s.selectedLayer&&l.type==='pattern'&&!l.locked?{...l,pattern:{...l.pattern!,active}}:l)};}),
 newSeed:()=>set(s=>{const seed=(s.doc.seed%999999)+1;return {doc:{...s.doc,seed},layers:s.layers.map(l=>l.id===s.selectedLayer&&l.type==='pattern'&&!l.locked?{...l,pattern:{...l.pattern!,seed}}:l)};}),
 reset:()=>set({doc:{...initialDocument,active:[...initialDocument.active]},layers:makeLayers(),selectedLayer:'pattern-1'})
}));
