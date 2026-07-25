import { readJson, writeJson } from './localStorage';

const KEY = 'test.key';

// Accepts anything that is an array of numbers, rejects everything else.
const asNumbers = (value: unknown): number[] | null =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'number')
    ? (value as number[])
    : null;

describe('readJson', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('returns the stored value when it parses and validates', () => {
    window.localStorage.setItem(KEY, JSON.stringify([1, 2, 3]));
    expect(readJson(KEY, asNumbers)).toEqual([1, 2, 3]);
  });

  it('returns null when the key was never written', () => {
    expect(readJson(KEY, asNumbers)).toBeNull();
  });

  // A truncated or hand-edited value must not throw out of the reducer that asked for it
  it('returns null instead of throwing on corrupted JSON', () => {
    window.localStorage.setItem(KEY, '{"orders": [');

    expect(() => readJson(KEY, asNumbers)).not.toThrow();
    expect(readJson(KEY, asNumbers)).toBeNull();
  });

  // Valid JSON of the wrong shape is just as dangerous as invalid JSON
  it('returns null when valid JSON fails validation', () => {
    window.localStorage.setItem(KEY, JSON.stringify(['not', 'numbers']));
    expect(readJson(KEY, asNumbers)).toBeNull();
  });

  // Private mode and blocked cookies make getItem throw outright
  it('returns null instead of throwing when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: storage is blocked');
    });

    expect(() => readJson(KEY, asNumbers)).not.toThrow();
    expect(readJson(KEY, asNumbers)).toBeNull();
  });

  // Some browsers throw on the window.localStorage property access itself
  it('returns null instead of throwing when the storage property is unreachable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError: access denied');
      },
    });

    try {
      expect(() => readJson(KEY, asNumbers)).not.toThrow();
      expect(readJson(KEY, asNumbers)).toBeNull();
    } finally {
      if (descriptor) Object.defineProperty(window, 'localStorage', descriptor);
    }
  });
});

describe('writeJson', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('writes a value that can be read back', () => {
    expect(writeJson(KEY, [4, 5])).toBe(true);
    expect(readJson(KEY, asNumbers)).toEqual([4, 5]);
  });

  // A full quota loses the history, never the session
  it('reports failure instead of throwing when the write is rejected', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeJson(KEY, [1])).not.toThrow();
    expect(writeJson(KEY, [1])).toBe(false);
  });
});
