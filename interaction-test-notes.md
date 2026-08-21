# Interaction Test Notes

## Quick View

The live preview exposed a visible quick-view action on product cards. Selecting the Voyage Quiet Headphones card opened an in-page modal with a larger product image, product category, rating and interest indicator, full price and savings, delivery and return information, save control, and an add-to-cart action. The page URL remained unchanged.

## Cart Drawer

Selecting the quick-view modal’s add-to-cart action closed the modal and opened the right-side cart drawer. The drawer displayed the selected product, its price, an item count, cart subtotal, remove action, and decrease/increase quantity controls. The header cart badge also updated to one item.

The increase control was tested in the live drawer. It updated the item quantity from one to two, updated the header badge to two, and recalculated the product line and subtotal from ₹3,499 to ₹6,998 without leaving the page. The cart drawer also closed cleanly via its close control.

## Catalogue Controls

The live page displays category, price, and sort select controls with dynamically calculated result count. Available sort choices include most popular, price ascending, price descending, and category.

The Audio category filter reduced the catalogue from six products to the two matching audio products. Applying the “Under ₹1,500” price range in combination further reduced the result count to one and retained only the ₹1,499 Flow Compact Speaker, confirming that the controls combine dynamically.

Returning the category control to “All” expanded the active price-range result set from one product to the three matching products. The retained grid order remained popularity-first until a different sort option is chosen.

With the active under-₹1,500 range, choosing price-low sorting ordered the three remaining products from ₹899 to ₹1,099 to ₹1,499. A mobile full-page capture at 390px confirmed the header, category rail, compact filters, product actions, and catalogue content remain visible without horizontal overflow.
