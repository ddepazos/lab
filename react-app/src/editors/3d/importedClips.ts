import * as THREE from 'three';

/** Absolute-time evaluation shared by preview, scrubbing and composition export. */
export function importedClipPlayer(root:THREE.Object3D,clip:THREE.AnimationClip){
 const mixer=new THREE.AnimationMixer(root),action=mixer.clipAction(clip);action.play();action.clampWhenFinished=true;action.setLoop(THREE.LoopOnce,1);
 return {duration:clip.duration,sample(time:number,repeat=true){
  const duration=Math.max(0,clip.duration),safe=Math.max(0,Number.isFinite(time)?time:0);
  const t=duration>0?(repeat?safe%duration:Math.min(safe,duration)):0;
  action.enabled=true;action.paused=false;action.time=t;mixer.update(0);
  return t;
 },dispose(){action.stop();mixer.uncacheRoot(root)}};
}
