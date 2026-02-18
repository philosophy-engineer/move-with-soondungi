import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1771438232572 implements MigrationInterface {
  name = "Auto1771438232572";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."post_status" AS ENUM('DRAFT', 'PUBLISHED')`);
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "content_html" text NOT NULL, "content_json" jsonb NOT NULL, "status" "public"."post_status" NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "upload_sessions" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "file_key" character varying(128) NOT NULL, "object_key" character varying(512) NOT NULL, "filename" character varying(255) NOT NULL, "mime_type" character varying(100) NOT NULL, "size" integer NOT NULL, "complete_token" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_4b6ca30b8bb2baa0de9c6bf8fea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4dd3c11e52ca06f6a4e1ca686e" ON "upload_sessions" ("complete_token") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c67a6fa99253aa8aeb1b72341b" ON "upload_sessions" ("file_key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "uploaded_images" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "file_key" character varying(128) NOT NULL, "object_key" character varying(512) NOT NULL, "mime_type" character varying(100) NOT NULL, CONSTRAINT "PK_37f0f1866d702a0ac47830c2858" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_20a485e3218a52bf3e0db82905" ON "uploaded_images" ("object_key") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1aed12330381eaba1228680d7b" ON "uploaded_images" ("file_key") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_1aed12330381eaba1228680d7b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_20a485e3218a52bf3e0db82905"`);
    await queryRunner.query(`DROP TABLE "uploaded_images"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c67a6fa99253aa8aeb1b72341b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4dd3c11e52ca06f6a4e1ca686e"`);
    await queryRunner.query(`DROP TABLE "upload_sessions"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."post_status"`);
  }
}
