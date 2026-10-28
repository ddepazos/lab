import {describe,it,expect} from 'vitest';
import {layerBox} from '../components/LayerHandles';
import {createPatternLayer,createTextLayer} from '../document/layers';
import {initialDocument,useStudio,beginStudioGesture,endStudioGesture,connectStudioTimelineHistory} from '../state/studio';
import {defaultTimeline,type Timeline} from '../animation/timeline';
import {composeSVG} from '../generators/composite';
describe('mouse editing geometry and history',()=>{
 it('maps text coordinates to the centered square in a landscape document',()=>{
  const box=layerBox({...createTextLayer('text'),x:100,y:200},1600,900);
  expect(box.originX).toBeCloseTo(462.5);expect(box.originY).toBeCloseTo(225);expect(box.unit).toBeCloseTo(1.125);
 });
 it('moves a pattern as a layer when repeat is disabled',()=>{
  const layer={...createPatternLayer('p',initialDocument),x:120,y:40,tileMotion:false};
  const svg=composeSVG('#000000',[layer],initialDocument);
  expect(svg).toContain('translate(120 40)');expect(svg).not.toContain('lab-repeat-');
 });
 it('applies rotation to image composition',()=>{
  const layer={id:'img',name:'img',type:'image' as const,visible:true,locked:false,opacity:100,blend:'normal' as const,imageSrc:'data:image/png;base64,AA==',x:20,y:30,rotation:45,scale:2};
  expect(composeSVG('#000000',[layer],initialDocument)).toContain('translate(20 30) rotate(45) scale(2)');
 });
 it('undoes a mouse gesture and its animation offsets as one edit',()=>{
  useStudio.getState().reset();
  const id=useStudio.getState().selectedLayer;
  let timeline:Timeline={...defaultTimeline,tracks:[{layerId:id,property:'x',keyframes:[{time:0,value:0},{time:5,value:100}]}]};
  const disconnect=connectStudioTimelineHistory(()=>timeline,value=>{timeline=value;});
  try{
   beginStudioGesture();
   for(let x=10;x<=50;x+=10)useStudio.getState().updateLayer(id,{x});
   timeline={...timeline,tracks:[{...timeline.tracks[0],keyframes:[{time:0,value:50},{time:5,value:150}]}]};
   endStudioGesture();useStudio.getState().undo();
   expect(useStudio.getState().layers[0].x??0).toBe(0);
   expect(timeline.tracks[0].keyframes[0].value).toBe(0);
   useStudio.getState().redo();
   expect(useStudio.getState().layers[0].x).toBe(50);
   expect(timeline.tracks[0].keyframes[0].value).toBe(50);
  }finally{disconnect();}
 });
});
