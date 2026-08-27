import { describe, expect, it } from "vitest";
import { getOrderUpdateForStripeEvent } from "./db";
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

describe("Stripe Checkout order status", () => {
  it("maps verified completion and failure events to customer-visible order states", () => {
    expect(getOrderUpdateForStripeEvent("checkout.session.completed")).toEqual({ paymentStatus: "paid", status: "processing" });
    expect(getOrderUpdateForStripeEvent("checkout.session.expired")).toEqual({ paymentStatus: "failed", status: "cancelled" });
    expect(getOrderUpdateForStripeEvent("checkout.session.async_payment_failed")).toEqual({ paymentStatus: "failed", status: "cancelled" });
    expect(getOrderUpdateForStripeEvent("checkout.session.created")).toBeUndefined();
  });
});
