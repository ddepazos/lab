import {describe,it,expect} from 'vitest';
import {randomAt} from '../src/generators/seed';
import {generateSVG} from '../src/generators/grid';
import {initialDocument} from '../src/state/studio';
describe('semillas reproducibles',()=>{it('misma semilla, mismo valor',()=>expect(randomAt(426,3)).toBe(randomAt(426,3)));it('semillas distintas cambian valores',()=>expect(randomAt(426,3)).not.toBe(randomAt(427,3)));it('SVG determinista',()=>expect(generateSVG(initialDocument)).toBe(generateSVG(initialDocument)));it('cambiar semilla modifica SVG',()=>expect(generateSVG(initialDocument)).not.toBe(generateSVG({...initialDocument,seed:427})));});
