import { describe, expect, it } from "vitest";
import { getFulfillmentTransitionError, summarizeInventoryStock } from "./db";

describe("inventory stock summary", () => {
  it("counts active low-stock and out-of-stock products at the operational threshold", () => {
    const result = summarizeInventoryStock([
      { id: 1, name: "Ready item", isActive: true, stockQuantity: 8 },
      { id: 2, name: "Low item", isActive: true, stockQuantity: 5 },
      { id: 3, name: "Out item", isActive: true, stockQuantity: 0 },
      { id: 4, name: "Hidden item", isActive: false, stockQuantity: 0 },
    ] as never);

    expect(result).toMatchObject({ activeProductCount: 3, totalUnits: 13, lowStockCount: 2, outOfStockCount: 1, threshold: 5 });
    expect(result.products.map((product) => product.name)).toEqual(["Out item", "Low item"]);
  });
});

describe("order fulfilment transitions", () => {
  it("permits only paid processing-to-shipped and shipped-to-delivered transitions", () => {
    expect(getFulfillmentTransitionError({ paymentStatus: "paid", status: "processing" } as never, "shipped")).toBeUndefined();
    expect(getFulfillmentTransitionError({ paymentStatus: "paid", status: "shipped" } as never, "delivered")).toBeUndefined();
    expect(getFulfillmentTransitionError({ paymentStatus: "pending", status: "pending" } as never, "shipped")).toBe("Only paid orders can move through fulfilment.");
    expect(getFulfillmentTransitionError({ paymentStatus: "paid", status: "delivered" } as never, "shipped")).toBe("Only processing orders can be marked shipped.");
  });
});
