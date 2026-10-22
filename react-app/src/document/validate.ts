import {GOOGLE_FONTS} from './fonts';
import type {StudioDocument,ModuleKind} from './types';
import type {Layer,BlendMode} from './layers';
import type {Timeline,Track} from '../animation/timeline';
const obj=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const finite=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const string=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
const color=(v:unknown):v is string=>typeof v==='string'&&(/^#[0-9a-fA-F]{6}$/.test(v)||v==='transparent');
const kinds:ModuleKind[]=['circle','square','ring','cross','diamond','quarter','petals','checker','triangle','bars','arc','star'];
const blends:BlendMode[]=['normal','multiply','screen','overlay'];
export function validDocument(v:unknown):v is StudioDocument{
 if(!obj(v))return false;
 if(!finite(v.seed,0,999999999)||!finite(v.columns,1,100)||!finite(v.rows,1,100)||!finite(v.density,0,100)||!finite(v.mix,0,100)||!finite(v.rotation,-36000,36000))return false;
 if(!Array.isArray(v.active)||v.active.length>12||!v.active.every(x=>kinds.includes(x)))return false;
 if(!color(v.foreground)||!color(v.background))return false;
 if(v.generator!==undefined&&v.generator!=='grid'&&v.generator!=='waves')return false;
 for(const [key,min,max] of [['waveAmplitude',0,150],['waveFrequency',0.1,16],['waveNoise',0,100],['waveLines',4,150]] as const){
  if(v[key]!==undefined&&!finite(v[key],min,max))return false;
 }
 return true;
}
export function validLayer(v:unknown):v is Layer{
 if(!obj(v)||!string(v.id,128)||!v.id||!string(v.name,256)||!['pattern','text'].includes(String(v.type)))return false;
 if(typeof v.visible!=='boolean'||typeof v.locked!=='boolean'||!finite(v.opacity,0,100)||!blends.includes(v.blend as BlendMode))return false;
 if(v.type==='pattern'&&v.pattern!==undefined&&!validDocument(v.pattern))return false;
 if(v.type==='text'){
  if(v.text!==undefined&&!string(v.text,10000))return false;
  if(v.fontFamily!==undefined&&(!string(v.fontFamily,80)||!GOOGLE_FONTS.some(f=>f.family===v.fontFamily)))return false;
  if(v.fontWeight!==undefined&&!finite(v.fontWeight,100,900))return false;
  if(v.fill!==undefined&&!color(v.fill))return false;
  if(v.rotation!==undefined&&!finite(v.rotation,-36000,36000))return false;
  for(const key of ['x','y','fontSize'] as const)if(v[key]!==undefined&&!finite(v[key],-10000,10000))return false;
 }
 return true;
}
function validTrack(v:unknown):v is Track{
 if(!obj(v)||!string(v.layerId,128)||!['rotation','opacity','x','y','scale'].includes(String(v.property))||!Array.isArray(v.keyframes)||v.keyframes.length>1000)return false;
 return v.keyframes.every(k=>obj(k)&&finite(k.time,0,3600)&&finite(k.value,-100000,100000)&&(k.easing===undefined||k.easing==='linear'||k.easing==='easeInOut'));
}
export function validTimeline(v:unknown):v is Timeline{
 return obj(v)&&finite(v.duration,0.001,3600)&&finite(v.fps,1,120)&&typeof v.loop==='boolean'&&Array.isArray(v.tracks)&&v.tracks.length<=1000&&v.tracks.every(validTrack);
}
