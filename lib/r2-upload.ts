import { createHash, createHmac, randomBytes } from "node:crypto";

const REGION = "auto";
const SERVICE = "s3";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const ALLOWED_FOLDERS: Record<string, string> = {
  products: "products/admin-uploads",
  banners: "banners/admin-uploads",
};

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function getSigningKey(secret: string, date: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function amzDate(now = new Date()) {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    long: iso,
    short: iso.slice(0, 8),
  };
}

function encodeObjectKey(key: string) {
  return key.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function validateImageUpload(file: File) {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return { error: "Only JPG, PNG, WEBP, and GIF images are allowed" };
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be smaller than 8MB" };
  }
  return { extension };
}

export function buildR2ObjectKey(folder: string, extension: string) {
  const prefix = ALLOWED_FOLDERS[folder] || ALLOWED_FOLDERS.products;
  return `${prefix}/${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
}

export function publicR2UrlForKey(key: string) {
  return `${requiredEnv("CLOUDFLARE_R2_PUBLIC_URL").replace(/\/+$/, "")}/${key}`;
}

export async function uploadToR2(input: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const endpoint = requiredEnv("CLOUDFLARE_R2_ENDPOINT").replace(/\/+$/, "");
  const bucket = requiredEnv("CLOUDFLARE_R2_BUCKET");
  const accessKeyId = requiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY");

  const url = new URL(`${endpoint}/${bucket}/${encodeObjectKey(input.key)}`);
  const host = url.host;
  const payloadHash = sha256(input.body);
  const date = amzDate();
  const canonicalUri = url.pathname;
  const canonicalQuery = "";
  const headers: Record<string, string> = {
    "cache-control": "public, max-age=31536000, immutable",
    "content-type": input.contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": date.long,
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("");
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${date.short}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date.long,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");
  const signature = createHmac("sha256", getSigningKey(secretAccessKey, date.short))
    .update(stringToSign)
    .digest("hex");
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const body = input.body.buffer.slice(
    input.body.byteOffset,
    input.body.byteOffset + input.body.byteLength
  ) as ArrayBuffer;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Cache-Control": headers["cache-control"],
      "Content-Type": headers["content-type"],
      "X-Amz-Content-Sha256": payloadHash,
      "X-Amz-Date": date.long,
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Cloudflare R2 upload failed (${response.status}): ${message}`);
  }
}
