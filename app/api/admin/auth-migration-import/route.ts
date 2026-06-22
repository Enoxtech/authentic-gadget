import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { requireAdmin } from "@/lib/admin-api";

type LegacyUser = {
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  emailVerified?: unknown;
  createdAt?: unknown;
};

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: "Railway database is unavailable" }, { status: 503 });
  }

  const body = (await request.json()) as { users?: LegacyUser[] };
  if (!Array.isArray(body.users) || body.users.length === 0 || body.users.length > 100) {
    return NextResponse.json({ error: "A valid users array is required" }, { status: 400 });
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes(".railway.internal")
      ? false
      : { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const imported: string[] = [];
    for (const candidate of body.users) {
      const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
      const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
      const phone = typeof candidate.phone === "string" ? candidate.phone.trim() : "";
      const createdAt =
        typeof candidate.createdAt === "string" && !Number.isNaN(Date.parse(candidate.createdAt))
          ? new Date(candidate.createdAt)
          : new Date();

      if (!email || !email.includes("@")) continue;

      await pool.query(
        `INSERT INTO auth_users
          (name, email, email_verified, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           email_verified = EXCLUDED.email_verified,
           phone = EXCLUDED.phone,
           updated_at = now()`,
        [name || email.split("@")[0], email, candidate.emailVerified === true, phone || null, createdAt]
      );
      imported.push(email);
    }

    return NextResponse.json({ imported, count: imported.length });
  } finally {
    await pool.end();
  }
}
