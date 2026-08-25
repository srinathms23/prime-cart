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
