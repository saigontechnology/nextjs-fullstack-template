import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "./data/app.db";

// Ensure directory exists for SQLite file
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

mkdirSync(dirname(DATABASE_URL), { recursive: true });

const sqlite = new Database(DATABASE_URL);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
