import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.log(JSON.stringify({ skipped: true, reason: "Stripe secret key is not available" }));
  process.exit(0);
}

if (!secretKey.startsWith("sk_test_")) {
  console.log(JSON.stringify({ skipped: true, reason: "Refusing smoke test outside Stripe test mode" }));
  process.exit(0);
}

const stripe = new Stripe(secretKey);
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  success_url: "https://example.com/stripe-smoke-success",
  cancel_url: "https://example.com/stripe-smoke-cancel",
  line_items: [{
    quantity: 1,
    price_data: {
      currency: "inr",
      unit_amount: 5000,
      product_data: { name: "PRIME CART test-mode payment validation" },
    },
  }],
});

await stripe.checkout.sessions.expire(session.id);
console.log(JSON.stringify({ created: Boolean(session.url), expired: true, mode: session.mode }));
