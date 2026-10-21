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
 if(!p.layers.length||!p.layers.every(l=>l&&typeof l.id==='string'&&(l.type==='pattern'||l.type==='text')&&typeof l.visible==='boolean'))throw new Error('Capas inválidas');
 const d=p.document;
 if(typeof d.seed!=='number'||typeof d.columns!=='number'||typeof d.rows!=='number'||!Array.isArray(d.active)||typeof d.background!=='string')throw new Error('Documento inválido');
 if(typeof p.timeline.duration!=='number'||p.timeline.duration<=0||p.timeline.duration>3600)throw new Error('Duración inválida');
 if(p.variations!==undefined&&(!Array.isArray(p.variations)||!p.variations.every(v=>v&&typeof v.id==='string'&&typeof v.name==='string'&&Array.isArray(v.layers)&&v.document&&v.timeline)))throw new Error('Variaciones inválidas');
 return p as ProjectFile;
}
export function downloadProject(data:string):void{
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='LAB-proyecto.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
