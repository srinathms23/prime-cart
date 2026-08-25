# Authentication and Catalogue Review

The upgraded desktop storefront presents the sign-in entry point beside saved items and cart controls without disrupting the existing premium navigation rhythm. The expanded twelve-item catalogue uses the new staged online product photography in the same paper-framed card system, with category and sort controls continuing to sit above the grid.

At a 390px mobile viewport, the top navigation, product cards, added product imagery, filtering controls, and action buttons remain legible and contained within the page width. The mobile header keeps account access reachable without reducing cart or saved-item affordances.

After replacing placeholder additions, desktop and mobile captures show the three verified IKEA India records—TERTIAL, ÅRSTID, and TÄRNABY—with distinct matching product imagery, sourced names, and sourced listed prices. Their cards participate in the same catalogue grid, quick-view actions, save control, cart flow, and category filtering without visible overflow.

The authenticated desktop preview displayed the signed-in customer state. A database verification confirmed a server-persisted saved item for that authenticated account; customer commerce procedures are also covered by Vitest contract tests. The checkout header now explicitly states “Free to shop · no membership fee,” and the production build completed after this copy change.

The storefront was checked in an earlier signed-out state and then in the authenticated state on desktop and mobile. Desktop exposes the personalised account label, while the compact mobile header retains a reachable account icon alongside saved-items and cart controls.

The latest signed-in preview displayed the account label and a saved-item count. The dedicated `/saved` route rendered the persisted Voyage Quiet Headphones card with its verified product presentation, removal affordance, and move-to-cart action.

The sourced TÄRNABY product was opened in quick view and added to the signed-in cart. A previously discovered sync issue with `/manus-storage/` asset paths was corrected in the protected product schema; after refresh, the signed-in header retained the two-item cart count, confirming the cart now persists both standard and sourced catalogue products.

The authenticated database was then checked directly: the TÄRNABY cart row persisted with its `/manus-storage/ikea-taernaby-xl_3eb47634.jpg` source path and quantity one. This confirms the source-asset schema correction is accepted by the protected commerce data flow, not only by local browser storage.

The signed-in home page visibly showed “Hi, Srinath,” one saved item, and a two-item cart. Selecting the account control then produced the “Signed out of PRIME CART” toast and switched the same control to “Join free,” while retaining guest-visible local cart and saved-item counts for a possible later account merge.

After the new OAuth sign-in flow returned, the signed-in storefront again showed “Hi, Srinath,” one server-backed saved item, and the two-item cart containing both a standard and sourced product. This verifies that the authenticated customer session restores cart and saved-item state after logout and a new account session.

Matching 390px captures were taken for signed-in and signed-out states. In both compact headers, the reachable account icon remains positioned beside saved items and cart without affecting the category rail or hero layout; the desktop companion views make the state label explicit (“Hi, Srinath” versus “Join free”).

The verified product catalogue was filtered to Lighting, returning exactly TÄRNABY, TERTIAL, and ÅRSTID. TÄRNABY’s quick-view and add-to-cart flow were exercised earlier as part of the authenticated Stripe-cart handoff, and its live saved-item action then increased the authenticated wishlist count from one to two. This confirms sourced records participate in filtering, quick view, cart, checkout, and saved-item actions.

## Latest sourced-product payment check

On the current authenticated build, the TÄRNABY Table lamp was visible with its local `/manus-storage/ikea-taernaby-xl_3eb47634.jpg` asset in the cart and checkout summary. Stripe Sandbox rendered the product as a ₹2,190 Lighting line item next to two Voyage Quiet Headphones for a ₹9,188 total. Returning without card data showed PRIME CART’s payment-cancelled feedback and retained the cart. A direct in-browser recheck of the TÄRNABY quick-view control did not visibly open the modal, so that interaction remains an explicit verification item.

The same current page was then inspected with its TÄRNABY quick-view action dispatched. The accessible modal visibly rendered its enlarged product image, Lighting category, product name, ₹2,190 price, delivery detail, rating and interest context, return-window detail, cart action, save control, and close control. This completes the current-build inspection of the sourced product’s filtering, quick view, saved-item, cart, checkout, and hosted-payment handoff behavior.

## Clean-state restoration and responsive account checks

With the customer still authenticated, the PRIME CART local cart and wishlist keys were cleared after a reversible session backup. On reload, the visible account state restored “Hi, Srinath,” two saved items, and six cart items from protected account data, demonstrating that the session does not depend on local browser cache for restored commerce state. This is a clean-local-state, cross-device-equivalent check; it does not claim a second physical device was used.

The authenticated storefront and checkout were also captured at a 390px viewport. The compact account, saved-item, and cart controls remain visible and within the header, while the free-access checkout heading and shipping form remain readable without horizontal overflow. Combined with the current desktop interaction checks, this verifies the authenticated shopping and catalogue layout across supported responsive views.

## Independent browser-profile synchronization

An isolated Chromium browser context was created from the authenticated session and started with its own empty local storage. The independent profile loaded the authenticated account with three saved items and six cart items. Saving Edition Everyday Carry Tote in the independent profile raised its saved count to four; a primary-session reload then also showed four. The item was removed in the primary session and the count returned to three. Adding the same product to cart in the independent profile raised its cart count to seven; a primary-session reload showed seven, and removing it returned the count to six. The context was then disposed. This proves server-backed cart and wishlist propagation between independently isolated browser contexts while preserving the pre-test state.
