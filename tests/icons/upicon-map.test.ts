import { upiconGlyphs } from '../../src/icons';

it('contains source glyph mappings', () => {
  expect(upiconGlyphs.search).toBe('\ue62a');
  expect(upiconGlyphs.checkmark).toBe('\ue6a8');
});
