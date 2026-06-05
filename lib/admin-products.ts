type ProductPayload = Record<string, string | number | boolean | string[] | null>;

interface ParseOptions {
  partial?: boolean;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseProductPayload(
  body: Record<string, unknown>,
  options: ParseOptions = {}
) {
  const partial = Boolean(options.partial);
  const payload: ProductPayload = {};

  if (!partial || body.name !== undefined) {
    const name = readString(body.name);
    if (!name) return { error: "Product name is required" };
    payload.name = name;
  }

  if (!partial || body.slug !== undefined || body.name !== undefined) {
    const slug = readString(body.slug) || (payload.name ? slugify(String(payload.name)) : "");
    if (!slug) return { error: "Product slug is required" };
    payload.slug = slugify(slug);
  }

  if (!partial || body.category !== undefined) {
    const category = readString(body.category);
    if (!category) return { error: "Category is required" };
    payload.category = category;
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: "Valid price is required" };
    }
    payload.price = price;
  }

  if (!partial || body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return { error: "Valid stock is required" };
    }
    payload.stock = stock;
  }

  if (!partial || body.compare_at_price !== undefined) {
    const compareAtPrice = body.compare_at_price === "" || body.compare_at_price === null
      ? null
      : Number(body.compare_at_price);
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      return { error: "Compare at price must be a positive number" };
    }
    payload.compare_at_price = compareAtPrice;
  }

  if (!partial || body.brand !== undefined) {
    payload.brand = readString(body.brand) || null;
  }
  if (!partial || body.description !== undefined) {
    payload.description = readString(body.description) || null;
  }
  if (!partial || body.badge !== undefined) {
    payload.badge = readString(body.badge) || null;
  }
  if (!partial || body.images !== undefined) {
    payload.images = readStringList(body.images);
  }
  if (!partial || body.features !== undefined) {
    payload.features = readStringList(body.features);
  }
  if (body.is_active !== undefined) {
    payload.is_active = Boolean(body.is_active);
  } else if (!partial) {
    payload.is_active = true;
  }

  if (partial && Object.keys(payload).length === 0) {
    return { error: "No product fields were provided" };
  }

  return { payload };
}
