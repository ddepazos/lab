import {describe,expect,it} from 'vitest';
import {Object3D} from 'three';
import {applySceneMotion,type SceneMotion} from './motion';

const motions:SceneMotion[]=['spin','bob','sway','pulse','orbit','spin-x','spin-z','bounce','figure-eight','zoom','shake'];
const transform=(obj:Object3D)=>[...obj.position.toArray(),obj.rotation.x,obj.rotation.y,obj.rotation.z,...obj.scale.toArray()];

describe('3D timeline samples',()=>{
 it.each(motions)('%s seeks deterministically without accumulating transforms',motion=>{
  const obj=new Object3D();obj.position.set(2,3,4);obj.rotation.set(.1,.2,.3);obj.scale.set(2,3,4);
  applySceneMotion(obj,motion,1,0);const start=transform(obj);
  applySceneMotion(obj,motion,1,.5);const middle=transform(obj);
  expect(middle).not.toEqual(start);
  applySceneMotion(obj,motion,1,.5);
  transform(obj).forEach((value,i)=>expect(value).toBeCloseTo(middle[i],10));
  applySceneMotion(obj,motion,1,0);
  transform(obj).forEach((value,i)=>expect(value).toBeCloseTo(start[i],10));
 });
 it('removes the old motion when a paused preset changes',()=>{
  const obj=new Object3D();obj.position.y=3;
  applySceneMotion(obj,'bob',1,.5);
  applySceneMotion(obj,'spin',1,.5);
  expect(obj.position.y).toBeCloseTo(3);
  expect(obj.rotation.y).toBeCloseTo(.5);
 });
 it('keeps lateral rotation distinct from rotation around Z',()=>{
  const obj=new Object3D();
  applySceneMotion(obj,'spin-x',1,.5);
  expect(obj.rotation.x).toBeCloseTo(.5);
  expect(obj.rotation.z).toBe(0);
 });
});
