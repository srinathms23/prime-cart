import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { cartItems, InsertInventoryProduct, InsertUser, inventoryProducts, orderItems, orders, users, wishlistItems } from "../drizzle/schema";
import { ENV } from './_core/env';
import { electronicsProducts } from "../client/src/lib/electronics-catalogue";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function setUserStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
}

export type CommerceProductSnapshot = {
  productId: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  offer: string;
  delivery: string;
  image: string;
  tone: string;
  popularity: number;
  badge?: string | null;
};

export type CommerceCartSnapshot = CommerceProductSnapshot & { quantity: number };

export async function getUserCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.updatedAt));
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.updatedAt));
}

export async function replaceUserCart(userId: number, items: CommerceCartSnapshot[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  if (items.length) {
    await db.insert(cartItems).values(items.map((item) => ({ ...item, userId, badge: item.badge ?? null, quantity: Math.max(1, item.quantity) })));
  }
  return getUserCart(userId);
}

export async function replaceUserWishlist(userId: number, items: CommerceProductSnapshot[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
  if (items.length) {
    await db.insert(wishlistItems).values(items.map((item) => ({ ...item, userId, badge: item.badge ?? null })));
  }
  return getUserWishlist(userId);
}

export function mergeCommerceSnapshots(
  serverCart: CommerceCartSnapshot[],
  serverWishlist: CommerceProductSnapshot[],
  localCart: CommerceCartSnapshot[],
  localWishlist: CommerceProductSnapshot[],
) {
  const cartByProduct = new Map<number, CommerceCartSnapshot>(serverCart.map((item) => [item.productId, item]));
  localCart.forEach((item) => {
    const existing = cartByProduct.get(item.productId);
    cartByProduct.set(item.productId, existing ? { ...existing, quantity: Math.max(existing.quantity, item.quantity) } : item);
  });

  const wishlistByProduct = new Map<number, CommerceProductSnapshot>(serverWishlist.map((item) => [item.productId, item]));
  localWishlist.forEach((item) => {
    if (!wishlistByProduct.has(item.productId)) wishlistByProduct.set(item.productId, item);
  });

  return { cart: Array.from(cartByProduct.values()), wishlist: Array.from(wishlistByProduct.values()) };
}

/** Merge guest browser storage into the account source of truth without dropping another device's items. */
export async function mergeUserCommerce(userId: number, localCart: CommerceCartSnapshot[], localWishlist: CommerceProductSnapshot[]) {
  const [serverCart, serverWishlist] = await Promise.all([getUserCart(userId), getUserWishlist(userId)]);
  const normalizedServerCart = serverCart.map(({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge, quantity }) => ({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge, quantity }));
  const normalizedServerWishlist = serverWishlist.map(({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge }) => ({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge }));
  const merged = mergeCommerceSnapshots(normalizedServerCart, normalizedServerWishlist, localCart, localWishlist);
  const [cart, wishlist] = await Promise.all([
    replaceUserCart(userId, merged.cart),
    replaceUserWishlist(userId, merged.wishlist),
  ]);
  return { cart, wishlist };
}

export type ManagedInventoryInput = {
  brand: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  offer: string;
  delivery: string;
  image: string;
  imageSourceUrl?: string | null;
  tone: string;
  popularity: number;
  badge?: string | null;
  colors: string[];
  specifications: Array<{ label: string; value: string }>;
  stockQuantity: number;
  isActive: boolean;
};

type StoredInventoryProduct = Awaited<ReturnType<typeof listInventory>>[number];

function parseDetails<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function inventoryValues(input: ManagedInventoryInput): Omit<InsertInventoryProduct, "id"> {
  return {
    brand: input.brand,
    name: input.name,
    category: input.category,
    price: input.price,
    originalPrice: input.originalPrice,
    offer: input.offer,
    delivery: input.delivery,
    image: input.image,
    imageSourceUrl: input.imageSourceUrl ?? null,
    tone: input.tone,
    popularity: Math.max(0, input.popularity),
    badge: input.badge ?? null,
    colorsJson: JSON.stringify(input.colors),
    specificationsJson: JSON.stringify(input.specifications),
    stockQuantity: Math.max(0, input.stockQuantity),
    isActive: input.isActive,
  };
}

export function serializeInventoryProduct(product: Awaited<ReturnType<typeof getInventoryRecord>>) {
  if (!product) return undefined;
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    offer: product.offer,
    delivery: product.delivery,
    image: product.image,
    imageSourceUrl: product.imageSourceUrl,
    tone: product.tone,
    popularity: product.popularity,
    badge: product.badge,
    colors: parseDetails<string[]>(product.colorsJson, []),
    specifications: parseDetails<Array<{ label: string; value: string }>>(product.specificationsJson, []),
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function getInventoryRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [product] = await db.select().from(inventoryProducts).where(eq(inventoryProducts.id, id)).limit(1);
  return product;
}

export async function seedInventoryIfEmpty() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select({ id: inventoryProducts.id }).from(inventoryProducts).limit(1);
  if (existing.length) return;
  await db.insert(inventoryProducts).values(electronicsProducts.map((product) => ({
    id: product.id,
    ...inventoryValues({
      ...product,
      imageSourceUrl: null,
      stockQuantity: 0,
      isActive: true,
    }),
  })));
}

export async function listInventory(includeInactive = false) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const records = includeInactive
    ? await db.select().from(inventoryProducts).orderBy(desc(inventoryProducts.updatedAt))
    : await db.select().from(inventoryProducts).where(eq(inventoryProducts.isActive, true)).orderBy(desc(inventoryProducts.updatedAt));
  return records.map((product) => ({
    id: product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    offer: product.offer,
    delivery: product.delivery,
    image: product.image,
    imageSourceUrl: product.imageSourceUrl,
    tone: product.tone,
    popularity: product.popularity,
    badge: product.badge,
    colors: parseDetails<string[]>(product.colorsJson, []),
    specifications: parseDetails<Array<{ label: string; value: string }>>(product.specificationsJson, []),
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
}

export async function createInventoryProduct(input: ManagedInventoryInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(inventoryProducts).values(inventoryValues(input)).$returningId();
  return serializeInventoryProduct(await getInventoryRecord(result[0]!.id));
}

export async function updateInventoryProduct(id: number, input: ManagedInventoryInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(inventoryProducts).set(inventoryValues(input)).where(eq(inventoryProducts.id, id));
  return serializeInventoryProduct(await getInventoryRecord(id));
}

export async function deleteInventoryProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(inventoryProducts).where(eq(inventoryProducts.id, id));
  return { id };
}

export type OrderShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
};

export async function createOrderFromCart(userId: number, stripeSessionId: string, cart: Awaited<ReturnType<typeof getUserCart>>, shippingDetails: OrderShippingDetails) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const result = await db.insert(orders).values({
    orderNumber: `PC-${Date.now()}-${userId}`,
    userId,
    stripeSessionId,
    subtotal,
    shipping: 0,
    total: subtotal,
    shippingJson: JSON.stringify(shippingDetails),
  }).$returningId();
  const orderId = result[0]!.id;
  await db.insert(orderItems).values(cart.map((item) => ({
    orderId,
    productId: item.productId,
    name: item.name,
    category: item.category,
    image: item.image,
    unitPrice: item.price,
    quantity: item.quantity,
  })));
  return getOrderByStripeSession(stripeSessionId);
}

