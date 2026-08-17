import { colorToRgba, hexToRgb, rgbToHex } from '../../src/utils/color';

it('converts source-supported colors', () => {
  expect(hexToRgb('#3c9cff')).toBe('rgb(60,156,255)');
  expect(rgbToHex('rgb(60,156,255)')).toBe('#3c9cff');
  expect(colorToRgba('#3c9cff', 0.5)).toBe('rgba(60,156,255,0.5)');
});
