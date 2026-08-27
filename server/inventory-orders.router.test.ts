import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const store = vi.hoisted(() => ({
  getUserCart: vi.fn(async () => []),
  getUserWishlist: vi.fn(async () => []),
  mergeUserCommerce: vi.fn(async () => ({ cart: [], wishlist: [] })),
  replaceUserCart: vi.fn(async () => []),
  replaceUserWishlist: vi.fn(async () => []),
  seedInventoryIfEmpty: vi.fn(async () => undefined),
  listInventory: vi.fn(async () => []),
  createInventoryProduct: vi.fn(async (input) => ({ id: 999, ...input })),
  updateInventoryProduct: vi.fn(async (id, input) => ({ id, ...input })),
  deleteInventoryProduct: vi.fn(async (id) => ({ id })),
  getUserOrders: vi.fn(async () => []),
  getAllOrders: vi.fn(async () => []),
}));

vi.mock("./db", () => store);
import { appRouter } from "./routers";

function context(role: "admin" | "user", id = 42): TrpcContext {
  return {
    user: { id, openId: `user-${id}`, name: "Prime User", email: "user@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const product = {
  brand: "PRIME CART Studio", name: "Validation Bowl", category: "Home Decor", price: 1299, originalPrice: 1299,
  offer: "Transparent price", delivery: "Free delivery", image: "/manus-storage/home-decor-set_b71c2f7d.jpg",
  imageSourceUrl: "https://www.ikea.com/in/en/", tone: "bg-[#E8EEF1]", popularity: 0, badge: "Home Decor",
  colors: ["Cream"], specifications: [{ label: "Material", value: "Ceramic" }], stockQuantity: 5, isActive: true,
};

describe("inventory and orders routers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows an administrator to create managed inventory after seeding the catalogue", async () => {
    const caller = appRouter.createCaller(context("admin", 1));
    await caller.inventory.listAdmin();
    await caller.inventory.create(product);
    expect(store.seedInventoryIfEmpty).toHaveBeenCalledOnce();
    expect(store.listInventory).toHaveBeenCalledWith(true);
    expect(store.createInventoryProduct).toHaveBeenCalledWith(product);
  });

  it("rejects inventory controls for non-admin customers", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.inventory.create(product)).rejects.toThrow("required permission");
  });

  it("returns only the authenticated customer’s orders", async () => {
    const caller = appRouter.createCaller(context("user", 73));
    await caller.orders.mine();
    expect(store.getUserOrders).toHaveBeenCalledWith(73);
  });
});
