import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey?.startsWith("sk_test_")) {
  console.log(JSON.stringify({ available: false }));
  process.exit(0);
}

const stripe = new Stripe(secretKey);
const sessions = await stripe.checkout.sessions.list({ limit: 5 });
const openSession = sessions.data.find((session) => session.status === "open" && session.mode === "payment");
if (openSession && process.argv.includes("--expire")) {
  await stripe.checkout.sessions.expire(openSession.id);
  console.log(JSON.stringify({ available: true, id: openSession.id, expired: true, mode: openSession.mode }));
} else {
  console.log(JSON.stringify(openSession ? { available: true, id: openSession.id, url: openSession.url, status: openSession.status, mode: openSession.mode } : { available: false }));
}
