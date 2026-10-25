import {describe,expect,it} from 'vitest';
import {animatedLayers} from './render';
import {sampleTrack,type Timeline} from './timeline';
import {defaultLayers} from '../document/layers';

describe('LAB timeline functional regressions',()=>{
 it('does not mutate original layers while animating',()=>{
  const original=structuredClone(defaultLayers[0]);
  const timeline:Timeline={duration:2,fps:30,loop:false,tracks:[{layerId:original.id,property:'x',keyframes:[{time:0,value:0},{time:2,value:200}]}]};
  const output=animatedLayers([original],timeline,1);
  expect(output[0].x).toBe(100);
  expect(original.x).not.toBe(100);
 });
 it('clamps opacity and scale to supported values',()=>{
  const layer=structuredClone(defaultLayers[0]);
  const timeline:Timeline={duration:1,fps:30,loop:false,tracks:[
   {layerId:layer.id,property:'opacity',keyframes:[{time:0,value:150}]},
   {layerId:layer.id,property:'scale',keyframes:[{time:0,value:-2}]}
  ]};
  const result=animatedLayers([layer],timeline,0)[0];
  expect(result.opacity).toBe(100);
  expect(result.scale).toBe(0.01);
 });
 it('samples out-of-range time at endpoints',()=>{
  const track={layerId:'a',property:'x' as const,keyframes:[{time:0,value:20},{time:2,value:80}]};
  expect(sampleTrack(track,-1)).toBe(20);
  expect(sampleTrack(track,5)).toBe(80);
 });
 it('ignores empty tracks',()=>{
  expect(sampleTrack({layerId:'a',property:'x',keyframes:[]},1)).toBeUndefined();
 });
});
