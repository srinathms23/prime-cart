import { describe, expect, it } from "vitest";
import { filterCatalogueProducts } from "../client/src/lib/catalogue-filters";
import { electronicsProducts } from "../client/src/lib/electronics-catalogue";

describe("catalogue discovery filters", () => {
  it("composes customer search, category, and price-range filters", () => {
    const matchingProducts = filterCatalogueProducts(electronicsProducts, {
      search: "samsung",
      category: "Smartphone",
      priceRange: "50k-100k",
      sortOrder: "newest",
    });
    expect(matchingProducts.map((product) => product.name)).toEqual(["Galaxy S25"]);
  });

  it("narrows furniture to the requested mid-range price band", () => {
    const matchingProducts = filterCatalogueProducts(electronicsProducts, {
      search: "",
      category: "Furniture",
      priceRange: "10k-50k",
      sortOrder: "price-low",
    });
    expect(matchingProducts.map((product) => product.name)).toEqual(["4-Door Storage Wardrobe", "Modern 3-Seater Sofa", "Queen Size Wooden Bed"]);
  });
});
