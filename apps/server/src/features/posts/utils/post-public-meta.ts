const IMAGE_SRC_REGEX = /<img[^>]+src=["']([^"']+)["'][^>]*>/iu;
const HTML_TAG_REGEX = /<[^>]*>/gu;
const WHITESPACE_REGEX = /\s+/gu;
const DIACRITIC_REGEX = /[\u0300-\u036f]/gu;

export function extractThumbnailUrlFromHtml(contentHtml: string): string | undefined {
  const matched = IMAGE_SRC_REGEX.exec(contentHtml);
  const src = matched?.[1]?.trim();

  return src ? src : undefined;
}

export function extractSummaryFromHtml(contentHtml: string, fallbackTitle: string): string {
  const withoutTags = contentHtml.replace(HTML_TAG_REGEX, " ");
  const normalized = withoutTags.replace(WHITESPACE_REGEX, " ").trim();

  if (!normalized) {
    return fallbackTitle;
  }

  const MAX_LENGTH = 160;
  if (normalized.length <= MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_LENGTH - 1).trimEnd()}…`;
}

export function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(DIACRITIC_REGEX, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .replace(/-{2,}/gu, "-");

  return slug || "post";
}

export function resolveUniqueSlug(baseSlug: string, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  let suffix = 2;
  while (true) {
    const candidate = `${baseSlug}-${suffix}`;

    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate);
      return candidate;
    }

    suffix += 1;
  }
}

export type PublicCursorPayload = {
  publishedAt: string;
  postId: string;
};

export function encodePublicCursor(cursor: PublicCursorPayload): string {
  const encoded = Buffer.from(JSON.stringify(cursor), "utf-8").toString("base64url");
  return encoded;
}

export function decodePublicCursor(rawCursor: string): PublicCursorPayload | undefined {
  try {
    const decoded = Buffer.from(rawCursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded) as Partial<PublicCursorPayload>;

    if (typeof parsed.publishedAt !== "string" || typeof parsed.postId !== "string") {
      return undefined;
    }

    if (Number.isNaN(Date.parse(parsed.publishedAt))) {
      return undefined;
    }

    return {
      publishedAt: parsed.publishedAt,
      postId: parsed.postId,
    };
  } catch {
    return undefined;
  }
}
