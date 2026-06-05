import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DATABASE_URL = process.env.DATABASE_URL ?? "./data/app.db";
mkdirSync(dirname(DATABASE_URL), { recursive: true });

const sqlite = new Database(DATABASE_URL);
const db = drizzle(sqlite);

console.log("🚀 Running migrations...");
migrate(db, { migrationsFolder: "./drizzle" });
console.log("✅ Migrations complete!");
sqlite.close();
