import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Stripe-owned customer profile reference; payment details remain in Stripe. */
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customer cart lines persist a product snapshot, so an account retains its
 * shopping choices even if the marketing catalogue later changes.
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 96 }).notNull(),
  price: int("price").notNull(),
  originalPrice: int("originalPrice").notNull(),
  offer: varchar("offer", { length: 64 }).notNull(),
  delivery: varchar("delivery", { length: 128 }).notNull(),
  image: text("image").notNull(),
  tone: varchar("tone", { length: 64 }).notNull(),
  popularity: int("popularity").notNull(),
  badge: varchar("badge", { length: 64 }),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("cart_item_user_product_unique").on(table.userId, table.productId)]);

/** A one-row-per-product saved list that follows the signed-in customer. */
export const wishlistItems = mysqlTable("wishlist_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 96 }).notNull(),
  price: int("price").notNull(),
  originalPrice: int("originalPrice").notNull(),
  offer: varchar("offer", { length: 64 }).notNull(),
  delivery: varchar("delivery", { length: 128 }).notNull(),
  image: text("image").notNull(),
  tone: varchar("tone", { length: 64 }).notNull(),
  popularity: int("popularity").notNull(),
  badge: varchar("badge", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("wishlist_item_user_product_unique").on(table.userId, table.productId)]);

export type CartItem = typeof cartItems.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;

/** Admin-managed catalogue records. Product details remain editable without rewriting cart snapshots. */
export const inventoryProducts = mysqlTable("inventory_products", {
  id: int("id").autoincrement().primaryKey(),
  brand: varchar("brand", { length: 120 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 96 }).notNull(),
  price: int("price").notNull(),
  originalPrice: int("originalPrice").notNull(),
  offer: varchar("offer", { length: 64 }).notNull(),
  delivery: varchar("delivery", { length: 128 }).notNull(),
  image: text("image").notNull(),
  imageSourceUrl: text("imageSourceUrl"),
  tone: varchar("tone", { length: 64 }).notNull(),
  popularity: int("popularity").notNull().default(0),
  badge: varchar("badge", { length: 64 }),
  colorsJson: text("colorsJson").notNull(),
  specificationsJson: text("specificationsJson").notNull(),
  stockQuantity: int("stockQuantity").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("inventory_product_name_unique").on(table.name)]);

/** Customer-facing order header. Card data is never stored in this application. */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 48 }).notNull(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).notNull().default("pending"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).notNull().default("pending"),
  subtotal: int("subtotal").notNull(),
  shipping: int("shipping").notNull().default(0),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  shippingJson: text("shippingJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("order_number_unique").on(table.orderNumber),
  uniqueIndex("order_stripe_session_unique").on(table.stripeSessionId),
]);

/** Immutable product snapshots allow historical orders to remain accurate after catalogue edits. */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 96 }).notNull(),
  image: text("image").notNull(),
  unitPrice: int("unitPrice").notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryProduct = typeof inventoryProducts.$inferSelect;
export type InsertInventoryProduct = typeof inventoryProducts.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
