import {beforeEach,describe,expect,it} from 'vitest';
import {initialDocument,useStudio} from '../state/studio';
import {composeFrame} from './compose-frame';
import {defaultTimeline} from '../animation/timeline';
import {parseProject,serializeProject} from '../document/project';

describe('independent 2D composition',()=>{
 beforeEach(()=>useStudio.getState().reset());
 it('keeps generator and palette settings isolated after selection and edits',()=>{
  useStudio.getState().set('palette',['#ff0000','#0000ff']);
  const first=useStudio.getState().selectedLayer;
  useStudio.getState().addLayer('pattern','waves');
  const second=useStudio.getState().selectedLayer;
  useStudio.getState().set('waveAmplitude',120);
  useStudio.getState().set('palette',['#00ff00']);
  useStudio.getState().selectLayer(first);
  expect(useStudio.getState().doc.generator??'grid').toBe('grid');
  expect(useStudio.getState().doc.palette).toEqual(['#ff0000','#0000ff']);
  useStudio.getState().selectLayer(second);
  expect(useStudio.getState().doc.waveAmplitude).toBe(120);
 });
 it('does not inherit absent layer settings from whichever layer is selected',()=>{
  const first={...useStudio.getState().layers[0],pattern:{...initialDocument}};
  const a=composeFrame([first],defaultTimeline,0,{...initialDocument,expand:500,gestalt:'closure'}).exportSvg;
  const b=composeFrame([first],defaultTimeline,0,initialDocument).exportSvg;
  expect(a).toBe(b);
 });
 it('samples different layer tracks independently and round-trips the composition',()=>{
  useStudio.getState().addLayer('pattern','waves');
  const waves=useStudio.getState().selectedLayer;
  useStudio.getState().addLayer('pattern','dots');
  const dots=useStudio.getState().selectedLayer;
  useStudio.getState().set('active',['hexagon','gridlines','waves']);
  const timeline={...defaultTimeline,tracks:[
   {layerId:waves,property:'waveAmplitude' as const,keyframes:[{time:0,value:20},{time:5,value:120,easing:'elastic' as const}]},
   {layerId:dots,property:'y' as const,keyframes:[{time:0,value:0},{time:5,value:100}]}
  ]};
  const state=useStudio.getState();
  const project=parseProject(serializeProject(state.doc,state.layers,timeline));
  const frame=composeFrame(project.layers,project.timeline,5,project.document);
  expect(frame.layers[0].y).toBeUndefined();
  expect(frame.layers.find(l=>l.id===waves)?.pattern?.waveAmplitude).toBe(120);
  expect(frame.layers.find(l=>l.id===waves)?.y).toBeUndefined();
  expect(frame.layers.find(l=>l.id===dots)?.y).toBe(100);
  expect(state.layers.find(l=>l.id===waves)?.pattern?.waveAmplitude).toBeUndefined();
 });
});
