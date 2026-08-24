import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { cartItems, InsertUser, users, wishlistItems } from "../drizzle/schema";
import { ENV } from './_core/env';

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

/** Merge guest browser storage into the account source of truth without dropping another device's items. */
export async function mergeUserCommerce(userId: number, localCart: CommerceCartSnapshot[], localWishlist: CommerceProductSnapshot[]) {
  const [serverCart, serverWishlist] = await Promise.all([getUserCart(userId), getUserWishlist(userId)]);
  const cartByProduct = new Map<number, CommerceCartSnapshot>(serverCart.map(({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge, quantity }) => [productId, { productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge, quantity }]));
  localCart.forEach((item) => {
    const existing = cartByProduct.get(item.productId);
    cartByProduct.set(item.productId, existing ? { ...item, quantity: Math.max(existing.quantity, item.quantity) } : item);
  });
  const wishlistByProduct = new Map<number, CommerceProductSnapshot>(serverWishlist.map(({ productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge }) => [productId, { productId, name, category, price, originalPrice, offer, delivery, image, tone, popularity, badge }]));
  localWishlist.forEach((item) => wishlistByProduct.set(item.productId, item));
  const [cart, wishlist] = await Promise.all([
    replaceUserCart(userId, Array.from(cartByProduct.values())),
    replaceUserWishlist(userId, Array.from(wishlistByProduct.values())),
  ]);
  return { cart, wishlist };
}