export async function getOrderByStripeSession(stripeSessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId)).limit(1);
  return order;
}

export function getOrderUpdateForStripeEvent(eventType: string) {
  if (eventType === "checkout.session.completed") {
    return { paymentStatus: "paid" as const, status: "processing" as const };
  }
  if (eventType === "checkout.session.expired" || eventType === "checkout.session.async_payment_failed") {
    return { paymentStatus: "failed" as const, status: "cancelled" as const };
  }
  return undefined;
}

export async function updateOrderForStripeEvent(stripeSessionId: string, eventType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const update = getOrderUpdateForStripeEvent(eventType);
  if (update) {
    await db.update(orders).set(update).where(eq(orders.stripeSessionId, stripeSessionId));
  }
  return getOrderByStripeSession(stripeSessionId);
}

function groupOrderRows(rows: Array<{ order: typeof orders.$inferSelect; item: typeof orderItems.$inferSelect | null }>) {
  const grouped = new Map<number, { order: typeof orders.$inferSelect; items: Array<typeof orderItems.$inferSelect> }>();
  rows.forEach(({ order, item }) => {
    const entry = grouped.get(order.id) ?? { order, items: [] };
    if (item) entry.items.push(item);
    grouped.set(order.id, entry);
  });
  return Array.from(grouped.values());
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select({ order: orders, item: orderItems }).from(orders).leftJoin(orderItems, eq(orderItems.orderId, orders.id)).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  return groupOrderRows(rows);
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select({ order: orders, item: orderItems }).from(orders).leftJoin(orderItems, eq(orderItems.orderId, orders.id)).orderBy(desc(orders.createdAt));
  return groupOrderRows(rows);
}
