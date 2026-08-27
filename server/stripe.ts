/** PRIME CART — server-only Stripe Checkout and webhook integration. */
import express, { type Express, type Request, type Response } from "express";
import Stripe from "stripe";
import type { User } from "../drizzle/schema";
import { createOrderFromCart, getUserCart, setUserStripeCustomerId, updateOrderForStripeEvent } from "./db";
import { ENV } from "./_core/env";

export type CheckoutShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
};

function stripeClient() {
  if (!ENV.stripeSecretKey) throw new Error("Stripe is not configured. Open Settings → Payment to finish setup.");
  return new Stripe(ENV.stripeSecretKey);
}

export function buildCheckoutLineItems(items: Awaited<ReturnType<typeof getUserCart>>): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "inr",
      unit_amount: item.price * 100,
      product_data: {
        name: item.name,
        description: item.category,
        images: item.image.startsWith("http") ? [item.image] : undefined,
      },
    },
  }));
}

async function getOrCreateStripeCustomer(user: User, shipping: CheckoutShippingDetails) {
  const stripe = stripeClient();
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email ?? shipping.email,
    name: user.name ?? shipping.fullName,
    phone: shipping.phone,
    address: {
      line1: shipping.address,
      line2: shipping.apartment || undefined,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postalCode,
      country: "IN",
    },
    metadata: { user_id: user.id.toString() },
  });
  await setUserStripeCustomerId(user.id, customer.id);
  return customer.id;
}

export async function createCheckoutSession(user: User, origin: string, shipping: CheckoutShippingDetails) {
  const cart = await getUserCart(user.id);
  if (!cart.length) throw new Error("Your cart is empty.");
  const stripe = stripeClient();
  const customer = await getOrCreateStripeCustomer(user, shipping);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer,
    client_reference_id: user.id.toString(),
    line_items: buildCheckoutLineItems(cart),
    success_url: `${origin}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["IN"] },
    metadata: {
      user_id: user.id.toString(),
      customer_email: user.email ?? shipping.email,
      customer_name: user.name ?? shipping.fullName,
    },
  });
  if (!session.url) throw new Error("Stripe did not return a secure checkout link.");
  await createOrderFromCart(user.id, session.id, cart, shipping);
  return { url: session.url, sessionId: session.id };
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    if (!ENV.stripeWebhookSecret) return res.status(500).json({ error: "Stripe webhook secret is not configured" });
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") return res.status(400).json({ error: "Missing Stripe signature" });

    let event: Stripe.Event;
    try {
      event = stripeClient().webhooks.constructEvent(req.body, signature, ENV.stripeWebhookSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown webhook verification error";
      return res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
    }

    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id && event.type.startsWith("checkout.session.")) {
      await updateOrderForStripeEvent(session.id, event.type);
    }
    console.log("[Stripe webhook]", { type: event.type, id: event.id, createdAt: new Date(event.created * 1000).toISOString() });
    return res.json({ received: true });
  });
}
