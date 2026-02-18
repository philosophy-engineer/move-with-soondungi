import { randomBytes } from "node:crypto";

const DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * 난수 기반 고유 ID 생성 (간단 nanoid 구현)
 *
 * 기본 alphabet(36자) 기준 조합 수는 36^size.
 * 실무에서는 prefix(예: 날짜, 도메인)를 함께 쓰면 충돌 확률이 더 낮아진다.
 */
export function createNanoId(size = 12, alphabet = DEFAULT_ALPHABET): string {
  if (size <= 0) {
    return "";
  }

  if (!alphabet.length) {
    throw new Error("alphabet은 최소 1자 이상이어야 합니다.");
  }

  const bytes = randomBytes(size);
  let id = "";

  for (const byte of bytes) {
    id += alphabet.charAt(byte % alphabet.length);
  }

  return id;
}
