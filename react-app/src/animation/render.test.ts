import {describe,it,expect} from 'vitest';
import {animatedLayers} from './render';
import {sampleTrack,type Timeline} from './timeline';
import {defaultLayers} from '../document/layers';
const layer=defaultLayers[0];
const timeline=(property:'scale'|'opacity'|'rotation',values:number[]):Timeline=>({duration:2,fps:30,loop:true,tracks:[{layerId:layer.id,property,keyframes:values.map((value,i)=>({time:i*2/(values.length-1),value,easing:'linear' as const}))}]});
describe('motion preset sampling',()=>{
 it('pulse scales up and returns to baseline',()=>{const t=timeline('scale',[1,1.8,1]);expect(animatedLayers([layer],t,0)[0].scale).toBe(1);expect(animatedLayers([layer],t,1)[0].scale).toBeCloseTo(1.8);expect(animatedLayers([layer],t,2)[0].scale).toBe(1)});
 it('blink alternates visibility',()=>{const t=timeline('opacity',[100,0,100,0,100]);expect(animatedLayers([layer],t,.5)[0].opacity).toBe(0);expect(animatedLayers([layer],t,1)[0].opacity).toBe(100);expect(animatedLayers([layer],t,1.5)[0].opacity).toBe(0)});
 it('rotation changes layer without modifying source',()=>{const t=timeline('rotation',[0,360]);expect(animatedLayers([layer],t,1)[0].rotation).toBe(180);expect(layer.rotation).toBeUndefined()});
 it('interpolates between keyframes',()=>{expect(sampleTrack(timeline('scale',[1,2]).tracks[0],1)).toBeCloseTo(1.5)});
});
