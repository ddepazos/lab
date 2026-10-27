import type {Layer} from '../document/layers';
import type {StudioDocument} from '../document/types';
import type {Timeline} from '../animation/timeline';
import {animatedLayers} from '../animation/render';
import {composeSVG} from '../generators/composite';

/** Pure composition boundary. No React, Zustand, DOM or network calls.
 * Preview excludes text (rendered by the text overlay); export includes it.
 * Keep both outputs consistent with the existing editor contract.
 */
export function composeFrame(layers:Layer[],timeline:Timeline,time:number,doc:StudioDocument){
 const frameLayers=animatedLayers(layers,timeline,time);
 return {
  previewSvg:composeSVG(doc.background,frameLayers.filter(layer=>layer.type!=='text'),doc),
  exportSvg:composeSVG(doc.background,frameLayers,doc),
 };
}
