import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes(".railway.internal")
    ? false
    : { rejectUnauthorized: false },
  max: 1,
});

try {
  const schema = await readFile(new URL("../railway/schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("Railway database schema is up to date.");
} finally {
  await pool.end();
}
