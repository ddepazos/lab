import type {StudioDocument} from './types';
export type BlendMode='normal'|'multiply'|'screen'|'overlay';
export type Layer={tileMotion?:boolean;projection?:'flat'|'isometric'|'oblique';id:string;name:string;type:'pattern'|'text'|'image';visible:boolean;locked:boolean;opacity:number;blend:BlendMode;pattern?:StudioDocument;text?:string;imageSrc?:string;imageWidth?:number;imageHeight?:number;x?:number;y?:number;fontSize?:number;fontFamily?:string;fontWeight?:number;fill?:string;rotation?:number;scale?:number;textMode?:'point'|'area';textWidth?:number;textAlign?:'left'|'center'|'right';lineHeight?:number};
export const defaultLayers:Layer[]=[{id:'pattern-1',name:'Patrón modular',type:'pattern',visible:true,locked:false,opacity:100,blend:'normal'}];
export const createPatternLayer=(id:string,pattern:StudioDocument):Layer=>({id,name:'Patrón '+id.split('-').pop(),type:'pattern',visible:true,locked:false,opacity:100,blend:'normal',pattern:structuredClone(pattern)});
export const createTextLayer=(id:string):Layer=>({id,name:'Texto',type:'text',visible:true,locked:false,opacity:100,blend:'normal',text:'LAB',x:400,y:400,fontSize:100,fontFamily:'Inter',fontWeight:700,fill:'#ffffff',rotation:0,textMode:'point',textAlign:'left',lineHeight:1.2});

export const createParagraphLayer=(id:string):Layer=>({...createTextLayer(id),name:'Cuerpo de texto',text:'Escribe aquí tu texto. Ajusta el ancho del cuadro para distribuir las líneas dentro del lienzo.',x:90,y:120,fontSize:28,fontWeight:400,textMode:'area',textWidth:620,lineHeight:1.4});
