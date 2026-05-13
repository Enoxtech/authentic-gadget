import { createClient } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  features: string[] | null;
  images: string[] | null;
  stock: number;
  rating: number;
  reviews_count: number;
  badge: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  order_note: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  payment_reference: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  price: number;
  quantity: number;
}

// ---- Products ----

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching product by slug:", error);
    }
    return null;
  }
  return data as Product;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .ilike("name", `%${query}%`);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }
  return (data as Product[]) || [];
}

// ---- Categories ----

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return (data as Category[]) || [];
}

// ---- Orders ----

export async function createOrder(order: {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_region: string;
  order_note?: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    product_slug?: string;
    product_image?: string;
    price: number;
    quantity: number;
  }>;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Insert order
  const { error: orderError } = await supabase.from("orders").insert({
    id: order.id,
    customer_id: order.customer_id || null,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
    shipping_region: order.shipping_region,
    order_note: order.order_note || null,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    payment_method: order.payment_method,
    payment_status: "pending",
    order_status: "pending",
  });

  if (orderError) {
    console.error("Error creating order:", orderError);
    return { success: false, error: orderError.message };
  }

  // Insert order items
  const itemsWithOrderId = order.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id || null,
    product_name: item.product_name,
    product_slug: item.product_slug || null,
    product_image: item.product_image || null,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    return { success: false, error: itemsError.message };
  }

  return { success: true };
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return (data as Order[]) || [];
}

export async function getOrderById(orderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) {
    console.error("Error fetching order:", orderError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("Error fetching order items:", itemsError);
  }

  return {
    ...(order as Order),
    items: (items as OrderItem[]) || [],
  };
}

export async function updateOrderStatus(
  orderId: string,
  updates: { payment_status?: string; order_status?: string; payment_reference?: string }
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      ...updates,
      order_status: updates.order_status,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order:", error);
    return false;
  }
  return true;
}

// ---- Customers ----

export async function createOrUpdateCustomer(
  userId: string,
  data: { full_name?: string; email?: string; phone?: string }
): Promise<boolean> {
  const supabase = createClient();

  // Check if customer already exists
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) {
    // Update
    const { error } = await supabase
      .from("customers")
      .update(data)
      .eq("id", userId);
    return !error;
  } else {
    // Insert
    const { error } = await supabase.from("customers").insert({
      id: userId,
      ...data,
    });
    return !error;
  }
}