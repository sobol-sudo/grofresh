// Characters that cannot be confused with one another when read off a receipt.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 10;

/**
 * Builds a transaction code for a freshly placed order.
 * Order data is session-local, so the code only has to be unique enough to look real.
 */
export function createTransactionCode(): string {
  let code = '';

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  return code;
}
