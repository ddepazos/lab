import type {StudioDocument} from './types';
export type BlendMode='normal'|'multiply'|'screen'|'overlay';
export type Layer={id:string;name:string;type:'pattern'|'text';visible:boolean;locked:boolean;opacity:number;blend:BlendMode;pattern?:StudioDocument;text?:string;x?:number;y?:number;fontSize?:number};
export const defaultLayers:Layer[]=[{id:'pattern-1',name:'Patrón modular',type:'pattern',visible:true,locked:false,opacity:100,blend:'normal'}];
export const createPatternLayer=(id:string,pattern:StudioDocument):Layer=>({id,name:'Patrón '+id.split('-').pop(),type:'pattern',visible:true,locked:false,opacity:100,blend:'normal',pattern:{...pattern,active:[...pattern.active]}});
export const createTextLayer=(id:string):Layer=>({id,name:'Texto',type:'text',visible:true,locked:false,opacity:100,blend:'normal',text:'LAB',x:400,y:400,fontSize:100});
