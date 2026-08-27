import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createInventoryProduct, deleteInventoryProduct, getAllOrders, getInventoryStockOverview, getUserCart, getUserOrders, getUserWishlist, listInventory, mergeUserCommerce, replaceUserCart, replaceUserWishlist, seedInventoryIfEmpty, updateInventoryProduct, updateOrderFulfillmentStatus } from "./db";
import { createCheckoutSession } from "./stripe";

const productImageSchema = z.string().refine((value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return value.startsWith("/manus-storage/");
  }
}, "Product image must be a hosted image URL or PRIME CART asset path");

const productSnapshotSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(96),
  price: z.number().int().nonnegative(),
  originalPrice: z.number().int().nonnegative(),
  offer: z.string().min(1).max(64),
  delivery: z.string().min(1).max(128),
  image: productImageSchema,
  tone: z.string().min(1).max(64),
  popularity: z.number().int().nonnegative(),
  badge: z.string().max(64).nullable().optional(),
});

const cartSnapshotSchema = productSnapshotSchema.extend({ quantity: z.number().int().min(1).max(99) });

const inventoryProductSchema = z.object({
  brand: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(96),
  price: z.number().int().nonnegative(),
  originalPrice: z.number().int().nonnegative(),
  offer: z.string().trim().min(1).max(64),
  delivery: z.string().trim().min(1).max(128),
  image: productImageSchema,
  imageSourceUrl: z.string().url().nullable().optional(),
  tone: z.string().trim().min(1).max(64),
  popularity: z.number().int().nonnegative(),
  badge: z.string().trim().max(64).nullable().optional(),
  colors: z.array(z.string().trim().min(1).max(64)).max(12),
  specifications: z.array(z.object({ label: z.string().trim().min(1).max(64), value: z.string().trim().min(1).max(255) })).max(16),
  stockQuantity: z.number().int().nonnegative().max(1_000_000),
  isActive: z.boolean(),
});

const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email().max(320),
  phone: z.string().trim().min(7).max(24),
  address: z.string().trim().min(5).max(255),
  apartment: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().min(4).max(16),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  commerce: router({
    get: protectedProcedure.query(async ({ ctx }) => ({
      cart: await getUserCart(ctx.user.id),
      wishlist: await getUserWishlist(ctx.user.id),
    })),
    sync: protectedProcedure.input(z.object({ cart: z.array(cartSnapshotSchema).max(100), wishlist: z.array(productSnapshotSchema).max(100) })).mutation(async ({ ctx, input }) =>
      mergeUserCommerce(ctx.user.id, input.cart, input.wishlist),
    ),
    setCart: protectedProcedure.input(z.object({ items: z.array(cartSnapshotSchema).max(100) })).mutation(async ({ ctx, input }) =>
      replaceUserCart(ctx.user.id, input.items),
    ),
    setWishlist: protectedProcedure.input(z.object({ items: z.array(productSnapshotSchema).max(100) })).mutation(async ({ ctx, input }) =>
      replaceUserWishlist(ctx.user.id, input.items),
    ),
  }),
  inventory: router({
    listPublic: publicProcedure.query(async () => {
      await seedInventoryIfEmpty();
      return listInventory(false);
    }),
    listAdmin: adminProcedure.query(async () => {
      await seedInventoryIfEmpty();
      return listInventory(true);
    }),
    stockOverview: adminProcedure.query(async () => {
      await seedInventoryIfEmpty();
      return getInventoryStockOverview();
    }),
    create: adminProcedure.input(inventoryProductSchema).mutation(({ input }) => createInventoryProduct(input)),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), product: inventoryProductSchema })).mutation(({ input }) => updateInventoryProduct(input.id, input.product)),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteInventoryProduct(input.id)),
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => getUserOrders(ctx.user.id)),
    all: adminProcedure.query(() => getAllOrders()),
    updateFulfillment: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["shipped", "delivered"]) })).mutation(({ input }) => updateOrderFulfillmentStatus(input.id, input.status)),
  }),
  payments: router({
    createCheckout: protectedProcedure.input(z.object({ shipping: shippingSchema })).mutation(async ({ ctx, input }) => {
      const origin = ctx.req.headers.origin;
      if (!origin) throw new Error("Missing checkout origin");
      return createCheckoutSession(ctx.user, origin, input.shipping);
    }),
  }),
});

export type AppRouter = typeof appRouter;
