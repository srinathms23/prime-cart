import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserCart, getUserWishlist, mergeUserCommerce, replaceUserCart, replaceUserWishlist } from "./db";
import { createCheckoutSession } from "./stripe";

const productSnapshotSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(96),
  price: z.number().int().nonnegative(),
  originalPrice: z.number().int().nonnegative(),
  offer: z.string().min(1).max(64),
  delivery: z.string().min(1).max(128),
  image: z.string().url(),
  tone: z.string().min(1).max(64),
  popularity: z.number().int().nonnegative(),
  badge: z.string().max(64).nullable().optional(),
});

const cartSnapshotSchema = productSnapshotSchema.extend({ quantity: z.number().int().min(1).max(99) });

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
  payments: router({
    createCheckout: protectedProcedure.input(z.object({ shipping: shippingSchema })).mutation(async ({ ctx, input }) => {
      const origin = ctx.req.headers.origin;
      if (!origin) throw new Error("Missing checkout origin");
      return createCheckoutSession(ctx.user, origin, input.shipping);
    }),
  }),
});

export type AppRouter = typeof appRouter;
