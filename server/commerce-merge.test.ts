import { describe, expect, it } from "vitest";
import { mergeCommerceSnapshots, type CommerceProductSnapshot } from "./db";

const verifiedProduct: CommerceProductSnapshot = {
  productId: 4,
  name: "Sony WH-1000XM5",
  category: "Audio",
  price: 29990,
  originalPrice: 34990,
  offer: "Listed price",
  delivery: "Free delivery",
  image: "/manus-storage/sony-wh-1000xm5_1ccdd96a.webp",
  tone: "bg-[#F6F0E7]",
  popularity: 75,
  badge: null,
};

describe("mergeCommerceSnapshots", () => {
  it("preserves verified server metadata while retaining the higher local quantity", () => {
    const staleLocalProduct = { ...verifiedProduct, image: "https://images.unsplash.com/legacy-placeholder", price: 13996, quantity: 4 };
    const result = mergeCommerceSnapshots(
      [{ ...verifiedProduct, quantity: 2 }],
      [verifiedProduct],
      [staleLocalProduct],
      [staleLocalProduct],
    );

    expect(result.cart).toEqual([{ ...verifiedProduct, quantity: 4 }]);
    expect(result.wishlist).toEqual([verifiedProduct]);
  });
});
