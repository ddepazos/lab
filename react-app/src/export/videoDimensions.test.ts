import {describe,expect,it} from 'vitest';
import {videoDimensions} from './videoDimensions';

describe('video export aspect ratio',()=>{
 it('keeps square canvases square',()=>expect(videoDimensions(1080,800,800)).toEqual({width:1080,height:1080}));
 it('preserves 16:9 landscape without stretching',()=>expect(videoDimensions(1080,1600,900)).toEqual({width:1080,height:608}));
 it('preserves 9:16 portrait without stretching',()=>expect(videoDimensions(1080,900,1600)).toEqual({width:608,height:1080}));
 it('preserves A4 portrait with even dimensions',()=>expect(videoDimensions(2160,794,1123)).toEqual({width:1528,height:2160}));
 it('rejects invalid document dimensions',()=>expect(()=>videoDimensions(1080,0,800)).toThrow());
});
