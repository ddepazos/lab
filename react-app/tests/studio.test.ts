import {beforeEach,describe,expect,it} from 'vitest';
import {useStudio,initialDocument} from '../src/state/studio';
import {createPatternLayer,createTextLayer} from '../src/document/layers';
import {defaultTimeline} from '../src/animation/timeline';

beforeEach(()=>{
 useStudio.getState().reset();
});
describe('studio layer behavior',()=>{
 it('blocks content edits on locked layers but allows hiding and unlocking',()=>{
  const store=useStudio.getState();
  store.updateLayer('pattern-1',{locked:true});
  store.updateLayer('pattern-1',{name:'Should not change'});
  store.updateLayer('pattern-1',{visible:false});
  expect(useStudio.getState().layers[0].name).not.toBe('Should not change');
  expect(useStudio.getState().layers[0].visible).toBe(false);
  store.updateLayer('pattern-1',{locked:false});
  expect(useStudio.getState().layers[0].locked).toBe(false);
 });
 it('prevents identity mutation',()=>{
  useStudio.getState().updateLayer('pattern-1',{id:'hijacked',type:'text'});
  expect(useStudio.getState().layers[0].id).toBe('pattern-1');
  expect(useStudio.getState().layers[0].type).toBe('pattern');
 });
 it('restores selected pattern settings from imported project',()=>{
  const custom={...initialDocument,seed:12345,generator:'waves' as const};
  const layer=createPatternLayer('custom',custom);
  useStudio.getState().loadProject({format:'lab-project',version:1,document:initialDocument,layers:[layer],timeline:defaultTimeline});
  expect(useStudio.getState().doc.seed).toBe(12345);
  expect(useStudio.getState().doc.generator).toBe('waves');
 });
 it('retains document background on selecting other layers',()=>{
  const pattern=createPatternLayer('p',initialDocument);
  const text=createTextLayer('t');
  useStudio.getState().loadProject({format:'lab-project',version:1,document:{...initialDocument,background:'#ffffff'},layers:[pattern,text],timeline:defaultTimeline});
  useStudio.getState().selectLayer('t');
  expect(useStudio.getState().doc.background).toBe('#ffffff');
 });
});
