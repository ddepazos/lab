import type {Layer} from '../document/layers';
import type {Timeline} from './timeline';
import {sampleTrack} from './timeline';
export function animatedLayers(layers:Layer[],timeline:Timeline,time:number):Layer[]{
 return layers.map(layer=>{
  const next={...layer,pattern:layer.pattern?{...layer.pattern}:undefined};
  for(const track of timeline.tracks.filter(t=>t.layerId===layer.id)){
   const value=sampleTrack(track,time);
   if(value===undefined)continue;
   if(next.pattern&&['waveAmplitude','waveFrequency','waveNoise','waveStrokeWidth','waveDotSize','waveDecay','waveDistortion','waveLines','waveMeshColumns','columns','rows','density','expand'].includes(track.property)){
    const bounds:Record<string,[number,number]>={waveAmplitude:[0,500],waveFrequency:[0,100],waveNoise:[0,100],waveStrokeWidth:[0.1,100],waveDotSize:[0.1,100],waveDecay:[0,100],waveDistortion:[0,100],waveLines:[1,200],waveMeshColumns:[1,200],columns:[1,100],rows:[1,100],density:[0,100],expand:[0,500]};
    const [min,max]=bounds[track.property];
    const numeric=Math.max(min,Math.min(max,value));
    const rounded=['waveLines','waveMeshColumns','columns','rows'].includes(track.property)?Math.round(numeric):numeric;
    next.pattern={...next.pattern,[track.property]:rounded};
   }
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
