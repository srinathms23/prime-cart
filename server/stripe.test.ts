import { describe, expect, it } from "vitest";
import { buildCheckoutLineItems } from "./stripe";

describe("Stripe Checkout line items", () => {
  it("converts the persisted cart snapshot into INR paise line items", () => {
    const lineItems = buildCheckoutLineItems([
      {
        id: 1,
        userId: 7,
        productId: 19,
        name: "Verified lamp",
        category: "Lighting",
        price: 1490,
        originalPrice: 1490,
        offer: "IKEA price",
        delivery: "Light bulb sold separately",
        image: "https://images.example.com/lamp.jpg",
        tone: "bg-stone-100",
        popularity: 90,
        badge: null,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(lineItems).toEqual([{
      quantity: 2,
      price_data: {
        currency: "inr",
        unit_amount: 149000,
        product_data: {
          name: "Verified lamp",
          description: "Lighting",
          images: ["https://images.example.com/lamp.jpg"],
        },
      },
    }]);
  });
});
