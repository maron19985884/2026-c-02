import { randomBytes } from "crypto";

const CROCKFORD_BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateOrderNumber(): string {
  const timestampPart = encodeBase32(BigInt(Date.now()), 10);
  const randomPart = encodeBase32(bytesToBigInt(randomBytes(10)), 16);
  return `${timestampPart}${randomPart}`;
}

function encodeBase32(value: bigint, length: number): string {
  let remaining = value;
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = Number(remaining & 0x1fn);
    result = CROCKFORD_BASE32_ALPHABET[index] + result;
    remaining >>= 5n;
  }
  return result;
}

function bytesToBigInt(bytes: Buffer): bigint {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte);
  }
  return value;
}
