/**
 * PRIME CART — Electronics catalogue upgrade.
 * Preserves account-backed cart, wishlist, checkout and hosted Stripe flows.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  Armchair,
  ArrowRight,
  CircleUserRound,
  Eye,
  Heart,
  House,
  Laptop,
  LampCeiling,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CART_STORAGE_KEY, readStored, WISHLIST_STORAGE_KEY, writeStored } from "@/lib/commerce-storage";
import { trpc } from "@/lib/trpc";
import {
  electronicsProducts,
  hydrateProduct,
  type CartItem,
  type ElectronicsCategory,
  type Product,
  type ProductSnapshot,
} from "@/lib/electronics-catalogue";

type SortOrder = "newest" | "price-low" | "price-high" | "category";
type CommerceCartItem = ProductSnapshot & { quantity: number };

const categories: { label: ElectronicsCategory; icon: typeof Smartphone; tone: string }[] = [
  { label: "Smartphone", icon: Smartphone, tone: "bg-[#F7EEE7]" },
  { label: "Laptop", icon: Laptop, tone: "bg-[#EAF0EC]" },
  { label: "Gaming Laptop", icon: Zap, tone: "bg-[#EEEAF4]" },
  { label: "Furniture", icon: Armchair, tone: "bg-[#F4EBDD]" },
  { label: "Lighting", icon: LampCeiling, tone: "bg-[#F6EEE1]" },
  { label: "Home Decor", icon: House, tone: "bg-[#E9F0E7]" },
  { label: "Home & Living", icon: House, tone: "bg-[#E8EEF1]" },
];

const formattedPrice = (price: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(price);

function toRemoteProduct(product: Product): ProductSnapshot {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    offer: product.offer,
    delivery: product.delivery,
    image: product.image,
    tone: product.tone,
    popularity: Math.max(0, product.popularity),
    badge: product.badge ?? null,
  };
}

function toggleValue<T>(current: Set<T>, value: T) {
  const next = new Set(current);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_STORAGE_KEY, []));
  const [wishlist, setWishlist] = useState<Set<number>>(() => new Set(readStored<Product[]>(WISHLIST_STORAGE_KEY, []).map((product) => product.id)));
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const syncedUserId = useRef<number | null>(null);
  const commerce = trpc.commerce.get.useQuery(undefined, { enabled: isAuthenticated });
  const syncCommerce = trpc.commerce.sync.useMutation();
  const setRemoteCart = trpc.commerce.setCart.useMutation();
  const setRemoteWishlist = trpc.commerce.setWishlist.useMutation();

  useEffect(() => {
    if (!isAuthenticated) syncedUserId.current = null;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user || !commerce.isSuccess || syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;
    const guestWishlist = readStored<Product[]>(WISHLIST_STORAGE_KEY, []);
    syncCommerce.mutate({ cart: cartItems.map((item) => ({ ...toRemoteProduct(item), quantity: item.quantity })), wishlist: guestWishlist.map(toRemoteProduct) }, {
      onSuccess: (data) => {
        const nextCart = data.cart.map((item) => ({ ...hydrateProduct(item), quantity: item.quantity }));
        const nextWishlist = data.wishlist.map(hydrateProduct);
        setCartItems(nextCart);
        setWishlist(new Set(nextWishlist.map((item) => item.id)));
        writeStored(CART_STORAGE_KEY, nextCart);
        writeStored(WISHLIST_STORAGE_KEY, nextWishlist);
      },
      onError: () => {
        syncedUserId.current = null;
        toast.error("Your account cart could not sync yet", { description: "Your items remain safe on this device." });
      },
    });
  }, [cartItems, commerce.isSuccess, isAuthenticated, syncCommerce, user]);

  const persistCart = (items: CartItem[]) => {
    writeStored(CART_STORAGE_KEY, items);
    if (isAuthenticated) setRemoteCart.mutate({ items: items.map((item) => ({ ...toRemoteProduct(item), quantity: item.quantity })) }, { onError: () => toast.error("Cart sync paused", { description: "Please try again shortly." }) });
  };

  const persistWishlist = (items: Product[]) => {
    writeStored(WISHLIST_STORAGE_KEY, items);
    if (isAuthenticated) setRemoteWishlist.mutate({ items: items.map(toRemoteProduct) }, { onError: () => toast.error("Saved items sync paused", { description: "Please try again shortly." }) });
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = electronicsProducts.filter((product) => {
      const matchingText = !query || [product.name, product.brand, product.category, ...product.specifications.map((specification) => specification.value)].join(" ").toLowerCase().includes(query);
      return matchingText;
    });
    return [...filtered].sort((left, right) => {
      if (sortOrder === "price-low") return left.price - right.price;
      if (sortOrder === "price-high") return right.price - left.price;
      if (sortOrder === "category") return left.category.localeCompare(right.category) || left.catalogueOrder - right.catalogueOrder;
      return left.catalogueOrder - right.catalogueOrder;
    });
  }, [search, sortOrder]);

  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

  const addToCart = (product: Product, revealCart = true) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const next = existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
      persistCart(next);
      return next;
    });
    if (revealCart) setIsCartOpen(true);
    toast.success(`${product.name} added to your cart`, { description: `${formattedPrice(product.price)} · ${product.delivery}` });
  };

  const buyNow = (product: Product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const next = existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
      persistCart(next);
      return next;
    });
    setQuickViewProduct(null);
    navigate("/checkout");
  };

  const updateQuantity = (id: number, amount: number) => {
    setCartItems((current) => {
      const next = current.flatMap((item) => item.id !== id ? [item] : item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : []);
      persistCart(next);
      return next;
    });
  };

  const removeFromCart = (product: CartItem) => {
    setCartItems((current) => {
      const next = current.filter((item) => item.id !== product.id);
      persistCart(next);
      return next;
    });
    toast.message("Removed from your cart", { description: product.name });
  };

  const toggleWishlist = (product: Product) => {
    const wasSaved = wishlist.has(product.id);
    setWishlist((current) => {
      const next = toggleValue(current, product.id);
      const saved = readStored<Product[]>(WISHLIST_STORAGE_KEY, []);
      const nextProducts = wasSaved ? saved.filter((item) => item.id !== product.id) : saved.some((item) => item.id === product.id) ? saved : [...saved, product];
      persistWishlist(nextProducts);
      return next;
    });
    toast(wasSaved ? "Removed from saved items" : "Saved for later", { description: product.name });
  };

  const resetCatalogue = () => {
    setSearch("");
    setSortOrder("newest");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFDF9] text-[#17232B]">
      <div className="announcement-bar"><div className="container flex items-center justify-center gap-2 text-center text-[10px] font-extrabold tracking-[0.12em] text-[#34444D] uppercase sm:text-xs"><Zap className="h-3.5 w-3.5 text-[#EF6A3A]" /> Marketplace edit · clear prices · secure checkout</div></div>
      <header className="sticky top-0 z-40 border-b border-[#E7E2DA]/90 bg-[#FFFDF9]/95 backdrop-blur-xl">
        <div className="container flex h-[74px] items-center gap-3 lg:gap-5">
          <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl border border-[#EAE4DB] bg-white text-[#17232B] lg:hidden">{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex shrink-0 items-center gap-2.5" aria-label="PRIME CART home"><img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-8 w-8 object-contain" /><span className="brand-wordmark text-[17px] font-black tracking-[-0.075em] sm:text-[20px]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold tracking-[-0.06em] text-[#526069]">CART</span></span></button>
          <div className="relative hidden min-w-0 max-w-[560px] flex-1 md:block"><Search className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[#7B858A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands or specifications" aria-label="Search marketplace catalogue" className="h-11 w-full rounded-2xl border border-[#E8E1D8] bg-[#F9F7F3] pr-4 pl-11 text-sm font-semibold text-[#17232B] outline-none transition focus:border-[#EF6A3A] focus:bg-white focus:ring-4 focus:ring-[#EF6A3A]/10" /></div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => isAuthenticated ? void logout().then(() => toast.success("Signed out of PRIME CART")) : startLogin()} className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-transparent px-2.5 text-[#314047] transition hover:border-[#EAE4DB] hover:bg-white" aria-label={isAuthenticated ? "Sign out of account" : "Join or sign in for free"}><CircleUserRound className="h-5 w-5" />{isAuthenticated && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#6A866E] ring-2 ring-[#FFFDF9]" />}{!loading && <span className="hidden max-w-[110px] truncate text-xs font-extrabold sm:inline">{isAuthenticated ? `Hi, ${user?.name?.split(" ")[0] ?? "there"}` : "Join free"}</span>}</button>
            <button type="button" onClick={() => navigate("/saved")} className="relative grid h-10 w-10 place-items-center rounded-xl border border-transparent text-[#314047] transition hover:border-[#EAE4DB] hover:bg-white" aria-label="Saved items"><Heart className="h-5 w-5" />{wishlist.size > 0 && <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#EF6A3A] px-1 text-[9px] font-black text-white">{wishlist.size}</span>}</button>
            <button type="button" onClick={() => setIsCartOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#17232B] text-white transition hover:bg-[#EF6A3A]" aria-label="Open cart"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#EF6A3A] px-1 text-[10px] font-black text-white ring-2 ring-[#FFFDF9]">{cartCount}</span>}</button>
          </div>
        </div>
        {isMenuOpen && <div className="border-t border-[#E7E2DA] bg-[#FFFDF9] p-4 lg:hidden"><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#7B858A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the marketplace" aria-label="Search marketplace catalogue" className="h-11 w-full rounded-xl border border-[#E8E1D8] bg-white pr-4 pl-11 text-sm font-semibold outline-none" /></div></div>}
      </header>

      <main>
        <section className="border-b border-[#ECE5DC] bg-white"><div className="container no-scrollbar flex gap-3 overflow-x-auto py-4 sm:gap-4">{categories.map((category) => { const Icon = category.icon; const active = search.trim().toLowerCase() === category.label.toLowerCase(); return <button key={category.label} type="button" onClick={() => setSearch(active ? "" : category.label)} className="group flex min-w-[94px] flex-col items-center gap-2.5"><span className={`category-shelf grid h-[52px] w-[52px] place-items-center rounded-[18px] ${category.tone} ${active ? "ring-2 ring-[#EF6A3A]" : ""} transition group-hover:-translate-y-1`}><Icon className="h-5 w-5" /></span><span className="whitespace-nowrap text-[11px] font-extrabold text-[#44535A] group-hover:text-[#EF6A3A]">{category.label}</span></button>; })}</div></section>
        <section className="container py-6 sm:py-8"><div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]"><div className="hero-panel relative min-h-[365px] overflow-hidden rounded-[32px] bg-[#F3E7D8] px-7 py-8 sm:min-h-[420px] sm:px-11 sm:py-11"><img src="/manus-storage/prime-cart-hero_46c2e86b.jpg" alt="A curated marketplace collection on a warm editorial display" className="absolute inset-0 h-full w-full object-cover object-[67%_center]" /><div className="absolute inset-0 bg-gradient-to-r from-[#F9F0E7] via-[#F9F0E7]/88 to-transparent" /><div className="relative z-10 max-w-[500px]"><span className="inline-flex items-center gap-2 rounded-full border border-[#17232B]/10 bg-white/75 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#496059] uppercase"><Zap className="h-3.5 w-3.5 text-[#EF6A3A]" /> Marketplace, considered</span><h1 className="font-display mt-6 text-[45px] leading-[0.94] tracking-[-0.055em] text-[#17232B] sm:text-[64px]">Useful pieces, <em className="font-normal text-[#C9532B]">well chosen.</em></h1><p className="mt-5 max-w-[390px] text-sm leading-6 font-medium text-[#536066] sm:text-[15px]">Thirty practical products for technology and home, with clear details and a calm path to checkout.</p><button type="button" onClick={() => document.getElementById("marketplace-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#17232B] px-5 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A] active:scale-[0.97]">Browse the marketplace <ArrowRight className="h-4 w-4" /></button></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-[28px] bg-[#17232B] p-6 text-white"><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#FFB088] uppercase">Clear decisions</p><p className="font-display mt-4 text-3xl leading-[0.96] tracking-[-0.045em]">Details first. Checkout when ready.</p><p className="mt-4 text-sm leading-6 font-medium text-white/65">No membership fee. Delivery and secure payment are shown before the final step.</p></div><div className="rounded-[28px] border border-[#E4DED4] bg-[#EEF2EB] p-6"><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#60715F] uppercase">Home & living</p><p className="font-display mt-4 text-3xl leading-[0.96] tracking-[-0.045em] text-[#304237]">A considered room starts here.</p><p className="mt-4 text-sm leading-6 font-medium text-[#657463]">Browse furniture, lighting, decor, and everyday living pieces alongside tech.</p></div></div></div></section>

        <section id="marketplace-grid" className="container pb-14 sm:pb-18"><div className="mb-7"><p className="eyebrow">The marketplace catalogue</p><div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="section-title">Browse with <em>clarity.</em></h2><p className="mt-3 max-w-2xl text-sm leading-6 font-medium text-[#687570]">Prices and specifications are listed directly from the supplied catalogue data. Ratings, reviews, discounts, and promotional claims are intentionally not shown without independently sourced customer evidence.</p></div><div className="rounded-full bg-[#F4E7DE] px-3.5 py-2 text-xs font-extrabold text-[#B74C2A]">{filteredProducts.length} of {electronicsProducts.length} products</div></div></div>
          <div><div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-[#EAE1D7] bg-white p-3 shadow-[0_8px_25px_rgba(23,35,43,0.04)] sm:flex-row sm:items-center sm:justify-between"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#85908A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, brand or category" className="h-10 w-full rounded-xl border border-[#E7DED4] bg-[#FBF9F5] pr-3 pl-9 text-sm font-semibold outline-none focus:border-[#EF6A3A]" /></div><label className="filter-select"><span>Sort</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="category">Category</option></select></label></div>
            {filteredProducts.length ? <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} saved={wishlist.has(product.id)} onSave={() => toggleWishlist(product)} onAdd={() => addToCart(product)} onBuy={() => buyNow(product)} onQuickView={() => setQuickViewProduct(product)} />)}</div> : <div className="rounded-[28px] border border-dashed border-[#DCCFC2] bg-[#FBF6F0] px-6 py-16 text-center"><Search className="mx-auto h-7 w-7 text-[#C9532B]" /><h3 className="font-display mt-4 text-3xl">Nothing matches this edit.</h3><p className="mt-2 text-sm font-medium text-[#70807B]">Try another search term or return to the full catalogue.</p><button type="button" onClick={resetCatalogue} className="mt-5 rounded-2xl bg-[#17232B] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]">Show all products</button></div>}</div>
        </section>
      </main>

      <QuickViewModal product={quickViewProduct} saved={quickViewProduct ? wishlist.has(quickViewProduct.id) : false} onOpenChange={(open) => !open && setQuickViewProduct(null)} onAdd={() => quickViewProduct && addToCart(quickViewProduct)} onBuy={() => quickViewProduct && buyNow(quickViewProduct)} onSave={() => quickViewProduct && toggleWishlist(quickViewProduct)} />
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} items={cartItems} subtotal={cartSubtotal} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={() => { setIsCartOpen(false); navigate("/checkout"); }} />
      <footer className="bg-[#17232B] text-white"><div className="container flex flex-col gap-5 py-10 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2.5"><img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-9 w-9" /><span className="brand-wordmark text-xl font-black tracking-[-0.075em]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold text-white/70">CART</span></span></div><p className="mt-4 max-w-md text-sm leading-6 font-medium text-white/60">A considered marketplace catalogue with account-backed saves, cart, and hosted secure payment.</p></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#FFB088] transition hover:text-white">Back to top <ArrowRight className="h-4 w-4" /></button></div></footer>
    </div>
  );
}

function ProductCard({ product, saved, onSave, onAdd, onBuy, onQuickView }: { product: Product; saved: boolean; onSave: () => void; onAdd: () => void; onBuy: () => void; onQuickView: () => void }) {
  const displaySpecs = product.specifications.slice(0, 2);
  return <article className="product-card rounded-[24px] border border-[#E8E0D6] bg-white p-3 shadow-[0_8px_22px_rgba(23,35,43,0.035)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(23,35,43,0.11)]"><div className={`product-media relative overflow-hidden ${product.tone}`}><img src={product.image} alt={product.name} className="catalogue-image h-full w-full rounded-[18px] object-cover" /><span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-black tracking-[0.08em] text-[#52615F] uppercase">{product.category}</span><button type="button" onClick={onSave} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`} className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full border shadow-sm transition ${saved ? "border-[#EF6A3A] bg-[#EF6A3A] text-white" : "border-white/70 bg-white/92 text-[#314047] hover:text-[#EF6A3A]"}`}><Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /></button><button type="button" onClick={onQuickView} className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-xl bg-[#17232B]/92 px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-[#EF6A3A]"><Eye className="h-3.5 w-3.5" /> Quick view</button></div><div className="px-1 pt-4"><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#C9532B] uppercase">{product.brand}</p><h3 className="mt-1.5 min-h-[40px] text-[15px] font-extrabold leading-5 tracking-[-0.02em] text-[#283940]">{product.name}</h3><div className="mt-3"><span className="text-[21px] font-black tracking-[-0.055em] text-[#17232B]">{formattedPrice(product.price)}</span><p className="mt-1 text-[10px] font-bold text-[#75827D]">Listed price · no unverified discount claim</p></div><div className="mt-3 min-h-[37px] space-y-1">{displaySpecs.map((specification) => <p key={specification.label} className="line-clamp-1 text-[11px] font-semibold text-[#687771]"><span className="font-extrabold text-[#44545A]">{specification.label}:</span> {specification.value}</p>)}</div><div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-[#6A866E]"><Truck className="h-3.5 w-3.5" /> {product.delivery}</div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={onAdd} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#DCE2DD] bg-white text-xs font-extrabold text-[#314047] transition hover:border-[#17232B] hover:bg-[#17232B] hover:text-white"><ShoppingBag className="h-3.5 w-3.5" /> Add to cart</button><button type="button" onClick={onBuy} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#EF6A3A] text-xs font-extrabold text-white transition hover:bg-[#17232B]"><Zap className="h-3.5 w-3.5" /> Buy now</button></div></div></article>;
}

function QuickViewModal({ product, saved, onOpenChange, onAdd, onBuy, onSave }: { product: Product | null; saved: boolean; onOpenChange: (open: boolean) => void; onAdd: () => void; onBuy: () => void; onSave: () => void }) {
  if (!product) return null;
  return <Dialog open={Boolean(product)} onOpenChange={onOpenChange}><DialogContent className="quick-view-dialog max-h-[90vh] max-w-[960px] overflow-y-auto rounded-[30px] border-[#E8DED3] bg-[#FFFDF9] p-0 shadow-[0_28px_80px_rgba(23,35,43,0.24)]"><div className="grid sm:grid-cols-[1.02fr_0.98fr]"><div className={`min-h-[320px] p-5 sm:min-h-[540px] sm:p-8 ${product.tone}`}><div className="h-full overflow-hidden rounded-[23px] border border-white/80 bg-white/35 p-2"><img src={product.image} alt={product.name} className="catalogue-image h-full min-h-[290px] w-full rounded-[17px] object-cover sm:min-h-[470px]" /></div></div><div className="flex flex-col p-7 sm:p-9"><div className="pr-9"><p className="eyebrow">{product.brand} · {product.category}</p><DialogTitle className="font-display mt-3 text-[38px] leading-[0.95] tracking-[-0.05em] text-[#1E2D34]">{product.name}</DialogTitle><DialogDescription className="mt-4 text-sm leading-6 font-medium text-[#6C7875]">Clear details and colour information for a more confident purchase.</DialogDescription></div><div className="mt-6 flex flex-wrap gap-2">{product.colors.map((color) => <span key={color} className="rounded-full border border-[#E4DED4] bg-white px-3 py-1.5 text-xs font-extrabold text-[#52615F]">{color}</span>)}</div><div className="mt-6 border-y border-[#EAE2D8] py-5"><span className="text-[31px] font-black tracking-[-0.055em] text-[#17232B]">{formattedPrice(product.price)}</span><p className="mt-2 text-xs font-extrabold text-[#C9532B]">Transparent listed price · free customer access</p></div><div className="mt-6 grid grid-cols-2 gap-3">{product.specifications.map((specification) => <div key={specification.label} className="rounded-2xl bg-[#F6F3ED] p-3"><p className="text-[9px] font-extrabold tracking-[0.12em] text-[#82908A] uppercase">{specification.label}</p><p className="mt-1 text-xs font-extrabold leading-4 text-[#35454B]">{specification.value}</p></div>)}</div><div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#63736B]"><Truck className="h-4 w-4 text-[#6A866E]" /> {product.delivery}</div><div className="mt-auto grid grid-cols-[1fr_1fr_48px] gap-2 pt-7"><button type="button" onClick={onAdd} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#DDE2DC] bg-white px-3 text-sm font-extrabold text-[#33444A] transition hover:border-[#17232B] hover:bg-[#17232B] hover:text-white"><ShoppingBag className="h-4 w-4" /> Add</button><button type="button" onClick={onBuy} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#EF6A3A] px-3 text-sm font-extrabold text-white transition hover:bg-[#17232B]"><Zap className="h-4 w-4" /> Buy now</button><button type="button" onClick={onSave} className={`grid h-12 place-items-center rounded-2xl border transition ${saved ? "border-[#EF6A3A] bg-[#EF6A3A] text-white" : "border-[#DED8CF] bg-white text-[#3A4A50] hover:border-[#EF6A3A] hover:text-[#EF6A3A]"}`} aria-label={saved ? "Remove from saved items" : "Save for later"}><Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} /></button></div></div></div></DialogContent></Dialog>;
}

function CartDrawer({ open, onOpenChange, items, subtotal, onUpdateQuantity, onRemove, onCheckout }: { open: boolean; onOpenChange: (open: boolean) => void; items: CartItem[]; subtotal: number; onUpdateQuantity: (id: number, amount: number) => void; onRemove: (product: CartItem) => void; onCheckout: () => void }) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const savings = items.reduce((total, item) => total + Math.max(0, item.originalPrice - item.price) * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 2000 ? 0 : 99;
  const total = subtotal + delivery;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="cart-drawer w-[min(100%,440px)] max-w-none gap-0 border-[#E6DDD2] bg-[#FFFDF9] p-0"><div className="border-b border-[#EAE2D8] px-6 pt-7 pb-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#F4E7DE] text-[#C9532B]"><ShoppingCart className="h-5 w-5" /></span><div><SheetTitle className="font-display text-[29px] tracking-[-0.04em] text-[#1D2C33]">Your cart</SheetTitle><SheetDescription className="mt-0.5 text-xs font-semibold text-[#7A8781]">{itemCount ? `${itemCount} selected ${itemCount === 1 ? "item" : "items"}` : "Your next good find starts here"}</SheetDescription></div></div></div>{items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag className="h-8 w-8 text-[#C9532B]" /><h3 className="font-display mt-5 text-3xl">Your cart is open.</h3><p className="mt-3 text-sm leading-6 font-medium text-[#74807C]">Add a marketplace pick when you are ready.</p></div> : <><div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">{items.map((item) => <div key={item.id} className="flex gap-3 border-b border-[#EEE7DE] py-4 first:pt-0"><img src={item.image} alt={item.name} className={`h-[76px] w-[76px] rounded-[16px] border border-[#E7DDD2] object-cover p-1 ${item.tone}`} /><div className="min-w-0 flex-1"><div className="flex gap-2"><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#314148]">{item.name}</p><p className="mt-1 text-[10px] font-bold text-[#7C8783]">{item.brand} · {item.category}</p></div><button type="button" onClick={() => onRemove(item)} className="text-[#9A8177] transition hover:text-[#EF6A3A]" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black tracking-[-0.035em] text-[#17232B]">{formattedPrice(item.price * item.quantity)}</span><div className="flex items-center gap-1 rounded-xl border border-[#E7DED4] bg-white p-1"><button type="button" onClick={() => onUpdateQuantity(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg text-[#5C6A69] transition hover:bg-[#F5E9E1] hover:text-[#C9532B]" aria-label={`Decrease ${item.name} quantity`}><Minus className="h-3.5 w-3.5" /></button><span className="grid h-7 w-7 place-items-center text-xs font-black text-[#283940]">{item.quantity}</span><button type="button" onClick={() => onUpdateQuantity(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg text-[#5C6A69] transition hover:bg-[#17232B] hover:text-white" aria-label={`Increase ${item.name} quantity`}><Plus className="h-3.5 w-3.5" /></button></div></div></div></div>)}</div><div className="border-t border-[#EAE2D8] bg-[#FBF7F1] p-6"><div className="space-y-2 text-sm"><CartSummary label="Subtotal" value={formattedPrice(subtotal)} /><CartSummary label="Savings" value={savings ? `−${formattedPrice(savings)}` : "—"} /><CartSummary label="Delivery" value={delivery ? formattedPrice(delivery) : "FREE"} /><div className="flex items-center justify-between border-t border-[#E5DDD3] pt-3 text-[17px] font-black text-[#17232B]"><span>Total</span><span>{formattedPrice(total)}</span></div></div><button type="button" onClick={onCheckout} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#EF6A3A] text-sm font-extrabold text-white transition hover:bg-[#17232B]">Proceed to checkout <ArrowRight className="h-4 w-4" /></button></div></>}</SheetContent></Sheet>;
}

function CartSummary({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between font-semibold text-[#667571]"><span>{label}</span><span className="font-extrabold text-[#33434A]">{value}</span></div>; }
