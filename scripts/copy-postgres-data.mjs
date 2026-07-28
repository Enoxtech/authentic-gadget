import { readdir, readFile } from "node:fs/promises";
import { Client } from "pg";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl) {
  throw new Error("SOURCE_DATABASE_URL is required");
}

if (!targetUrl) {
  throw new Error("DATABASE_URL is required");
}

if (sourceUrl === targetUrl) {
  throw new Error("SOURCE_DATABASE_URL and DATABASE_URL must point to different databases");
}

const tables = [
  "auth_users",
  "auth_accounts",
  "auth_sessions",
  "auth_verifications",
  "auth_rate_limits",
  "admin_users",
  "categories",
  "products",
  "customers",
  "orders",
  "order_items",
  "reviews",
  "wishlists",
  "newsletter_subscribers",
  "support_messages",
  "banners",
  "coupons",
  "delivery_areas",
  "settings",
  "campaigns",
  "audit_log",
];

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

function identifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Invalid database identifier: ${value}`);
  }
  return `"${value}"`;
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

function createClient(connectionString) {
  return new Client({
    connectionString: normalizeConnectionString(connectionString),
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
  });
}

async function tableExists(client, table) {
  const result = await client.query(
    `SELECT to_regclass($1) AS table_name`,
    [`public.${table}`]
  );
  return Boolean(result.rows[0]?.table_name);
}

async function copyTable(source, target, table) {
  if (!(await tableExists(source, table))) {
    console.log(`${table}: skipped`);
    return;
  }

  const { rows } = await source.query(`SELECT * FROM ${identifier(table)}`);
  if (rows.length === 0) {
    console.log(`${table}: 0`);
    return;
  }

  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map((column) => row[column]);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const updateColumns = columns.filter((column) => column !== "id");
    const updates = updateColumns
      .map((column) => `${identifier(column)} = EXCLUDED.${identifier(column)}`)
      .join(", ");

    await target.query(
      `INSERT INTO ${identifier(table)} (${columns.map(identifier).join(", ")})
       VALUES (${placeholders.join(", ")})
       ON CONFLICT (id) DO ${updates ? `UPDATE SET ${updates}` : "NOTHING"}`,
      values
    );
  }

  console.log(`${table}: ${rows.length}`);
}

const source = createClient(sourceUrl);
const target = createClient(targetUrl);

await source.connect();
await target.connect();

try {
  await target.query(await readSchemaFiles());

  for (const table of tables) {
    await copyTable(source, target, table);
  }
} finally {
  await source.end();
  await target.end();
}
