import fs from "node:fs/promises";
import pg from "pg";

const [, , exportPath] = process.argv;
if (!exportPath) {
  throw new Error("Usage: node scripts/migrate-railway.mjs <export.json>");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function readSchemaFiles() {
  const schemaDir = new URL("../railway/", import.meta.url);
  const files = await fs.readdir(schemaDir);
  const orderedFiles = [
    "schema.sql",
    ...files.filter((file) => /^\d+_.+\.sql$/.test(file)).sort(),
  ];
  const uniqueFiles = [...new Set(orderedFiles)];
  const chunks = await Promise.all(
    uniqueFiles.map(async (file) => {
      const sql = await fs.readFile(new URL(file, schemaDir), "utf8");
      return `-- ${file}\n${sql}`;
    })
  );
  return chunks.join("\n\n");
}

const schema = await readSchemaFiles();
const exported = JSON.parse(await fs.readFile(exportPath, "utf8"));
const shouldUseSsl = !process.env.DATABASE_URL.includes("localhost") &&
  !process.env.DATABASE_URL.includes("127.0.0.1") &&
  !process.env.DATABASE_URL.includes(".railway.internal");

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

const database = new pg.Client({
  connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});

const order = [
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
];

const columnsByTable = {
  categories: ["id", "name", "slug", "icon", "description", "created_at"],
  products: ["id", "name", "slug", "brand", "category_id", "category", "price", "compare_at_price", "description", "features", "images", "stock", "rating", "reviews_count", "badge", "is_active", "created_at", "updated_at"],
  customers: ["id", "full_name", "email", "phone", "address", "city", "region", "created_at"],
  orders: ["id", "customer_id", "customer_name", "customer_email", "customer_phone", "shipping_address", "shipping_city", "shipping_region", "order_note", "subtotal", "shipping", "total", "payment_method", "payment_status", "order_status", "payment_reference", "created_at"],
  order_items: ["id", "order_id", "product_id", "product_name", "product_slug", "product_image", "price", "quantity", "created_at"],
  reviews: ["id", "product_id", "customer_id", "customer_name", "rating", "comment", "created_at"],
  wishlists: ["id", "user_id", "product_id", "created_at"],
  newsletter_subscribers: ["id", "email", "status", "subscribed_at", "created_at"],
  support_messages: ["id", "name", "email", "phone", "subject", "message", "status", "created_at"],
  banners: ["id", "image", "headline", "subtitle", "price_label", "badge", "cta_label", "cta_href", "accent_color", "align", "transition", "placement", "enabled", "sort_order", "created_at", "updated_at"],
};

function normalize(table, source) {
  const row = { ...source };
  if (table === "products" && row.review_count !== undefined && row.reviews_count === undefined) {
    row.reviews_count = row.review_count;
  }
  if (table === "orders") {
    row.customer_id ??= row.user_id;
    row.customer_name ??= row.delivery_name;
    row.customer_phone ??= row.delivery_phone;
    row.shipping_address ??= row.delivery_address;
    row.shipping_city ??= row.delivery_city;
    row.shipping_region ??= row.delivery_region;
    row.order_note ??= row.delivery_note;
    row.order_status ??= row.status;
    row.payment_reference ??= row.paystack_reference;
  }
  if (table === "reviews") row.customer_id ??= row.user_id;
  return Object.fromEntries(
    columnsByTable[table]
      .filter((column) => row[column] !== undefined)
      .map((column) => [column, row[column]])
  );
}

function identifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Invalid identifier: ${value}`);
  return `"${value}"`;
}

await database.connect();
try {
  await database.query("BEGIN");
  await database.query(schema);

  for (const table of order) {
    const rows = exported.tables?.[table] || [];
    for (const source of rows) {
      const row = normalize(table, source);
      const columns = Object.keys(row);
      if (columns.length === 0) continue;
      const values = columns.map((column) => row[column]);
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const updates = columns
        .filter((column) => column !== "id")
        .map((column) => `${identifier(column)} = EXCLUDED.${identifier(column)}`)
        .join(", ");
      await database.query(
        `INSERT INTO ${identifier(table)} (${columns.map(identifier).join(", ")}) ` +
          `VALUES (${placeholders.join(", ")}) ON CONFLICT (id) DO UPDATE SET ${updates}`,
        values
      );
    }
    console.log(`${table}: ${rows.length}`);
  }

  await database.query("COMMIT");
} catch (error) {
  await database.query("ROLLBACK");
  throw error;
} finally {
  await database.end();
}
