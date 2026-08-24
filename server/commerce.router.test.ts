import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const commerceDb = vi.hoisted(() => ({
  getUserCart: vi.fn(async () => []),
  getUserWishlist: vi.fn(async () => []),
  mergeUserCommerce: vi.fn(async () => ({ cart: [], wishlist: [] })),
  replaceUserCart: vi.fn(async () => []),
  replaceUserWishlist: vi.fn(async () => []),
}));

vi.mock("./db", () => commerceDb);

import { appRouter } from "./routers";

const product = {
  productId: 7,
  name: "Quiet Grid Desk Mat",
  category: "Workspace",
  price: 799,
  originalPrice: 1299,
  offer: "38% off",
  delivery: "Free delivery",
  image: "https://example.com/desk-mat.jpg",
  tone: "bg-[#E9EEE8]",
  popularity: 89,
  badge: "Desk edit",
};

function customerContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "customer-42",
      name: "Prime Customer",
      email: "customer@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("commerce router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores a cart snapshot against the authenticated customer", async () => {
    const caller = appRouter.createCaller(customerContext());
    await caller.commerce.setCart({ items: [{ ...product, quantity: 2 }] });
    expect(commerceDb.replaceUserCart).toHaveBeenCalledWith(42, [{ ...product, quantity: 2 }]);
  });

  it("merges guest shopping state into the authenticated account", async () => {
    const caller = appRouter.createCaller(customerContext());
    await caller.commerce.sync({ cart: [{ ...product, quantity: 1 }], wishlist: [product] });
    expect(commerceDb.mergeUserCommerce).toHaveBeenCalledWith(42, [{ ...product, quantity: 1 }], [product]);
  });
});
