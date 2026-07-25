/**
 * localStorage access that can never take the app down.
 *
 * Three things go wrong with browser storage and all three are handled here:
 *  - it does not exist while the page is rendered on the server;
 *  - touching it throws outright when the browser blocks storage for the origin
 *    (private mode, third-party iframe, cookies disabled);
 *  - the value that comes back is arbitrary text that may not be the JSON we wrote.
 *
 * Every failure degrades to "there is nothing stored" instead of an exception, so
 * callers never need a try/catch of their own.
 */

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    // Reading the property itself throws when storage is blocked.
    return null;
  }
}

/**
 * Reads a JSON value and hands it to `validate`, which decides whether the parsed
 * shape is still the shape this version of the app expects.
 *
 * @returns the validated value, or null if it is missing, unreadable or malformed.
 */
export function readJson<T>(key: string, validate: (value: unknown) => T | null): T | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return null;
  }

  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Truncated, hand-edited or written by another app: treat it as absent.
    return null;
  }

  return validate(parsed);
}

/**
 * Writes a JSON value. Persistence is best-effort: a full quota or blocked storage
 * costs the user their history, not their session.
 *
 * @returns whether the value actually reached storage.
 */
export function writeJson(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
