import {describe,expect,it} from 'vitest';
import {composeFrame} from './compose-frame';
import {initialDocument} from '../state/studio';
import {defaultLayers} from '../document/layers';
import {defaultTimeline} from '../animation/timeline';

describe('preview/export composition separation',()=>{
 it('does not compose export SVG for live preview',()=>{
  const frame=composeFrame(defaultLayers,defaultTimeline,0,initialDocument,false);
  expect(frame.previewSvg).toContain('<svg');
  expect(frame.exportSvg).toBe('');
 });
 it('preserves export SVG when explicitly requested',()=>{
  const frame=composeFrame(defaultLayers,defaultTimeline,0,initialDocument,true);
  expect(frame.exportSvg).toContain('<svg');
  expect(frame.previewSvg).toContain('<svg');
 });
 it('keeps legacy call behavior for export callers',()=>{
  const frame=composeFrame(defaultLayers,defaultTimeline,0,initialDocument);
  expect(frame.exportSvg).toContain('<svg');
 });
});
