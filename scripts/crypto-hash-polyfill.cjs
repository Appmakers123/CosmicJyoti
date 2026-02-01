/**
 * Polyfill for Vite 7 + Node 18/20: crypto.hash is not a function.
 * Preload with: node -r ./scripts/crypto-hash-polyfill.cjs ...
 * Adds crypto.hash without replacing globalThis.crypto (which is read-only).
 */
const { createHash } = require('crypto');
if (globalThis.crypto && typeof globalThis.crypto.hash !== 'function') {
  try {
    Object.defineProperty(globalThis.crypto, 'hash', {
      value: function (algorithm) {
        return createHash(algorithm);
      },
      configurable: true,
      enumerable: true,
    });
  } catch (_) {}
}
