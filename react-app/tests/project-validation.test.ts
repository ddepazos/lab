import {describe,it,expect} from 'vitest';
import {parseProject,serializeProject} from '../src/document/project';
import {initialDocument} from '../src/state/studio';
import {createPatternLayer} from '../src/document/layers';
import {defaultTimeline} from '../src/animation/timeline';
const make=()=>JSON.parse(serializeProject(initialDocument,[createPatternLayer('pattern-1',initialDocument)],defaultTimeline)) as Record<string,any>;
describe('project import validation',()=>{
 it('accepts an exported project',()=>expect(parseProject(JSON.stringify(make())).format).toBe('lab-project'));
 it('rejects script-like SVG color injection',()=>{
  const p=make();p.document.foreground='red" onload="alert(1)';
  expect(()=>parseProject(JSON.stringify(p))).toThrow('Documento inválido');
 });
 it('rejects invalid wave controls',()=>{
  const p=make();p.layers[0].pattern.waveLines=999999;
  expect(()=>parseProject(JSON.stringify(p))).toThrow('Capas inválidas');
 });
 it('rejects invalid timeline frame values',()=>{
  const p=make();p.timeline.tracks=[{layerId:'pattern-1',property:'opacity',keyframes:[{time:1,value:'not a number'}]}];
  expect(()=>parseProject(JSON.stringify(p))).toThrow('Línea de tiempo inválida');
 });
 it('rejects duplicate layer identifiers',()=>{
  const p=make();p.layers.push({...p.layers[0]});
  expect(()=>parseProject(JSON.stringify(p))).toThrow('Identificadores de capa duplicados');
 });
 it('rejects malformed saved variations',()=>{
  const p=make();p.variations=[{id:'bad',name:'Bad',document:p.document,layers:[{id:'x'}],timeline:p.timeline}];
  expect(()=>parseProject(JSON.stringify(p))).toThrow('Variaciones inválidas');
 });
});
