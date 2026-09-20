/**
 * 注文番号の生成。
 *
 * 詳細設計書 DETAIL-004 §2.2 / research.md D-03 に対応。
 *
 * ULID 形式（Crockford Base32・26文字）を Node.js 標準の crypto で生成する。
 * 先頭48ビットがミリ秒精度のタイムスタンプ、残り80ビットが乱数。
 * `ulid` パッケージは追加しない（tech-stack.md §6 で却下済み）。
 *
 * 純関数として切り出し、DB に依存せず検証できるようにする（憲法§2 / FR-023）。
 */
import { randomBytes } from "crypto";

/** Crockford Base32。読み間違えやすい I・L・O・U を除いた32文字 */
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const TIME_LENGTH = 10; // 48ビット = 10文字
const RANDOM_LENGTH = 16; // 80ビット = 16文字
export const ORDER_NUMBER_LENGTH = TIME_LENGTH + RANDOM_LENGTH; // 26

/** ミリ秒のタイムスタンプを Base32 の10文字へ変換する */
function encodeTime(now: number): string {
  let remaining = now;
  let encoded = "";
  for (let i = 0; i < TIME_LENGTH; i += 1) {
    const mod = remaining % 32;
    encoded = ENCODING[mod] + encoded;
    remaining = (remaining - mod) / 32;
  }
  return encoded;
}

/** 暗号論的乱数から Base32 の16文字を作る */
function encodeRandom(): string {
  // 1文字あたり1バイトを引き、上位5ビット分を使う（剰余による偏りを避ける）
  const bytes = randomBytes(RANDOM_LENGTH);
  let encoded = "";
  for (let i = 0; i < RANDOM_LENGTH; i += 1) {
    encoded += ENCODING[bytes[i] >>> 3];
  }
  return encoded;
}

/**
 * 注文番号を1件生成する。
 *
 * @param now 生成時刻（ミリ秒）。省略時は現在時刻。テストで時刻を固定するための引数。
 */
export function generateOrderNumber(now: number = Date.now()): string {
  if (!Number.isInteger(now) || now < 0) {
    throw new Error(`生成時刻が不正です: ${now}`);
  }
  return encodeTime(now) + encodeRandom();
}
