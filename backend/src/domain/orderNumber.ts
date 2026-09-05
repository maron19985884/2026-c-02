import { randomBytes } from "node:crypto";

// 注文番号: "ORD-" + Crockford Base32 26文字（ULID 相当のレイアウト）。
// 48bit ミリ秒タイムスタンプ + 80bit 乱数 = 128bit を Base32 エンコードする。
// 外部ライブラリ（ulid 等）は使わない（research.md D-05 / tech-stack.md §6）。

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // I, L, O, U を除外

/** 16 バイト (128bit) を Crockford Base32 の 26 文字へ。 */
function encodeCrockfordBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += CROCKFORD[(value << (5 - bits)) & 31];
  }
  return out.slice(0, 26);
}

/**
 * 一意な注文番号を生成する。
 * @param now エポックミリ秒（テスト用に注入可能）。
 */
export function generateOrderNumber(now: number = Date.now()): string {
  const buf = new Uint8Array(16);

  // 先頭 6 バイト = 48bit タイムスタンプ (big-endian)
  let ts = Math.floor(now);
  for (let i = 5; i >= 0; i--) {
    buf[i] = ts & 0xff;
    ts = Math.floor(ts / 256);
  }

  // 残り 10 バイト = 80bit 乱数
  buf.set(randomBytes(10), 6);

  return `ORD-${encodeCrockfordBase32(buf)}`;
}

/** 形式チェック（テスト・照会用）。 */
export const ORDER_NUMBER_PATTERN = /^ORD-[0-9A-HJKMNP-TV-Z]{26}$/;
