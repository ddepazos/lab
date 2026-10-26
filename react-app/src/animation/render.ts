import type {Layer} from '../document/layers';
import type {Timeline} from './timeline';
import {sampleTrack} from './timeline';
export function animatedLayers(layers:Layer[],timeline:Timeline,time:number):Layer[]{
 return layers.map(layer=>{
  const next={...layer,pattern:layer.pattern?{...layer.pattern}:undefined};
  for(const track of timeline.tracks.filter(t=>t.layerId===layer.id)){
   const value=sampleTrack(track,time);
   if(value===undefined)continue;
   if(track.property==='opacity')next.opacity=Math.max(0,Math.min(100,value));
   if(track.property==='rotation')next.rotation=value;
   if(track.property==='x')next.x=value;
   if(track.property==='y')next.y=value;
   if(track.property==='scale')next.scale=Math.max(0.01,Math.min(4,value));
   if(track.property==='mix'&&next.pattern)next.pattern.mix=Math.max(0,Math.min(100,value));
   if(track.property==='gridRotation'&&next.pattern)next.pattern.rotation=value;
   if(track.property==='cellRotation'&&next.pattern)next.pattern.cellRotation=value;
   if(track.property==='cellScale'&&next.pattern)next.pattern.cellScale=Math.max(0.1,Math.min(2,value));
   if(track.property==='cellWave'&&next.pattern)next.pattern.cellWave=value;
  }
  return next;
 });
}
