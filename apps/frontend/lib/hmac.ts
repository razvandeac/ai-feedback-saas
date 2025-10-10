import crypto from "crypto";

export function hmacHex(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
