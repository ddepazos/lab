/** Pure playback-time calculation. No React, DOM, SVG, or network dependencies.
 * Keep the playback clock reusable by Web, Desktop and export tests.
 */
export function advancePlaybackTime(current:number,elapsedSeconds:number,speed:number,duration:number,loop:boolean):number{
 const safeDuration=Math.max(0.2,Number.isFinite(duration)?duration:5);
 const delta=Math.min(0.1,Math.max(0,Number.isFinite(elapsedSeconds)?elapsedSeconds:0))*Math.max(0,Number.isFinite(speed)?speed:1);
 const next=Math.max(0,Number.isFinite(current)?current:0)+delta;
 return loop?next%safeDuration:Math.min(next,safeDuration);
}
export function previewFrameInterval(fps:number):number{
 return 1000/Math.min(30,Math.max(1,Number.isFinite(fps)?fps:24));
}
