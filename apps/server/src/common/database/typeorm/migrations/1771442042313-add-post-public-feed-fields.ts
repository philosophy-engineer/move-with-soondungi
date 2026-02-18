import { MigrationInterface, QueryRunner } from "typeorm";

type PostBackfillRow = {
  id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  thumbnailUrl: string | null;
  contentHtml: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

const IMAGE_SRC_REGEX = /<img[^>]+src=["']([^"']+)["'][^>]*>/iu;
const HTML_TAG_REGEX = /<[^>]*>/gu;
const WHITESPACE_REGEX = /\s+/gu;
const DIACRITIC_REGEX = /[\u0300-\u036f]/gu;

export class AddPostPublicFeedFields1771442042313 implements MigrationInterface {
  name = "AddPostPublicFeedFields1771442042313";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "slug" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "summary" text`);
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "thumbnail_url" text`);

    const reservedRows = (await queryRunner.query(
      `
        SELECT "slug"
        FROM "posts"
        WHERE "slug" IS NOT NULL
          AND ("status" <> 'PUBLISHED' OR "deleted_at" IS NOT NULL)
      `,
    )) as Array<{ slug: string }>;

    const usedSlugs = new Set<string>(reservedRows.map((row) => normalizeSlug(row.slug)));

    const rows = (await queryRunner.query(
      `
        SELECT
          "id",
          "title",
          "slug",
          "summary",
          "thumbnail_url" AS "thumbnailUrl",
          "content_html" AS "contentHtml",
          "created_at" AS "createdAt",
          "updated_at" AS "updatedAt",
          "published_at" AS "publishedAt"
        FROM "posts"
        WHERE "status" = 'PUBLISHED'
          AND "deleted_at" IS NULL
        ORDER BY "published_at" ASC NULLS LAST, "id" ASC
      `,
    )) as PostBackfillRow[];

    for (const row of rows) {
      const preferredSlug = row.slug?.trim() ? normalizeSlug(row.slug) : slugifyTitle(row.title);
      const slug = resolveUniqueSlug(preferredSlug || "post", usedSlugs);
      const summary = row.summary?.trim() || extractSummaryFromHtml(row.contentHtml, row.title);
      const thumbnailUrl = row.thumbnailUrl?.trim() || extractThumbnailUrlFromHtml(row.contentHtml);
      const publishedAt = row.publishedAt ?? row.updatedAt ?? row.createdAt;

      await queryRunner.query(
        `
          UPDATE "posts"
          SET
            "slug" = $1,
            "summary" = $2,
            "thumbnail_url" = $3,
            "published_at" = $4
          WHERE "id" = $5
        `,
        [slug, summary, thumbnailUrl ?? null, publishedAt, row.id],
      );
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_posts_slug" ON "posts" ("slug") WHERE "slug" IS NOT NULL AND "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_posts_public_feed" ON "posts" ("published_at" DESC, "id" DESC) WHERE "status" = 'PUBLISHED' AND "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_posts_public_feed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_posts_slug"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "thumbnail_url"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "summary"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "slug"`);
  }
}

function extractThumbnailUrlFromHtml(contentHtml: string): string | undefined {
  const matched = IMAGE_SRC_REGEX.exec(contentHtml);
  const src = matched?.[1]?.trim();
  return src ? src : undefined;
}

function extractSummaryFromHtml(contentHtml: string, fallbackTitle: string): string {
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

function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(DIACRITIC_REGEX, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .replace(/-{2,}/gu, "-");

  return slug || "post";
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .replace(/-{2,}/gu, "-");
}

function resolveUniqueSlug(baseSlug: string, usedSlugs: Set<string>): string {
  const normalizedBase = baseSlug || "post";

  if (!usedSlugs.has(normalizedBase)) {
    usedSlugs.add(normalizedBase);
    return normalizedBase;
  }

  let suffix = 2;
  while (true) {
    const candidate = `${normalizedBase}-${suffix}`;

    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate);
      return candidate;
    }

    suffix += 1;
  }
}
