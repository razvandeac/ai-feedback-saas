export function randomKey(len = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/1/O/I
  let out = "";
  const cryptoObj = (globalThis as any).crypto || require("crypto").webcrypto;
  const bytes = new Uint8Array(len);
  cryptoObj.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out.toLowerCase();
}

