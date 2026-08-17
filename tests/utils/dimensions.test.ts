import { getPx, range, rpx2px } from '../../src/utils/dimensions';

describe('dimensions', () => {
  it('converts rpx values using a 750-wide baseline', () => {
    expect(rpx2px(375, 375)).toBe(187.5);
    expect(getPx('20rpx', 375)).toBe(10);
  });

  it('normalizes px values and clamps source ranges', () => {
    expect(getPx('12px', 375)).toBe(12);
    expect(getPx(8, 375)).toBe(8);
    expect(range(0, 10, 12)).toBe(10);
  });
});
