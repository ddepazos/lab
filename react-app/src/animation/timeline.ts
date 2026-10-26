export type Easing='linear'|'easeInOut'|'easeIn'|'easeOut'|'step'|'elastic';
export type Keyframe={time:number;value:number;easing?:Easing};
export type Track={layerId:string;property:'rotation'|'opacity'|'x'|'y'|'scale'|'mix'|'gridRotation'|'cellRotation'|'cellScale'|'cellWave';keyframes:Keyframe[]};
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
 if(b.easing==='easeIn')t=t*t*t;
 if(b.easing==='easeOut')t=1-Math.pow(1-t,3);
 if(b.easing==='step')t=0;
 if(b.easing==='elastic')t=t===0||t===1?t:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1;
 return a.value+(b.value-a.value)*t;
}
