/**
 * @jest-environment node
 */
import { readJson, writeJson } from './localStorage';

// Runs without a DOM, which is what the server render sees. Reading storage during
// render would either throw here or, worse, make the server and client markup differ.
describe('persistence during server rendering', () => {
  it('has no window to read from', () => {
    expect(typeof window).toBe('undefined');
  });

  it('reads as empty instead of throwing', () => {
    expect(() => readJson('grofresh.anything', () => null)).not.toThrow();
    expect(readJson('grofresh.anything', () => null)).toBeNull();
  });

  it('reports the write as not persisted instead of throwing', () => {
    expect(() => writeJson('grofresh.anything', [1])).not.toThrow();
    expect(writeJson('grofresh.anything', [1])).toBe(false);
  });
});
