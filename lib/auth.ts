import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { Resend } from "resend";

const productionUrl = "https://authenticgad.com";
const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || productionUrl;
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://build:build@127.0.0.1:5432/build";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("railway.app") || databaseUrl.includes("rlwy.net")
      ? { rejectUnauthorized: false }
      : undefined,
  max: 10,
});

const resend = new Resend(process.env.RESEND_API_KEY || "re_build_placeholder");
const emailFrom =
  process.env.AUTH_EMAIL_FROM || "Authentic Gadget <noreply@authenticgad.com>";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  code?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const action =
    input.actionLabel && input.actionUrl
      ? `<p style="margin:28px 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">${escapeHtml(input.actionLabel)}</a></p>`
      : "";
  const code = input.code
    ? `<div style="margin:24px 0;padding:16px;background:#f4f6fa;border-radius:10px;font-size:28px;font-weight:800;letter-spacing:8px;text-align:center;color:#111827">${escapeHtml(input.code)}</div>`
    : "";

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: input.to,
    subject: input.subject,
    html: `
      <div style="background:#f4f6fa;padding:32px 16px;font-family:Arial,sans-serif;color:#111827">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
          <p style="margin:0 0 24px;color:#2563eb;font-size:18px;font-weight:800">Authentic Gadget</p>
          <h1 style="font-size:24px;margin:0 0 12px">${escapeHtml(input.heading)}</h1>
          <p style="font-size:15px;line-height:1.65;color:#4b5563;margin:0">${escapeHtml(input.body)}</p>
          ${code}
          ${action}
          <p style="font-size:12px;line-height:1.5;color:#9ca3af;margin:28px 0 0">If you did not request this email, you can safely ignore it.</p>
        </div>
      </div>`,
  });

  if (error) throw new Error(`Resend failed: ${error.message}`);
}

export const auth = betterAuth({
  appName: "Authentic Gadget",
  baseURL: baseUrl,
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "build-only-secret-not-used-by-the-railway-runtime",
  database: pool,
  trustedOrigins: [
    productionUrl,
    "https://www.authenticgad.com",
    "http://localhost:3000",
  ],
  advanced: {
    database: { generateId: "uuid" },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  user: {
    modelName: "auth_users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    modelName: "auth_sessions",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    modelName: "auth_accounts",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "auth_verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    modelName: "auth_rate_limits",
    fields: { lastRequest: "last_request" },
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 5 },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Authentic Gadget password",
        heading: "Reset your password",
        body: "Use the secure link below to choose a new password. The link expires in one hour.",
        actionLabel: "Reset password",
        actionUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Authentic Gadget account",
        heading: "Verify your email",
        body: "Confirm your email address to activate your Authentic Gadget account.",
        actionLabel: "Verify email",
        actionUrl: url,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "build-placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "build-placeholder",
    },
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      expiresIn: 600,
      storeOTP: "hashed",
      allowedAttempts: 5,
      rateLimit: { window: 60, max: 5 },
      sendVerificationOTP: async ({ email, otp, type }) => {
        const purpose = type === "sign-in" ? "sign in" : "verify your account";
        await sendEmail({
          to: email,
          subject: `Your Authentic Gadget ${purpose} code`,
          heading: "Your verification code",
          body: `Enter this code to ${purpose}. It expires in 10 minutes.`,
          code: otp,
        });
      },
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
