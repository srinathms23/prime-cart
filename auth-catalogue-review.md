# Authentication and Catalogue Review

The upgraded desktop storefront presents the sign-in entry point beside saved items and cart controls without disrupting the existing premium navigation rhythm. The expanded twelve-item catalogue uses the new staged online product photography in the same paper-framed card system, with category and sort controls continuing to sit above the grid.

At a 390px mobile viewport, the top navigation, product cards, added product imagery, filtering controls, and action buttons remain legible and contained within the page width. The mobile header keeps account access reachable without reducing cart or saved-item affordances.

After replacing placeholder additions, desktop and mobile captures show the three verified IKEA India records—TERTIAL, ÅRSTID, and TÄRNABY—with distinct matching product imagery, sourced names, and sourced listed prices. Their cards participate in the same catalogue grid, quick-view actions, save control, cart flow, and category filtering without visible overflow.

The authenticated desktop preview displayed the signed-in customer state. A database verification confirmed a server-persisted saved item for that authenticated account; customer commerce procedures are also covered by Vitest contract tests. The checkout header now explicitly states “Free to shop · no membership fee,” and the production build completed after this copy change.

The storefront was checked in an earlier signed-out state and then in the authenticated state on desktop and mobile. Desktop exposes the personalised account label, while the compact mobile header retains a reachable account icon alongside saved-items and cart controls.
