import {beforeEach,describe,expect,it} from 'vitest';
import {initialDocument,useStudio} from './studio';
import {defaultTimeline} from '../animation/timeline';

describe('LAB Web layer regression',()=>{
 beforeEach(()=>useStudio.getState().reset());
 it('starts with one selected pattern',()=>{
  const s=useStudio.getState();
  expect(s.layers).toHaveLength(1);
  expect(s.selectedLayer).toBe(s.layers[0].id);
 });
 it('keeps the only layer',()=>{
  const s=useStudio.getState();
  s.deleteLayer(s.selectedLayer);
  expect(useStudio.getState().layers).toHaveLength(1);
 });
 it('cannot delete locked layers',()=>{
  useStudio.getState().addLayer('text');
  const id=useStudio.getState().selectedLayer;
  useStudio.getState().updateLayer(id,{locked:true});
  useStudio.getState().deleteLayer(id);
  expect(useStudio.getState().layers.some(l=>l.id===id)).toBe(true);
 });
 it('cannot reorder through a locked layer',()=>{
  useStudio.getState().addLayer('text');
  const id=useStudio.getState().selectedLayer;
  const first=useStudio.getState().layers[0].id;
  useStudio.getState().updateLayer(first,{locked:true});
  useStudio.getState().moveLayer(id,-1);
  expect(useStudio.getState().layers[0].id).toBe(first);
 });
 it('centers imported images in a custom canvas',()=>{
  useStudio.getState().set('canvasWidth',1200);
  useStudio.getState().set('canvasHeight',600);
  useStudio.getState().addImage('sample','data:image/png;base64,AA==',200,100);
  const image=useStudio.getState().layers.at(-1);
  expect(image?.x).toBe(500);
  expect(image?.y).toBe(250);
 });
 it('preserves canvas dimensions after deleting selected layer',()=>{
  useStudio.getState().set('canvasWidth',1200);
  useStudio.getState().set('canvasHeight',600);
  useStudio.getState().addLayer('pattern');
  useStudio.getState().deleteLayer(useStudio.getState().selectedLayer);
  expect(useStudio.getState().doc.canvasWidth).toBe(1200);
  expect(useStudio.getState().doc.canvasHeight).toBe(600);
 });
 it('recovers a missing layer array when loading a project',()=>{
  useStudio.getState().loadProject({
   format:'lab-project',version:1,document:{...initialDocument},
   layers:[],timeline:defaultTimeline
  });
  expect(useStudio.getState().layers).toHaveLength(1);
 });
});
