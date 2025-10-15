export function randomKey(len = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/1/O/I
  let out = "";
  const bytes = new Uint8Array(len);
  
  // Use Web Crypto API (available in browsers and Node 15+)
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback for older Node versions (should not happen in modern setups)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { webcrypto } = require("crypto");
    webcrypto.getRandomValues(bytes);
  }
  
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out.toLowerCase();
}

