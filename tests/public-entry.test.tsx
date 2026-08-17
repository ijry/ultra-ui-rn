import { UP } from '../src';

describe('public entrypoint', () => {
  it('exposes the UP namespace', () => {
    expect(UP).toBeDefined();
  });
});
