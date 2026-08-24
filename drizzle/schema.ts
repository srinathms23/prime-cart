import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
