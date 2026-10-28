import type {Object3D} from 'three';

export type SceneMotion = 'spin'|'bob'|'sway'|'pulse'|'orbit'|'spin-x'|'spin-z'|'bounce'|'figure-eight'|'zoom'|'shake';
type MotionDelta = {rotationX?:number;rotationY?:number;rotationZ?:number;positionX?:number;positionY?:number;scale?:number};

// Remove the previous sample before applying the next one. This preserves the
// user's base transform and makes playback, reset and paused seeking agree.
export function applySceneMotion(obj:Object3D,motion:SceneMotion,intensity:number,time:number){
 const previous=obj.userData.labAnimation as MotionDelta|undefined;
 if(previous){
  obj.rotation.x-=previous.rotationX??0;
  obj.rotation.y-=previous.rotationY??0;
  obj.rotation.z-=previous.rotationZ??0;
  obj.position.x-=previous.positionX??0;
  obj.position.y-=previous.positionY??0;
  if(previous.scale)obj.scale.divideScalar(previous.scale);
 }
 const delta:MotionDelta={};
 const phase=time*intensity;
 switch(motion){
  case 'spin':delta.rotationY=phase;break;
  case 'bob':delta.positionY=Math.sin(time*2)*intensity*.6;break;
  case 'sway':delta.rotationZ=Math.sin(time*2)*intensity*.45;break;
  case 'pulse':delta.scale=Math.max(.05,1+.25*intensity*Math.sin(time*2));break;
  case 'orbit':delta.positionX=Math.cos(time)*intensity;delta.positionY=Math.sin(time)*intensity;break;
  case 'spin-x':delta.rotationX=phase;break;
  case 'spin-z':delta.rotationZ=phase;break;
  case 'bounce':delta.positionY=Math.abs(Math.sin(time*3))*intensity;break;
  case 'figure-eight':delta.positionX=Math.sin(time)*intensity;delta.positionY=Math.sin(time*2)*intensity*.5;break;
  case 'zoom':delta.scale=Math.max(.05,1+Math.sin(time*2)*intensity*.3);break;
  case 'shake':delta.positionX=Math.sin(time*19)*intensity*.13;delta.positionY=Math.cos(time*23)*intensity*.13;break;
 }
 obj.rotation.x+=delta.rotationX??0;
 obj.rotation.y+=delta.rotationY??0;
 obj.rotation.z+=delta.rotationZ??0;
 obj.position.x+=delta.positionX??0;
 obj.position.y+=delta.positionY??0;
 if(delta.scale)obj.scale.multiplyScalar(delta.scale);
 obj.userData.labAnimation=delta;
}
