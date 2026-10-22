export type ModuleKind = 'circle' | 'square' | 'ring' | 'cross' | 'diamond' | 'quarter' | 'petals' | 'checker' | 'triangle' | 'bars' | 'arc' | 'star';
export type Family = 'Básicos' | 'Teselaciones' | 'Radiales';
export interface ModuleDefinition { id: ModuleKind; label: string; family: Family; }
export interface StudioDocument { seed: number; columns: number; rows: number; density: number; mix: number; rotation: number; active: ModuleKind[]; foreground: string; background: string; generator?: 'grid' | 'waves'; waveAmplitude?: number; waveFrequency?: number; waveNoise?: number; waveLines?: number; waveDecay?: number; waveDistortion?: number; waveStrokeWidth?: number; waveStyle?: 'lines' | 'dots' | 'mesh'; waveDotSize?: number; waveMeshColumns?: number; }
