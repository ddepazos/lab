export type Easing='linear'|'easeInOut';
export type Keyframe={time:number;value:number;easing?:Easing};
export type Track={layerId:string;property:'rotation'|'opacity'|'x'|'y'|'scale';keyframes:Keyframe[]};
export type Timeline={duration:number;fps:number;loop:boolean;tracks:Track[]};
export const defaultTimeline:Timeline={duration:5,fps:30,loop:true,tracks:[]};
export function sampleTrack(track:Track,time:number):number|undefined{
 const frames=[...track.keyframes].sort((a,b)=>a.time-b.time);
 if(!frames.length)return undefined;
 if(time<=frames[0].time)return frames[0].value;
 if(time>=frames[frames.length-1].time)return frames[frames.length-1].value;
 const i=frames.findIndex(f=>f.time>=time);
 const a=frames[i-1],b=frames[i];let t=(time-a.time)/(b.time-a.time);
 if(b.easing==='easeInOut')t=t*t*(3-2*t);
 return a.value+(b.value-a.value)*t;
}
