# Checkout render-loop repair review

## Reported behavior

An authenticated visit to `/checkout` reported React’s “Maximum update depth exceeded” error from the cart hydration effect. The effect depended on `commerce.data`, which can be presented with a fresh object reference after a mutation or query update. It unconditionally set checkout state and could re-trigger account cart synchronization.

## Repair

Checkout now derives a deterministic, order-independent `productId:quantity` fingerprint for the remote cart. A ref records the latest hydrated remote fingerprint. Repeated query data with the same cart returns from the effect before state is changed or a sync mutation is sent. The merge still retains a locally queued Buy Now item until the server copy catches up.

## Validation

The checkout route was opened while authenticated and rendered the shipping form plus the eight-item authenticated order summary without a render-loop error. Browser console output was empty after loading. `pnpm check` passed, and the Vitest suite passed with eight tests, including two checkout hydration regression tests for the no-op fingerprint guard and local Buy Now merge behavior.
