import AppDataSource from "../common/database/typeorm/data-source.js";

async function runMigrations() {
  await AppDataSource.initialize();

  try {
    const migrations = await AppDataSource.runMigrations({ transaction: "all" });
    const names = migrations.map((migration) => migration.name);

    if (names.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    console.log(`Applied migrations (${names.length}): ${names.join(", ")}`);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigrations().catch((error) => {
  console.error("Failed to run migrations.");
  console.error(error);
  process.exit(1);
});
