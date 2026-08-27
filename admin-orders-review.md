# Admin Inventory and Customer Orders Review

## Admin inventory workspace

The signed-in administrator opened `/admin` and received the protected **PRIME CART Admin** workspace. Database initialization populated the 30 managed product records, each with a real staged image, category, listed price, active state, and stock quantity. A temporary Home Decor product was added through the form with a managed image path, source URL, stock of five, colours, and specifications. It immediately appeared as product 31; it was then removed through the same admin UI, restoring the catalogue to 30 products.

## Customer order history

The signed-in account opened `/orders` and reached the protected customer order-history view. With no order records created after the new order persistence feature was introduced, it correctly rendered the empty state rather than inventing an order. New Stripe Checkout sessions now create a pending order from immutable cart-item snapshots. Webhook status events can move that order to processing when paid or cancelled when the payment session expires or fails.

No payment credentials, card data, or fabricated customer reviews are stored by these features.

## Verification summary

The public marketplace rendered the 30 database-managed products with their staged original-image assets and a signed-in account saw both **Orders** and **Manage** controls. The administrator workflow demonstrated create, read, update, and remove behavior without leaving temporary inventory in the final catalogue. Desktop and mobile captures confirmed that the inventory form and list collapse into a single readable column on narrow screens, while the account order-history empty state remains clear and actionable.

The automated suite now passes with **14 tests**. It covers product image-path safety, role-gated inventory creation, user-scoped order-history retrieval, server-authoritative cart/wishlist snapshot merging, and Stripe event-to-order-status mapping in addition to the existing authentication, cart, and Checkout line-item checks.

## No-charge order-history validation

With explicit confirmation, a Stripe **Sandbox** Checkout Session was opened from the signed-in customer’s nine-item cart after non-personal test delivery data was entered. No card details were entered and no charge was submitted. The session was observed as open and then explicitly expired. The application created order `PC-1787820831044-1` with the Stripe session reference, five immutable product line-item snapshots, a total of ₹1,45,174, and the visible `pending` / `payment pending` status in `/orders`.

The locally expired Sandbox session did not deliver a cancellation webhook into this development environment, so the database remained pending until Stripe sends a verified event. The mapping from Stripe completion, expiry, and asynchronous failure events to customer-visible order state is covered by automated tests. The validation order was then removed as planned, returning the account history to its empty state.

## Image and narrow-viewport follow-up

The managed catalogue uses staged publisher or retailer product imagery with a product-level source-reference register in [`original-image-sources.md`](./original-image-sources.md). Existing cart snapshots that still displayed prior placeholder URLs were refreshed to managed image paths. The account merge now treats the server snapshot as authoritative for product metadata while preserving the higher quantity from a local cart, preventing an older browser cache from restoring a placeholder image.

Narrow desktop, tablet, and mobile layout captures were reviewed. Direct signed-in interaction in a separate narrow browser context could not be completed because that context did not inherit the OAuth session; the responsive claim is therefore limited to rendered layout validation, rather than a separate authenticated-device interaction assertion.

## Stock and fulfilment operations

The live 30-product inventory now contains **187 units on hand**. The administrator workspace reports 14 active products at or below the configured five-unit threshold and provides direct product-edit entry points for restocking. The customer marketplace provides independent search, category, and price-range controls, including composed category-plus-price results.

The dedicated `/admin/orders` workspace exposes only the permitted paid-order progression: `processing` → `shipped` → `delivered`. No new paid test order was fabricated or charged solely to populate this panel. Its authenticated desktop and narrow-viewport **empty state** was reviewed; the status action controls are protected by router authorization and automated transition tests, and will become visible when Stripe confirms a paid processing order.
