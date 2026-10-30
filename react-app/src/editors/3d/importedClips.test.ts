import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {importedClipPlayer} from './importedClips';
import {cloneSceneObject} from './surfaces';

describe('GENRE3D interchange',()=>{
 it('loads a GLB emitted by GENRE3D Three 0.175 and plays bones/morphs in Studio Three 0.180',async()=>{
  const bytes=readFileSync(new URL('../../../test-fixtures/genre3d-rig-animation.glb',import.meta.url));
  const data=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer;
  const gltf=await new GLTFLoader().parseAsync(data,'');expect(gltf.animations).toHaveLength(1);
  let mesh:THREE.SkinnedMesh|undefined;gltf.scene.traverse(n=>{if((n as THREE.SkinnedMesh).isSkinnedMesh)mesh=n as THREE.SkinnedMesh});expect(mesh).toBeDefined();
  const p=importedClipPlayer(gltf.scene,gltf.animations[0]);p.sample(.5,false);
  expect(mesh!.skeleton.bones[1].rotation.z).toBeCloseTo(Math.PI/6,5);expect(mesh!.morphTargetInfluences![0]).toBeCloseTo(.5,5);
  p.sample(1,false);expect(mesh!.morphTargetInfluences![0]).toBeCloseTo(1);p.sample(1.25,true);expect(mesh!.morphTargetInfluences![0]).toBeCloseTo(.25);
  const clone=cloneSceneObject(gltf.scene);let copy:THREE.SkinnedMesh|undefined;clone.traverse(n=>{if((n as THREE.SkinnedMesh).isSkinnedMesh)copy=n as THREE.SkinnedMesh});expect(copy!.skeleton.bones[1]).not.toBe(mesh!.skeleton.bones[1]);
  p.dispose();
 });
});
