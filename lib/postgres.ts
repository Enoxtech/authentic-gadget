import { Pool, types, type QueryResultRow } from "pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

types.setTypeParser(1700, (value) => Number(value));

const TABLES = new Set([
  "admin_users",
  "audit_log",
  "banners",
  "campaigns",
  "categories",
  "coupons",
  "customers",
  "delivery_areas",
  "newsletter_subscribers",
  "order_items",
  "orders",
  "products",
  "reviews",
  "settings",
  "support_messages",
  "wishlists",
]);

let pool: Pool | null = null;

function shouldUseSsl(value: string) {
  return !value.includes("localhost") &&
    !value.includes("127.0.0.1") &&
    !value.includes(".railway.internal");
}

function normalizeConnectionString(value: string) {
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

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  pool = new Pool({
    connectionString: normalizeConnectionString(connectionString),
    max: 10,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

function identifier(value: string) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Invalid database identifier: ${value}`);
  }
  return `"${value}"`;
}

function splitSelection(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (value[index] === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

type Filter =
  | { kind: "eq" | "ilike"; column: string; value: unknown }
  | { kind: "in"; column: string; value: unknown[] };

type Result<T = unknown> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count: number | null;
};

class PostgresQueryBuilder implements PromiseLike<Result> {
  private operation: "select" | "insert" | "upsert" | "update" | "delete" = "select";
  private selection = "*";
  private values: Record<string, unknown>[] = [];
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private rowLimit: number | null = null;
  private singleMode: "single" | "maybe" | null = null;
  private countMode = false;
  private headMode = false;
  private conflictColumns: string[] = [];

  constructor(private readonly table: string) {
    if (!TABLES.has(table)) throw new Error(`Unsupported table: ${table}`);
  }

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.selection = columns;
    this.countMode = options?.count === "exact";
    this.headMode = options?.head === true;
    return this;
  }

  insert(value: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.values = Array.isArray(value) ? value : [value];
    return this;
  }

  upsert(
    value: Record<string, unknown> | Record<string, unknown>[],
    options?: { onConflict?: string }
  ) {
    this.operation = "upsert";
    this.values = Array.isArray(value) ? value : [value];
    this.conflictColumns = (options?.onConflict || "")
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);
    return this;
  }

  update(value: Record<string, unknown>) {
    this.operation = "update";
    this.values = [value];
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ kind: "eq", column, value });
    return this;
  }

  ilike(column: string, value: unknown) {
    this.filters.push({ kind: "ilike", column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ kind: "in", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(value: number) {
    this.rowLimit = Math.max(0, Math.floor(value));
    return this;
  }

  single() {
    this.singleMode = "single";
    this.rowLimit = 1;
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybe";
    this.rowLimit = 1;
    return this;
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private buildWhere(parameters: unknown[]) {
    if (this.filters.length === 0) return "";
    const clauses = this.filters.map((filter) => {
      const column = identifier(filter.column);
      if (filter.kind === "in") {
        if (filter.value.length === 0) return "FALSE";
        const placeholders = filter.value.map((value) => {
          parameters.push(value);
          return `$${parameters.length}`;
        });
        return `${column} IN (${placeholders.join(", ")})`;
      }
      parameters.push(filter.value);
      return `${column} ${filter.kind === "ilike" ? "ILIKE" : "="} $${parameters.length}`;
    });
    return ` WHERE ${clauses.join(" AND ")}`;
  }

  private buildSelection() {
    const parts = splitSelection(this.selection);
    const scalar = parts.filter((part) => !part.includes("("));
    const relation = parts.find((part) => part.startsWith("products("));
    const base = scalar.length === 0 || scalar.includes("*")
      ? "t.*"
      : scalar.map((column) => `t.${identifier(column)}`).join(", ");

    if (!relation) return { columns: base, join: "" };
    if (this.table !== "wishlists" && this.table !== "order_items" && this.table !== "reviews") {
      throw new Error(`Unsupported relation selection on ${this.table}`);
    }

    const relationColumns = relation
      .slice("products(".length, -1)
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);
    const pairs = relationColumns
      .map((column) => `'${column}', p.${identifier(column)}`)
      .join(", ");
    const columns = `${base}, CASE WHEN p.id IS NULL THEN NULL ELSE json_build_object(${pairs}) END AS products`;
    return { columns, join: " LEFT JOIN products p ON p.id = t.product_id" };
  }

  private returningClause() {
    if (this.selection === "*") return " RETURNING *";
    const columns = splitSelection(this.selection)
      .filter((part) => !part.includes("("))
      .map(identifier);
    return columns.length > 0 ? ` RETURNING ${columns.join(", ")}` : "";
  }

  private async execute(): Promise<Result> {
    try {
      const parameters: unknown[] = [];
      const table = identifier(this.table);
      let sql = "";

      if (this.operation === "select") {
        if (this.countMode && this.headMode) {
          sql = `SELECT count(*)::int AS count FROM ${table}${this.buildWhere(parameters)}`;
        } else {
          const selection = this.buildSelection();
          sql = `SELECT ${selection.columns} FROM ${table} t${selection.join}${this.buildWhere(parameters)}`;
          if (this.orderBy) {
            sql += ` ORDER BY t.${identifier(this.orderBy.column)} ${this.orderBy.ascending ? "ASC" : "DESC"}`;
          }
          if (this.rowLimit !== null) sql += ` LIMIT ${this.rowLimit}`;
        }
      } else if (this.operation === "insert" || this.operation === "upsert") {
        if (this.values.length === 0) throw new Error("No values provided");
        const columns = Object.keys(this.values[0]);
        const rows = this.values.map((row) => {
          const placeholders = columns.map((column) => {
            parameters.push(row[column]);
            return `$${parameters.length}`;
          });
          return `(${placeholders.join(", ")})`;
        });
        sql = `INSERT INTO ${table} (${columns.map(identifier).join(", ")}) VALUES ${rows.join(", ")}`;
        if (this.operation === "upsert" && this.conflictColumns.length > 0) {
          const conflict = this.conflictColumns.map(identifier).join(", ");
          const updates = columns
            .filter((column) => !this.conflictColumns.includes(column))
            .map((column) => `${identifier(column)} = EXCLUDED.${identifier(column)}`)
            .join(", ");
          sql += ` ON CONFLICT (${conflict}) ${updates ? `DO UPDATE SET ${updates}` : "DO NOTHING"}`;
        }
        sql += this.returningClause();
      } else if (this.operation === "update") {
        const value = this.values[0] || {};
        const assignments = Object.entries(value).map(([column, entry]) => {
          parameters.push(entry);
          return `${identifier(column)} = $${parameters.length}`;
        });
        if (assignments.length === 0) throw new Error("No update values provided");
        sql = `UPDATE ${table} SET ${assignments.join(", ")}${this.buildWhere(parameters)}${this.returningClause()}`;
      } else {
        sql = `DELETE FROM ${table}${this.buildWhere(parameters)}${this.selection !== "*" ? this.returningClause() : ""}`;
      }

      const result = await getPool().query<QueryResultRow>(sql, parameters);
      if (this.countMode && this.headMode) {
        return { data: null, error: null, count: Number(result.rows[0]?.count || 0) };
      }

      let data: unknown = result.rows;
      if (this.singleMode) {
        if (result.rows.length === 0) {
          if (this.singleMode === "maybe") return { data: null, error: null, count: null };
          return { data: null, error: { message: "Row not found", code: "PGRST116" }, count: null };
        }
        data = result.rows[0];
      }
      return { data, error: null, count: this.countMode ? result.rowCount : null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database query failed";
      return { data: null, error: { message }, count: null };
    }
  }
}

export function createPostgresDataClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase Auth is not configured");
  }
  const authClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    auth: authClient.auth,
    from(table: string) {
      return new PostgresQueryBuilder(table);
    },
  };
}

export async function queryPostgres<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}
