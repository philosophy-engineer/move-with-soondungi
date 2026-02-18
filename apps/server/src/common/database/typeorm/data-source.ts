import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DataSource } from "typeorm";

import { validateEnv } from "../../config/env.schema.js";
import { createTypeOrmDataSourceOptions } from "./typeorm.config.js";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/u);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function loadAndValidateEnv() {
  const cwd = process.cwd();

  // .env -> .env.local 순으로 로딩하여 .env.local이 최종 override
  loadEnvFile(path.join(cwd, ".env"));
  loadEnvFile(path.join(cwd, ".env.local"));

  return validateEnv(process.env as Record<string, unknown>);
}

const env = loadAndValidateEnv();
const currentFileExtension = path.extname(fileURLToPath(import.meta.url));
const isTsNodeRuntime = currentFileExtension === ".ts";
const migrationsGlob = isTsNodeRuntime
  ? ["src/common/database/typeorm/migrations/*.ts"]
  : ["dist/common/database/typeorm/migrations/*.js"];

const AppDataSource = new DataSource({
  ...createTypeOrmDataSourceOptions(env),
  migrations: migrationsGlob,
});

export default AppDataSource;
