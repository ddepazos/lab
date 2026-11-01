/** Validates the LAB GENRE3D v1 manifest. It is not a LAB Studio project JSON. */
export type GenreManifest={
 schema:'lab.creative-suite.asset';version:1;source:'LAB GENRE3D';target:'LAB Studio';
 asset:{file:string;format:'glb';units:'meters';upAxis:'Y';handedness:'right'};
 animation:{fps:number;clipNames:string[];durationSeconds:number};
 content:{meshes:number;skinnedMeshes:number;bones:number;morphTargets:number;materials:number};
 createdAt:string;
};
export function validateGenreManifest(source:string):GenreManifest{
 if(source.length>1024*1024)throw new Error('Manifiesto demasiado grande');
 const value:unknown=JSON.parse(source);
 if(!value||typeof value!=='object')throw new Error('Manifiesto inválido');
 const m=value as Partial<GenreManifest>;
 if(m.schema!=='lab.creative-suite.asset'||m.version!==1||m.source!=='LAB GENRE3D'||m.target!=='LAB Studio')
  throw new Error('Esquema LAB GENRE3D v1 no reconocido');
 if(!m.asset||m.asset.format!=='glb'||m.asset.units!=='meters'||m.asset.upAxis!=='Y'||m.asset.handedness!=='right'||typeof m.asset.file!=='string'||m.asset.file.includes('/')||m.asset.file.includes('\\')||!m.asset.file.toLowerCase().endsWith('.glb'))
  throw new Error('Archivo GLB o sistema de coordenadas no válido');
 return m as GenreManifest;
}
