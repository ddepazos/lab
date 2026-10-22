import type {Layer} from '../document/layers';
import type {Timeline} from './timeline';
import {sampleTrack} from './timeline';
export function animatedLayers(layers:Layer[],timeline:Timeline,time:number):Layer[]{
 return layers.map(layer=>{
  const next={...layer};
  for(const track of timeline.tracks.filter(t=>t.layerId===layer.id)){
   const value=sampleTrack(track,time);
   if(value===undefined)continue;
   if(track.property==='opacity')next.opacity=Math.max(0,Math.min(100,value));
   if(track.property==='rotation'){if(next.type==='pattern'&&next.pattern)next.pattern={...next.pattern,rotation:value};if(next.type==='text')next.rotation=value;}
   if(track.property==='x'&&next.type==='text')next.x=value;
   if(track.property==='y'&&next.type==='text')next.y=value;
   if(track.property==='scale'&&next.type==='text')next.fontSize=Math.max(1,value);
  }
  return next;
 });
}
