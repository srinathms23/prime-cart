# PRIME CART — Design Direction

## Three candidate approaches

### 1. Sunlit Mercantile
**Very Brief Intro:** An editorial marketplace with warm mineral neutrals, flashes of energetic coral, and confidently oversized product photography. It feels curated rather than crowded, making everyday shopping feel considered.

**Probability:** 0.07

### 2. Signal Studio
**Very Brief Intro:** A crisp technical retail system using graphite, electric blue, and modular data-like surfaces. The visual language makes recommendations and logistics feel precise and intelligent.

**Probability:** 0.03

### 3. Bazaar After Dark
**Very Brief Intro:** A cinematic, night-market luxury direction with deep ink fields, brass details, and rich product spotlights. It creates an immersive discovery-first shopping mood.

**Probability:** 0.09

---

## Chosen approach: Sunlit Mercantile

### Design Movement
**Contemporary editorial retail** meets **warm neo-minimalism**: a marketplace designed as a living catalogue, with the restraint of an independent fashion magazine and the clarity of a high-performance commerce product.

### Core Principles
1. **Calm commerce:** Every dense shopping function is given breathable spacing, plain-language hierarchy, and an obvious next action.
2. **Curated momentum:** Strong product imagery, asymmetric panels, and a single expressive accent bring energy without becoming visually noisy.
3. **Trust is visible:** Delivery, pricing, offers, and product utilities are concrete, legible, and consistently placed.
4. **Tactile precision:** Soft paper-like bases, warm shadows, hairline rules, and precise circular/radii treatments make the interface feel physically intentional.

### Color Philosophy
The base is **porcelain white** and **oat paper**, creating enough visual quiet for product images and information to breathe. **Ink navy** anchors the brand and navigation with credibility. **Persimmon** is the singular high-energy brand color, reserved for important commerce moments such as discounts, primary actions, and the logo spark. A muted **sage green** signals assurance such as protected checkout and delivery.

### Layout Paradigm
Use a **catalogue collage** rather than a centered template: a wide editorial hero is paired with a stacked feature column, merchandising lanes spill horizontally on smaller screens, and section headers use a split editorial line. Desktop content aligns to a strong 12-column rhythm but intentionally interrupts it with offset cards and full-bleed color panels.

### Signature Elements
1. A **persimmon spark**: a small diamond / four-point graphic that appears in the logo, offer labels, chips, and focused states.
2. **Cut-paper deal tickets**: offer cards use a subtle serrated / ticket edge and small mono labels, never generic gradient banners.
3. **Mercantile frames**: product photography sits in warm, heavily padded rounded-square backgrounds with a crisp inset border.

### Interaction Philosophy
Interactions should be quiet, direct, and commerce-first. Product cards lift a few pixels and reveal quick actions; wishlist and cart actions give immediate tactile confirmation through toast feedback. Search is a prominent utility rather than a decorative field. All placeholder account, navigation, and merchant actions explicitly notify users that the destination is being prepared.

### Animation
Use a 160–240ms custom ease-out for hover and state transitions. On page load, editorial panels and product cards enter with a short 40–70ms stagger via opacity and a 10px upward transform. Product image scale is capped at 1.035 on hover. Ticket edges, price text, and key functional labels stay still; motion never impairs scanning. Honor `prefers-reduced-motion` by removing all non-essential transitions.

### Typography System
**Manrope** provides a clean, highly legible utility and body system across navigation, pricing, and product metadata. **DM Serif Display** is used only for large editorial headlines, giving the storefront a composed, premium voice. Headings use compact letter spacing and strong size contrast; labels use Manrope semibold in uppercase with measured tracking; data uses tabular figures when prices or deals are compared.

### Brand Essence
**PRIME CART is the considered Indian marketplace for shoppers who want fast discovery, transparent value, and a more curated everyday cart.**

**Personality:** discerning, warm, assured.

### Brand Voice
Headlines are concise, human, and product-forward; calls to action sound like invitations to browse, not generic conversion language. Microcopy makes practical benefits explicit and avoids hype.

Example lines:

> "The good stuff, gathered in one cart."

> "See today’s considered prices."

### Wordmark & Logo
The wordmark is a custom-feeling **PRIME** in a heavy, slightly tightened Manrope treatment paired with a small persimmon four-point spark before **CART**. The independent symbol is a tilted, rounded four-point spark with a cutout centre — suggestive of discovery, a price marker, and a parcel fold without literal shopping-cart imagery.

### Signature Brand Color
**Persimmon Signal — #EF6A3A**

## Style Decisions

- Default to a bright, warm, high-key image treatment; text over imagery must use ink navy and sit on an opaque light panel or gradient for verified contrast.
- Use off-white surfaces, ink text, persimmon moments, and sage confirmations consistently. Do not introduce purple gradients, neon treatments, or generic cool-blue marketplace styling.
- Cards are refined but not uniformly pill-shaped: product frames have 28px radii, navigation utilities use 14px radii, and chips are fully rounded only when their compact semantics justify it.
- The site must remain credible as a marketplace UI, so decorative motifs support — never replace — price, delivery, and product information.
