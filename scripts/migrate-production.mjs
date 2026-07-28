import { readdir, readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

function shouldUseSsl(value) {
  return !value.includes("localhost") &&
    !value.includes("127.0.0.1") &&
    !value.includes(".railway.internal");
}

function normalizeConnectionString(value) {
  try {
    const url = new URL(value);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslcert");
    url.searchParams.delete("sslkey");
    url.searchParams.delete("sslrootcert");
    return url.toString();
  } catch {
    return value;
  }
}

async function readSchemaFiles() {
  const schemaDir = new URL("../railway/", import.meta.url);
  const files = await readdir(schemaDir);
  const orderedFiles = [
    "schema.sql",
    ...files.filter((file) => /^\d+_.+\.sql$/.test(file)).sort(),
  ];

  const uniqueFiles = [...new Set(orderedFiles)];
  const chunks = await Promise.all(
    uniqueFiles.map(async (file) => {
      const sql = await readFile(new URL(file, schemaDir), "utf8");
      return `-- ${file}\n${sql}`;
    })
  );

  return chunks.join("\n\n");
}

const pool = new Pool({
  connectionString: normalizeConnectionString(connectionString),
  ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
  max: 1,
});

try {
  const schema = await readSchemaFiles();
  await pool.query(schema);
  console.log("Database schema is up to date.");
} finally {
  await pool.end();
}
