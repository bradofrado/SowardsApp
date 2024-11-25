import { MongoClient, Db } from "mongodb";
import { promises as fs } from "fs";
import * as path from "path";

const uri = process.env.DATABASE_URL || "";
const dbName = "sowardssuites";

export type MigrationScript = (db: Db) => Promise<string>;

async function getVersion(): Promise<string> {
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = await fs.readFile(packageJsonPath, "utf-8");
  const parsedPackageJson = JSON.parse(packageJson);
  return parsedPackageJson.version;
}

async function runMigrationScript(version: string, db: Db) {
  const migrationScriptPath = path.join(__dirname, version, "migrate.ts");
  const migrationModule = await import(migrationScriptPath);
  const runMigration = migrationModule.default as MigrationScript;

  if (typeof runMigration === "function") {
    console.log(await runMigration(db));
  }
}

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);
    const version = await getVersion();
    console.log(`Running migration for version: ${version}`);

    await runMigrationScript(version, db);

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await client.close();
    console.log("Disconnected from database");
  }
}

migrate().catch(console.error);
