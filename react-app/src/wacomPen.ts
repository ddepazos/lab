/** Wacom / stylus input adapter for LAB Studio.
 * Browser Pointer Events work with Wacom, mouse and other pen tablets.
 * No vendor SDK or privileged hardware access is required.
 */
export type LabPenSample = {
  x: number; y: number; pressure: number; tiltX: number; tiltY: number;
  twist: number; time: number; pointerType: string; eraser: boolean;
};
export type LabPenStroke = { id: string; samples: LabPenSample[]; presetId?: string; layerId?: string };
export type LabPenSettings = { minWidth: number; maxWidth: number; smoothing: number };
export const defaultLabPenSettings: LabPenSettings = { minWidth: 1, maxWidth: 16, smoothing: 0.35 };
export function penSample(event: PointerEvent, rect: DOMRect, scale = 1): LabPenSample {
  const pressure = event.pointerType === 'mouse' ? 0.5 : event.pressure;
  return {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale,
    pressure: Math.max(0, Math.min(1, pressure)),
    tiltX: event.tiltX || 0, tiltY: event.tiltY || 0,
    twist: event.twist || 0, time: event.timeStamp,
    pointerType: event.pointerType,
    eraser: event.button === 5 || (event.buttons & 32) !== 0
  };
}
export function widthFromPressure(pressure: number, settings = defaultLabPenSettings): number {
  const p = Math.max(0, Math.min(1, pressure));
  return settings.minWidth + (settings.maxWidth - settings.minWidth) * p;
}
export function smoothPenSamples(samples: LabPenSample[], amount = defaultLabPenSettings.smoothing): LabPenSample[] {
  if (samples.length < 2) return samples.slice();
  const alpha = Math.max(0, Math.min(1, 1 - amount));
  const result = [samples[0]];
  for (let i = 1; i < samples.length; i++) {
    const previous = result[result.length - 1], current = samples[i];
    result.push({ ...current, x: previous.x + (current.x - previous.x) * alpha,
      y: previous.y + (current.y - previous.y) * alpha });
  }
  return result;
}
/** Keeps source presets intact; edits live as independent reversible overlays. */
export type PresetIntervention = {
  id: string; presetId: string; layerId: string; enabled: boolean;
  strokes: LabPenStroke[]; createdAt: number;
};
export function addStrokeToIntervention(
  intervention: PresetIntervention, stroke: LabPenStroke
): PresetIntervention {
  return { ...intervention, strokes: [...intervention.strokes, stroke] };
}
export function removeStrokeFromIntervention(
  intervention: PresetIntervention, strokeId: string
): PresetIntervention {
  return { ...intervention, strokes: intervention.strokes.filter(s => s.id !== strokeId) };
}
