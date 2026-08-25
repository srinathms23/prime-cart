import { describe, expect, it } from "vitest";
import { cartFingerprint, mergeCartItems, shouldHydrateRemoteCart } from "../client/src/lib/checkout-cart";
import type { CartItem } from "../client/src/lib/electronics-catalogue";

const product = (id: number, quantity: number, name = `Product ${id}`): CartItem => ({
  id,
  quantity,
  brand: "PRIME CART",
  name,
  category: "Home & Living",
  price: 1000,
  originalPrice: 1000,
  offer: "Transparent price",
  delivery: "Free delivery",
  image: "https://images.example.com/product.jpg",
  tone: "bg-stone-100",
  popularity: 10,
  colors: [],
  specifications: [],
  catalogueOrder: id,
});

describe("checkout cart hydration", () => {
  it("uses a stable, order-independent fingerprint to avoid rehydrating unchanged remote commerce data", () => {
    const remote = [product(2, 1), product(1, 3)];
    const fingerprint = cartFingerprint(remote);

    expect(fingerprint).toBe("1:3|2:1");
    expect(shouldHydrateRemoteCart(fingerprint, [product(1, 3), product(2, 1)])).toBe(false);
    expect(shouldHydrateRemoteCart(fingerprint, [product(1, 4), product(2, 1)])).toBe(true);
  });

  it("preserves a locally queued Buy Now item while retaining the authenticated remote cart", () => {
    const merged = mergeCartItems([product(9, 1, "Queued item")], [product(2, 2, "Remote item")]);

    expect(merged.map(({ id, quantity }) => ({ id, quantity }))).toEqual([{ id: 2, quantity: 2 }, { id: 9, quantity: 1 }]);
  });
});
