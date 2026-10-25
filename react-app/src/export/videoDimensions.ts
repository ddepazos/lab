/** Video dimensions must be even for H.264 and independent of preview zoom. */
export function videoDimensions(longEdge:number,sourceWidth:number,sourceHeight:number):{width:number;height:number}{
 if(!Number.isFinite(longEdge)||longEdge<2||!Number.isFinite(sourceWidth)||!Number.isFinite(sourceHeight)||sourceWidth<=0||sourceHeight<=0)throw new Error('Dimensiones de video inválidas');
 const edge=Math.max(2,Math.round(longEdge/2)*2);
 const ratio=sourceWidth/sourceHeight;
 return ratio>=1
  ?{width:edge,height:Math.max(2,Math.round(edge/ratio/2)*2)}
  :{width:Math.max(2,Math.round(edge*ratio/2)*2),height:edge};
}
