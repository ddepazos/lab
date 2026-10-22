import {validDocument,validLayer,validTimeline} from './validate';
import type {StudioDocument} from '../document/types';
import type {Layer} from '../document/layers';
import type {Timeline} from '../animation/timeline';
export type ProjectSnapshot={id:string;name:string;document:StudioDocument;layers:Layer[];timeline:Timeline};
export type ProjectFile={format:'lab-project';version:1;document:StudioDocument;layers:Layer[];timeline:Timeline;variations?:ProjectSnapshot[]};
export function serializeProject(document:StudioDocument,layers:Layer[],timeline:Timeline,variations:ProjectSnapshot[]=[]):string{
 return JSON.stringify({format:'lab-project',version:1,document,layers,timeline,variations} satisfies ProjectFile,null,2);
}
export function parseProject(raw:string):ProjectFile{
 const data:unknown=JSON.parse(raw);
 if(!data||typeof data!=='object')throw new Error('Proyecto inválido');
 const p=data as Partial<ProjectFile>;
 if(p.format!=='lab-project'||p.version!==1||!p.document||!Array.isArray(p.layers)||!p.timeline||!Array.isArray(p.timeline.tracks))throw new Error('Archivo LAB no compatible');
 if(!validDocument(p.document))throw new Error('Documento inválido');
 if(!p.layers.length||p.layers.length>500||!p.layers.every(validLayer))throw new Error('Capas inválidas');
 if(new Set(p.layers.map(l=>l.id)).size!==p.layers.length)throw new Error('Identificadores de capa duplicados');
 if(!validTimeline(p.timeline))throw new Error('Línea de tiempo inválida');
 if(p.variations!==undefined){
  if(!Array.isArray(p.variations)||p.variations.length>200||!p.variations.every(v=>
   v&&typeof v.id==='string'&&v.id.length>0&&v.id.length<=128&&typeof v.name==='string'&&v.name.length<=256&&
   validDocument(v.document)&&Array.isArray(v.layers)&&v.layers.length>0&&v.layers.length<=500&&v.layers.every(validLayer)&&validTimeline(v.timeline)
  ))throw new Error('Variaciones inválidas');
 }
 return p as ProjectFile;
}
export function downloadProject(data:string):void{
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='LAB-proyecto.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
