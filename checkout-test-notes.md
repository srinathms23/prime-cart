# Checkout and Saved Items Test Notes

## Empty Checkout State

The dedicated `/checkout` route loaded successfully with the established PRIME CART visual system. When the browser storage cart was empty, the page displayed a clear empty-cart state with a return-to-shopping action rather than an incomplete form or broken order summary.

## Next Flow to Verify

The next test will add a product from the storefront, verify the add-to-cart confirmation, then validate the populated checkout summary and shipping form.

## Storefront Entry Point

The catalogue loaded with visible add-to-cart and quick-view controls after returning from the empty checkout state. The browser’s interaction annotations refreshed while targeting the card controls, so subsequent testing will use the current action indices to verify the persisted cart and checkout hand-off.

## Cart Feedback and Checkout Summary

Selecting the active product-card control added Voyage Quiet Headphones to the persisted cart, opened the cart drawer, updated the cart count, and displayed a visible success toast with product name, price, and delivery timing. The cart drawer’s checkout action then routed to `/checkout`, where the order summary showed the same product, quantity one, a ₹3,499 subtotal, included standard delivery, and a ₹3,499 total alongside the shipping form.

## Shipping Form Completion

The required shipping fields accepted valid inputs for name, email, mobile number, address, city, and postal code. Submitting the checkout form cleared the local cart, displayed a “Shipping details saved” toast, and presented a confirmation state showing the selected city and standard delivery.

## Saved Items Empty State

The persisted cart-clear action returned the storefront to an empty cart. The header saved-items control routed successfully to `/saved`, which displayed its dedicated empty state with a clear browse action and no unavailable controls.

## Wishlist Card Control

The homepage returned cleanly from the empty saved-items state and exposed the product-card save controls. The current test pass refreshed the card interaction map while targeting the heart control, so the populated saved-item route will be confirmed using the current visible control state.

The first product-card heart remains accessible as a dedicated control in the reviewed desktop layout, alongside the header saved-items route. The shared local-storage implementation ensures a saved product is available to the `/saved` view after a successful save action.

The accessible save action was triggered in the live preview and persisted Voyage Quiet Headphones to the wishlist storage. The homepage updated its header badge to one and changed the product-card action to “Remove … from saved items,” confirming the save state and immediate UI feedback.

The populated `/saved` route rendered the persisted Voyage Quiet Headphones card with its price, delivery information, removal control, and move-to-cart action. Selecting move-to-cart showed the same product-specific success toast used on the homepage, confirming consistent visual feedback across product entry points.

## Responsive Review

Desktop and narrow mobile captures confirmed that the dedicated saved-items and empty-checkout states retain readable hierarchy, visible escape routes, and no horizontal overflow. The populated checkout flow was separately exercised in the live browser with shipping inputs and an order summary.
