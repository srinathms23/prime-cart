import { describe, expect, it } from "vitest";
import { electronicsProducts, toProductSnapshot } from "../client/src/lib/electronics-catalogue";

describe("expanded marketplace catalogue", () => {
  it("contains the 30 supplied technology and home products across all marketplace categories", () => {
    expect(electronicsProducts).toHaveLength(30);
    expect(electronicsProducts.filter((product) => product.category === "Furniture")).toHaveLength(5);
    expect(electronicsProducts.filter((product) => product.category === "Lighting")).toHaveLength(3);
    expect(electronicsProducts.find((product) => product.name === "6-Piece Home Decor Set")?.brand).toBe("DecoNest");
    expect(electronicsProducts.find((product) => product.name === "Smart Aroma Diffuser")?.category).toBe("Home & Living");
  });

  it("normalizes stale negative popularity before a product snapshot is persisted", () => {
    const legacyProduct = { ...electronicsProducts[20], popularity: -21 };
    expect(toProductSnapshot(legacyProduct).popularity).toBe(0);
  });

  it("uses managed original-image assets rather than external stock placeholder URLs", () => {
    expect(electronicsProducts.every((product) => product.image.startsWith("/manus-storage/"))).toBe(true);
  });
});
