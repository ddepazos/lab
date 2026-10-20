import {create} from 'zustand';
import type {StudioDocument,ModuleKind} from '../document/types';
interface StudioState {doc:StudioDocument; set:<K extends keyof StudioDocument>(key:K,value:StudioDocument[K])=>void; toggleModule:(id:ModuleKind)=>void; newSeed:()=>void; reset:()=>void;}
export const initialDocument:StudioDocument={seed:426,columns:8,rows:8,density:85,mix:70,rotation:0,active:['circle','ring','cross','quarter'],foreground:'#ff5a00',background:'#191919'};
export const useStudio=create<StudioState>((set)=>({doc:{...initialDocument},set:(key,value)=>set(s=>({doc:{...s.doc,[key]:value}})),toggleModule:(id)=>set(s=>({doc:{...s.doc,active:s.doc.active.includes(id)?s.doc.active.filter(x=>x!==id):[...s.doc.active,id]}})),newSeed:()=>set(s=>({doc:{...s.doc,seed:(s.doc.seed%999999)+1}})),reset:()=>set({doc:{...initialDocument,active:[...initialDocument.active]}})}));
