import {describe,expect,it} from 'vitest';
import {generateWavesSVG} from '../src/generators/waves';
import {composeSVG} from '../src/generators/composite';
import {initialDocument} from '../src/state/studio';
import {createPatternLayer} from '../src/document/layers';
import {parseProject,serializeProject} from '../src/document/project';
import {defaultTimeline} from '../src/animation/timeline';

describe('parametric waves',()=>{
 const doc={...initialDocument,generator:'waves' as const,waveLines:12,waveAmplitude:40,waveFrequency:5,waveNoise:30};
 it('is deterministic for the same seed and controls',()=>{
  expect(generateWavesSVG(doc)).toBe(generateWavesSVG(doc));
 });
 it('responds to parameters and seed',()=>{
  expect(generateWavesSVG(doc)).not.toBe(generateWavesSVG({...doc,waveAmplitude:0}));
  expect(generateWavesSVG(doc)).not.toBe(generateWavesSVG({...doc,seed:doc.seed+1}));
 });
 it('limits line count for oversized inputs',()=>{
  const svg=generateWavesSVG({...doc,waveLines:100000});
  expect((svg.match(/<path /g)??[]).length).toBe(150);
 });
 it('composes waves without nested SVG roots or transparent backgrounds',()=>{
  const layer=createPatternLayer('waves-1',doc);
  const svg=composeSVG(doc.background,[layer],doc);
  expect((svg.match(/<svg /g)??[]).length).toBe(1);
  expect(svg).not.toContain('fill="transparent"');
  expect(svg).toContain('<path ');
 });
});
describe('saved variations',()=>{
 it('round-trips variations with legacy project version',()=>{
  const layer=createPatternLayer('waves-1',initialDocument);
  const variation={id:'variation-1',name:'Primera',document:initialDocument,layers:[layer],timeline:defaultTimeline};
  const raw=serializeProject(initialDocument,[layer],defaultTimeline,[variation]);
  expect(parseProject(raw).variations?.[0].name).toBe('Primera');
 });
 it('opens older projects without variations',()=>{
  const layer=createPatternLayer('pattern-1',initialDocument);
  const raw=JSON.stringify({format:'lab-project',version:1,document:initialDocument,layers:[layer],timeline:defaultTimeline});
  expect(parseProject(raw).variations).toBeUndefined();
 });
});
