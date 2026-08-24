/**
 * PRIME CART — Sunlit Mercantile
 * Warm editorial commerce with paper-framed product imagery and quiet, purposeful interactions.
 * This page retains the catalogue collage and adds quick-view, filter, and cart-drawer workflows.
 */
import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronDown,
  CircleUserRound,
  Coffee,
  Eye,
  Gamepad2,
  Headphones,
  Heart,
  House,
  Laptop,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  Send,
  Shirt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { CART_STORAGE_KEY, readStored, WISHLIST_STORAGE_KEY, writeStored } from "@/lib/commerce-storage";
import { trpc } from "@/lib/trpc";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  offer: string;
  delivery: string;
  image: string;
  tone: string;
  popularity: number;
  badge?: string;
};

type CartItem = Product & { quantity: number };

type CommerceProduct = Omit<Product, "id" | "badge"> & { productId: number; badge?: string | null };
type CommerceCartItem = CommerceProduct & { quantity: number };

type Category = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

const categories: Category[] = [
  { label: "Mobiles", icon: Camera, tone: "bg-[#F7EEE7]" },
  { label: "Electronics", icon: Laptop, tone: "bg-[#F4F0E9]" },
  { label: "Fashion", icon: Shirt, tone: "bg-[#F9EEE8]" },
  { label: "Home & Living", icon: House, tone: "bg-[#ECF0E7]" },
  { label: "Beauty", icon: Sparkles, tone: "bg-[#F8F0E9]" },
  { label: "Appliances", icon: Coffee, tone: "bg-[#F3EEE5]" },
  { label: "Gaming", icon: Gamepad2, tone: "bg-[#F0EDE9]" },
  { label: "Audio", icon: Headphones, tone: "bg-[#EBF0EC]" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Voyage Quiet Headphones",
    category: "Audio",
    price: 3499,
    originalPrice: 6999,
    offer: "50% off",
    delivery: "Delivery by tomorrow",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#ECE6DE]",
    popularity: 97,
    badge: "Fast moving",
  },
  {
    id: 2,
    name: "Arc Smartwatch, 1.8\" AMOLED",
    category: "Wearables",
    price: 2799,
    originalPrice: 5499,
    offer: "49% off",
    delivery: "Free delivery",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#E5EDEF]",
    popularity: 93,
    badge: "Top pick",
  },
  {
    id: 3,
    name: "Halo Table Lamp",
    category: "Home & Living",
    price: 1899,
    originalPrice: 3299,
    offer: "42% off",
    delivery: "Free delivery",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#F4E6C9]",
    popularity: 86,
  },
  {
    id: 4,
    name: "Edition Everyday Carry Tote",
    category: "Fashion",
    price: 1099,
    originalPrice: 1699,
    offer: "35% off",
    delivery: "Delivery by tomorrow",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#EAE2D6]",
    popularity: 90,
    badge: "Limited drop",
  },
  {
    id: 5,
    name: "Mini Brew Coffee Press",
    category: "Kitchen",
    price: 899,
    originalPrice: 1499,
    offer: "40% off",
    delivery: "Free delivery",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#EEE8DD]",
    popularity: 80,
  },
  {
    id: 6,
    name: "Flow Compact Speaker",
    category: "Audio",
    price: 1499,
    originalPrice: 2399,
    offer: "37% off",
    delivery: "Delivery by tomorrow",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1100&q=85",
    tone: "bg-[#E4EAE5]",
    popularity: 88,
    badge: "New arrival",
  },
  {
    id: 7,
    name: "TERTIAL Work lamp, dark grey",
    category: "Lighting",
    price: 1490,
    originalPrice: 1490,
    offer: "IKEA price",
    delivery: "Light bulb sold separately",
    image: "/manus-storage/ikea-tertial-xl_56b27ef2.jpg",
    tone: "bg-[#E9ECEB]",
    popularity: 89,
    badge: "IKEA India",
  },
  {
    id: 8,
    name: "ÅRSTID Table lamp, brass/white",
    category: "Lighting",
    price: 2990,
    originalPrice: 2990,
    offer: "IKEA price",
    delivery: "Light bulb sold separately",
    image: "/manus-storage/ikea-arstid-xl_290e6fc8.jpg",
    tone: "bg-[#F3E9D8]",
    popularity: 85,
    badge: "IKEA India",
  },
  {
    id: 9,
    name: "TÄRNABY Table lamp, dimmable beige",
    category: "Lighting",
    price: 2190,
    originalPrice: 2190,
    offer: "IKEA price",
    delivery: "Light bulb sold separately",
    image: "/manus-storage/ikea-taernaby-xl_3eb47634.jpg",
    tone: "bg-[#EFE8DD]",
    popularity: 91,
    badge: "IKEA India",
  },
];

const formattedPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const categoryShortcuts: Record<string, string> = {
  Mobiles: "Wearables",
  Electronics: "Audio",
  Fashion: "Fashion",
  "Home & Living": "Home & Living",
  Beauty: "All",
  Appliances: "Kitchen",
  Gaming: "All",
  Audio: "Audio",
};

export default function Home() {
  // Auth is initiated only from interaction handlers to preserve the one-time OAuth state.
  const { user, loading, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_STORAGE_KEY, []));
  const [wishlist, setWishlist] = useState<Set<number>>(() => new Set(readStored<Product[]>(WISHLIST_STORAGE_KEY, []).map((product) => product.id)));
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All prices");
  const [sortOrder, setSortOrder] = useState("popular");
  const syncedUserId = useRef<number | null>(null);
  const commerce = trpc.commerce.get.useQuery(undefined, { enabled: isAuthenticated });
  const syncCommerce = trpc.commerce.sync.useMutation();
  const setRemoteCart = trpc.commerce.setCart.useMutation();
  const setRemoteWishlist = trpc.commerce.setWishlist.useMutation();

  const toRemoteProduct = (product: Product): CommerceProduct => ({ ...product, productId: product.id, badge: product.badge ?? null });
  const toLocalProduct = (product: CommerceProduct): Product => ({ id: product.productId, name: product.name, category: product.category, price: product.price, originalPrice: product.originalPrice, offer: product.offer, delivery: product.delivery, image: product.image, tone: product.tone, popularity: product.popularity, badge: product.badge ?? undefined });
  const toRemoteCart = (items: CartItem[]): CommerceCartItem[] => items.map((item) => ({ ...toRemoteProduct(item), quantity: item.quantity }));
  const savedProducts = useMemo(() => products.filter((product) => wishlist.has(product.id)), [wishlist]);

  useEffect(() => {
    if (!isAuthenticated) syncedUserId.current = null;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user || !commerce.isSuccess || syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;
    const guestWishlist = readStored<Product[]>(WISHLIST_STORAGE_KEY, []);
    syncCommerce.mutate({ cart: toRemoteCart(cartItems), wishlist: guestWishlist.map(toRemoteProduct) }, {
      onSuccess: (data) => {
        const nextCart = data.cart.map((item) => ({ ...toLocalProduct(item), quantity: item.quantity }));
        const nextWishlist = data.wishlist.map(toLocalProduct);
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
    if (isAuthenticated) {
      setRemoteCart.mutate({ items: toRemoteCart(items) }, { onError: () => toast.error("Cart sync paused", { description: "Please try again shortly." }) });
    }
  };

  const persistWishlist = (items: Product[]) => {
    writeStored(WISHLIST_STORAGE_KEY, items);
    if (isAuthenticated) {
      setRemoteWishlist.mutate({ items: items.map(toRemoteProduct) }, { onError: () => toast.error("Saved items sync paused", { description: "Please try again shortly." }) });
    }
  };

  useEffect(() => {
    const interceptCheckout = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("button") : null;
      if (target?.textContent?.includes("Continue to checkout")) {
        event.preventDefault();
        event.stopPropagation();
        setIsCartOpen(false);
        navigate("/checkout");
      }
    };
    document.addEventListener("click", interceptCheckout, true);
    return () => document.removeEventListener("click", interceptCheckout, true);
  }, [navigate]);

  const catalogueCategories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [],
  );
  const suggestedProducts = useMemo(() => products.slice(0, 3), []);
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const inCategory = categoryFilter === "All" || product.category === categoryFilter;
      const inPriceBand =
        priceFilter === "All prices" ||
        (priceFilter === "Under ₹1,500" && product.price < 1500) ||
        (priceFilter === "₹1,500–₹2,999" && product.price >= 1500 && product.price < 3000) ||
        (priceFilter === "₹3,000+" && product.price >= 3000);
      return inCategory && inPriceBand;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      if (sortOrder === "category") return a.category.localeCompare(b.category) || b.popularity - a.popularity;
      return b.popularity - a.popularity;
    });
  }, [categoryFilter, priceFilter, sortOrder]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setCategoryFilter("All");
    setPriceFilter("All prices");
    setSortOrder("popular");
  };

  const addToCart = (product: Product, revealCart = true) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const next = existing
        ? current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        : [...current, { ...product, quantity: 1 }];
      persistCart(next);
      return next;
    });
    if (revealCart) setIsCartOpen(true);
    toast.success(`${product.name} added to your cart`, {
      description: `${formattedPrice(product.price)} · ${product.delivery}`,
    });
  };

  const updateQuantity = (id: number, amount: number) => {
    setCartItems((current) => {
      const next = current.flatMap((item) => {
        if (item.id !== id) return [item];
        const quantity = item.quantity + amount;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
      persistCart(next);
      return next;
    });
  };

  const removeFromCart = (product: Product) => {
    setCartItems((current) => {
      const next = current.filter((item) => item.id !== product.id);
      persistCart(next);
      return next;
    });
    toast.message("Removed from your cart", { description: product.name });
  };

  const toggleWishlist = (product: Product) => {
    const saved = wishlist.has(product.id);
    setWishlist((current) => {
      const next = new Set(current);
      if (saved) next.delete(product.id);
      else next.add(product.id);
      const storedItems = readStored<Product[]>(WISHLIST_STORAGE_KEY, savedProducts);
      const nextItems = saved
        ? storedItems.filter((item) => item.id !== product.id)
        : storedItems.some((item) => item.id === product.id) ? storedItems : [...storedItems, product];
      persistWishlist(nextItems);
      return next;
    });
    toast(saved ? "Removed from saved items" : "Saved for later", { description: product.name });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) {
      toast.message("Search for something you need", {
        description: "Try headphones, home decor, or smartwatches.",
      });
      return;
    }
    setIsSearchFocused(false);
    scrollTo("shop");
    toast.success(`Showing ideas for “${query}”`, {
      description: "The catalogue filters are ready for a more focused browse.",
    });
  };

  const placeholderAction = (label: string) => {
    toast.message(`${label} is being prepared`, {
      description: "This storefront preview focuses on browsing and cart interactions.",
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFDF9] text-[#17232B]">
      <div className="announcement-bar">
        <div className="container flex items-center justify-center gap-3 text-center">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#EF6A3A]" />
          <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#26353D] uppercase sm:text-xs">
            The Prime Days edit is live — fresh finds, considered prices
          </span>
          <button type="button" onClick={() => scrollTo("flash-deals")} className="hidden items-center gap-1 text-[11px] font-extrabold text-[#C9532B] underline decoration-[#C9532B]/30 underline-offset-4 hover:text-[#17232B] sm:inline-flex">
            Explore <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#E7E2DA]/90 bg-[#FFFDF9]/90 backdrop-blur-xl">
        <div className="container flex h-[74px] items-center gap-3 lg:gap-6">
          <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl border border-[#EAE4DB] bg-white text-[#17232B] transition hover:border-[#EF6A3A] hover:text-[#EF6A3A] lg:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button type="button" onClick={() => scrollTo("top")} className="flex shrink-0 items-center gap-2.5" aria-label="PRIME CART home">
            <img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-8 w-8 object-contain" />
            <span className="brand-wordmark text-[17px] font-black tracking-[-0.075em] sm:text-[20px]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold tracking-[-0.06em] text-[#526069]">CART</span></span>
          </button>
          <button type="button" onClick={() => { scrollTo("shop"); resetFilters(); }} className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#34444D] transition hover:bg-[#F5F0EA] lg:flex">Categories <ChevronDown className="h-4 w-4" /></button>
          <form onSubmit={handleSearch} className="relative hidden min-w-0 max-w-[520px] flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[#7B858A]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 140)} placeholder="Search for products, brands and more" aria-label="Search catalogue" className="h-11 w-full rounded-2xl border border-[#E8E1D8] bg-[#F9F7F3] pr-12 pl-11 text-sm font-medium text-[#17232B] outline-none transition placeholder:text-[#8B9291] focus:border-[#EF6A3A] focus:bg-white focus:ring-4 focus:ring-[#EF6A3A]/10" />
            <button type="submit" className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl bg-[#17232B] text-white transition hover:bg-[#EF6A3A]" aria-label="Submit search"><ArrowRight className="h-4 w-4" /></button>
            {isSearchFocused && <div className="absolute top-[52px] right-0 left-0 z-30 rounded-2xl border border-[#E8E1D8] bg-white p-2 shadow-[0_20px_60px_rgba(22,35,43,0.14)]"><p className="px-3 pt-2 pb-1 text-[10px] font-extrabold tracking-[0.16em] text-[#89928F] uppercase">Popular searches</p>{["Wireless headphones", "Smart home", "Desk essentials"].map((item) => <button key={item} type="button" onMouseDown={() => setSearch(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#34444D] transition hover:bg-[#F8F4EE]"><Search className="h-4 w-4 text-[#EF6A3A]" /> {item}</button>)}</div>}
          </form>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => placeholderAction("Delivery location")} className="hidden items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-[#F5F0EA] xl:flex"><MapPin className="h-4 w-4 text-[#EF6A3A]" /><span className="leading-tight"><span className="block text-[10px] font-bold text-[#87908D]">Deliver to</span><span className="block text-xs font-extrabold">Chennai 600001</span></span></button>
            <button type="button" onClick={() => { if (isAuthenticated) { void logout().then(() => toast.success("Signed out of PRIME CART")); } else { startLogin(); } }} className="inline-flex h-10 items-center gap-2 rounded-xl border border-transparent px-2.5 text-[#314047] transition hover:border-[#EAE4DB] hover:bg-white" aria-label={isAuthenticated ? "Sign out of account" : "Join or sign in for free"} title={isAuthenticated ? "Sign out" : "Join or sign in for free"}><CircleUserRound className="h-5 w-5" />{!loading && <span className="hidden max-w-[110px] truncate text-xs font-extrabold sm:inline">{isAuthenticated ? `Hi, ${user?.name?.split(" ")[0] ?? "there"}` : "Join free"}</span>}</button>
            <button type="button" onClick={() => navigate("/saved")} className="relative grid h-10 w-10 place-items-center rounded-xl border border-transparent text-[#314047] transition hover:border-[#EAE4DB] hover:bg-white" aria-label="Saved items"><Heart className="h-5 w-5" />{wishlist.size > 0 && <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#EF6A3A] px-1 text-[9px] font-black text-white">{wishlist.size}</span>}</button>
            <button type="button" onClick={() => setIsCartOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#17232B] text-white transition hover:bg-[#EF6A3A]" aria-label="Open cart"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#EF6A3A] px-1 text-[10px] font-black text-white ring-2 ring-[#FFFDF9]">{cartCount}</span>}</button>
          </div>
        </div>
        {isMenuOpen && <div className="border-t border-[#E7E2DA] bg-[#FFFDF9] p-4 lg:hidden"><form onSubmit={handleSearch} className="relative mb-4"><Search className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[#7B858A]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What are you looking for?" className="h-11 w-full rounded-xl border border-[#E8E1D8] bg-white pr-4 pl-11 text-sm outline-none focus:border-[#EF6A3A]" /></form><div className="grid grid-cols-2 gap-2">{["All categories", "Today's offers", "New arrivals", "Seller Center"].map((item) => <button key={item} type="button" onClick={() => { setIsMenuOpen(false); item === "All categories" ? scrollTo("shop") : placeholderAction(item); }} className="rounded-xl border border-[#E8E1D8] bg-white px-3 py-3 text-left text-sm font-bold text-[#34444D]">{item}</button>)}</div></div>}
      </header>

      <main id="top">
        <section aria-label="Featured categories" className="border-b border-[#ECE5DC] bg-white"><div className="container no-scrollbar flex gap-3 overflow-x-auto py-4 sm:gap-4">{categories.map((category) => { const Icon = category.icon; return <button key={category.label} type="button" onClick={() => { setCategoryFilter(categoryShortcuts[category.label]); setPriceFilter("All prices"); scrollTo("shop"); toast.message(`${category.label} collection selected`); }} className="group flex min-w-[84px] flex-col items-center gap-2.5 sm:min-w-[100px]"><span className={`category-shelf grid h-[52px] w-[52px] place-items-center rounded-[18px] ${category.tone} transition duration-200 group-hover:-translate-y-1 sm:h-[58px] sm:w-[58px]`}><Icon className="h-5 w-5 text-[#34454C]" /></span><span className="whitespace-nowrap text-[11px] font-extrabold tracking-[-0.01em] text-[#44535A] group-hover:text-[#EF6A3A]">{category.label}</span></button>; })}</div></section>

        <section className="container py-5 sm:py-7"><div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]"><div className="hero-panel relative min-h-[410px] overflow-hidden rounded-[32px] bg-[#F3E7D8] px-7 py-8 sm:min-h-[465px] sm:px-11 sm:py-12"><img src="/manus-storage/prime-cart-hero_46c2e86b.jpg" alt="Curated technology and lifestyle products on warm sculptural displays" className="absolute inset-0 h-full w-full object-cover object-[67%_center]" /><div className="absolute inset-0 bg-gradient-to-r from-[#F9F0E7] via-[#F9F0E7]/85 to-transparent" /><div className="relative z-10 flex h-full max-w-[420px] flex-col justify-between gap-10"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#17232B]/10 bg-white/75 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#496059] uppercase backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[#EF6A3A]" /> The Prime Days edit</div><h1 className="font-display max-w-[390px] text-[44px] leading-[0.94] tracking-[-0.055em] text-[#17232B] sm:text-[63px]">The good stuff, <em className="font-normal text-[#C9532B]">gathered</em> in one cart.</h1><p className="mt-5 max-w-[330px] text-sm leading-6 font-medium text-[#536066] sm:text-[15px]">Discover the objects that make everyday life feel a little more considered — now at special prices.</p></div><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => scrollTo("flash-deals")} className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-[#17232B] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(23,35,43,0.18)] transition hover:bg-[#EF6A3A] active:scale-[0.97]">Shop the edit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button><button type="button" onClick={() => scrollTo("shop")} className="h-12 rounded-2xl border border-[#17232B]/12 bg-white/75 px-5 text-sm font-extrabold text-[#24343B] backdrop-blur transition hover:bg-white active:scale-[0.97]">Browse picks</button></div></div><div className="absolute right-4 bottom-4 hidden items-center gap-2 rounded-full bg-[#17232B]/90 px-3 py-2 text-[10px] font-bold tracking-[0.1em] text-white uppercase backdrop-blur sm:flex"><Sparkles className="h-3.5 w-3.5 text-[#FFB088]" /> Curated for now</div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><button type="button" onClick={() => scrollTo("flash-deals")} className="deal-ticket group relative min-h-[224px] overflow-hidden rounded-[28px] bg-[#17232B] p-6 text-left text-white sm:min-h-[250px] lg:min-h-0"><img src="/manus-storage/prime-cart-offer_f2931731.jpg" alt="Terracotta wireless headphones offer" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-r from-[#17232B] via-[#17232B]/90 to-[#17232B]/15" /><div className="relative z-10 flex h-full max-w-[170px] flex-col justify-between"><span className="inline-flex w-fit items-center gap-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#FFB088] uppercase"><Zap className="h-3.5 w-3.5 fill-current" /> Flash deal</span><div><p className="font-display text-3xl leading-[0.95] tracking-[-0.045em]">Sound that stays with you.</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-white/90">Up to 50% off <ArrowRight className="h-3.5 w-3.5" /></span></div></div></button><button type="button" onClick={() => scrollTo("living")} className="group relative min-h-[224px] overflow-hidden rounded-[28px] bg-[#E6ECDD] p-6 text-left sm:min-h-[250px] lg:min-h-0"><img src="/manus-storage/prime-cart-living_07a9c80f.jpg" alt="Curated home and living objects" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-tr from-[#E6ECDD] via-[#E6ECDD]/78 to-transparent" /><div className="relative z-10 flex h-full max-w-[190px] flex-col justify-between"><span className="text-[10px] font-extrabold tracking-[0.14em] text-[#52634E] uppercase">The home refresh</span><div><p className="font-display text-[29px] leading-[0.98] tracking-[-0.045em] text-[#24332F]">Objects that make a room.</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#344943]">Shop home & living <ArrowRight className="h-3.5 w-3.5" /></span></div></div></button></div></div></section>

        <section id="flash-deals" className="bg-[#17232B] py-11 text-white sm:py-14"><div className="container"><div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold tracking-[0.16em] text-[#FFB088] uppercase"><Zap className="h-3.5 w-3.5 fill-current" /> Ends this evening</div><h2 className="font-display text-[36px] leading-none tracking-[-0.045em] sm:text-5xl">Flash finds, no fuss.</h2></div><div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/90"><span className="text-white/60">Time left</span><span className="font-mono tracking-[0.1em]">06 : 24 : 11</span></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product, index) => <button key={product.id} type="button" onClick={() => setQuickViewProduct(product)} className="group relative overflow-hidden rounded-[22px] bg-white p-3 text-left text-[#17232B] transition hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(0,0,0,0.2)]"><div className={`relative h-[145px] overflow-hidden rounded-[16px] border border-[#E8DED3] p-1.5 ${product.tone}`}><img src={product.image} alt={product.name} className="catalogue-image h-full w-full rounded-[11px] object-cover transition duration-500 group-hover:scale-105" /><span className="offer-ticket absolute top-2 left-2 px-2 py-1 text-[9px] font-black tracking-[0.07em] text-white uppercase">{product.offer}</span></div><div className="px-1 pt-3 pb-1"><p className="truncate text-[11px] font-extrabold tracking-[0.08em] text-[#7C8787] uppercase">Deal 0{index + 1}</p><p className="mt-1 line-clamp-1 text-sm font-extrabold">{product.name}</p><div className="mt-2 flex items-baseline gap-2"><span className="text-lg font-black tracking-[-0.04em]">{formattedPrice(product.price)}</span><span className="text-xs font-semibold text-[#8C9693] line-through">{formattedPrice(product.originalPrice)}</span></div></div></button>)}</div></div></section>

        <section id="shop" className="container py-12 sm:py-16"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Selected for everyday</p><h2 className="section-title mt-2">Fresh in the <em>cart.</em></h2></div><button type="button" onClick={resetFilters} className="group inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-[#304149] transition hover:text-[#EF6A3A]">Reset the catalogue <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4EAE3] text-[#C9532B] transition group-hover:translate-x-1"><ArrowRight className="h-3.5 w-3.5" /></span></button></div><div className="mb-7 flex flex-col gap-3 rounded-[22px] border border-[#EAE1D7] bg-white p-3 shadow-[0_8px_25px_rgba(23,35,43,0.04)] lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2 px-1 text-sm font-extrabold text-[#384951]"><SlidersHorizontal className="h-4 w-4 text-[#EF6A3A]" /><span>Refine this edit</span><span className="ml-1 rounded-full bg-[#F7EEE7] px-2 py-0.5 text-[10px] font-black text-[#C9532B]">{filteredProducts.length} found</span></div><div className="grid gap-2 sm:grid-cols-3 lg:flex"><label className="filter-select"><span>Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{catalogueCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="filter-select"><span>Price</span><select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>{["All prices", "Under ₹1,500", "₹1,500–₹2,999", "₹3,000+"].map((price) => <option key={price} value={price}>{price}</option>)}</select></label><label className="filter-select"><span>Sort</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="category">Category</option></select></label></div></div>{filteredProducts.length ? <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} saved={wishlist.has(product.id)} onAdd={() => addToCart(product)} onSave={() => toggleWishlist(product)} onQuickView={() => setQuickViewProduct(product)} />)}{filteredProducts.length > 3 && <CatalogueInterlude onClick={() => { setSortOrder("popular"); toast.message("The considered edit is now sorted by popularity."); }} />}{filteredProducts.slice(3).map((product) => <ProductCard key={product.id} product={product} saved={wishlist.has(product.id)} onAdd={() => addToCart(product)} onSave={() => toggleWishlist(product)} onQuickView={() => setQuickViewProduct(product)} />)}</div> : <CatalogueEmptyState onReset={resetFilters} />}</section>

        <section id="living" className="container pb-12 sm:pb-16"><div className="overflow-hidden rounded-[34px] bg-[#F1EEE6] p-5 sm:p-8 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-10 lg:p-10"><div className="flex flex-col justify-center py-5 sm:px-4 lg:py-10"><p className="eyebrow">A better home base</p><h2 className="section-title mt-3 max-w-[370px]">Settle into <em>good living.</em></h2><p className="mt-5 max-w-[390px] text-sm leading-6 font-medium text-[#65706F]">A softer edit of practical home pieces, gathered so your favourite corners feel more like yours.</p><button type="button" onClick={() => { setCategoryFilter("Home & Living"); scrollTo("shop"); }} className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-[#E9DDD0] px-4 py-3 text-sm font-extrabold text-[#31433E] transition hover:bg-[#EF6A3A] hover:text-white active:scale-[0.97]">Explore the room edit <ArrowRight className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-[1.25fr_0.75fr] lg:mt-0"><div className="relative min-h-[255px] overflow-hidden rounded-[25px]"><img src="https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1200&q=85" alt="Warm contemporary objects for the home" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute right-4 bottom-4 rounded-2xl bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur"><p className="text-[10px] font-extrabold tracking-[0.12em] text-[#7F8984] uppercase">Soft utility</p><p className="mt-0.5 text-sm font-extrabold text-[#273630]">Home, made yours</p></div></div><div className="grid gap-3"><button type="button" onClick={() => { setCategoryFilter("Kitchen"); scrollTo("shop"); }} className="rounded-[22px] bg-[#D9E3D3] p-5 text-left transition hover:-translate-y-1"><Coffee className="h-6 w-6 text-[#526D58]" /><p className="mt-8 font-display text-2xl leading-none tracking-[-0.04em] text-[#33483A]">Kitchen<br />stories</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#526D58]">Explore <ArrowRight className="h-3.5 w-3.5" /></span></button><button type="button" onClick={() => placeholderAction("Desk picks")} className="rounded-[22px] bg-[#F0DCCF] p-5 text-left transition hover:-translate-y-1"><Laptop className="h-6 w-6 text-[#A95535]" /><p className="mt-8 font-display text-2xl leading-none tracking-[-0.04em] text-[#7D3D27]">Desk, but<br />better</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#A95535]">Explore <ArrowRight className="h-3.5 w-3.5" /></span></button></div></div></div></section>

        <section className="border-y border-[#E9E2D9] bg-white py-9 sm:py-11"><div className="container grid gap-7 sm:grid-cols-3 sm:gap-5"><Benefit icon={Truck} title="Delivery, kept clear" description="Useful delivery estimates at the moments you need them." /><Benefit icon={ShieldCheck} title="Checkout with confidence" description="Your shopping flow is designed around safe, clear decisions." /><Benefit icon={RotateCcw} title="Simple next steps" description="Returns and support remain easy to find after purchase." /></div></section>
        <section className="container py-12 sm:py-16"><div className="grid overflow-hidden rounded-[34px] bg-[#F4E9E0] lg:grid-cols-[0.82fr_1.18fr]"><div className="relative min-h-[310px] overflow-hidden bg-[#EBCBB8] p-7 sm:p-10"><div className="absolute -top-10 -right-10 h-52 w-52 rounded-full border-[32px] border-[#F4E9E0]/80" /><div className="absolute bottom-[-65px] left-[-30px] h-48 w-48 rounded-full border-[28px] border-[#D76A3E]/40" /><div className="relative z-10"><div className="inline-flex items-center gap-2 rounded-full bg-[#17232B] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-white uppercase"><img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-3.5 w-3.5" /> PRIME signal</div><h2 className="font-display mt-6 max-w-[270px] text-[38px] leading-[0.96] tracking-[-0.05em] text-[#243139]">A storefront that learns the <em className="text-[#C9532B]">shape</em> of your day.</h2></div></div><div className="flex flex-col justify-center p-7 sm:p-10"><p className="max-w-[470px] text-base leading-7 font-medium text-[#53615F]">Recommendations belong where they are useful, not where they are loud. Build your saves and cart to receive a calmer, more relevant next browse.</p><div className="mt-7 grid gap-2 sm:grid-cols-3">{suggestedProducts.map((product) => <button key={product.id} type="button" onClick={() => setQuickViewProduct(product)} className="group flex items-center gap-3 rounded-2xl bg-white p-2.5 text-left shadow-[0_5px_14px_rgba(23,35,43,0.06)] transition hover:-translate-y-0.5"><img src={product.image} alt="" className={`h-12 w-12 rounded-xl object-cover ${product.tone}`} /><span className="min-w-0"><span className="line-clamp-1 text-xs font-extrabold text-[#314047]">{product.name}</span><span className="mt-1 block text-xs font-black text-[#C9532B]">{formattedPrice(product.price)}</span></span></button>)}</div></div></div></section>
        <section className="container pb-12 sm:pb-16"><div className="rounded-[28px] border border-[#E8E0D6] bg-white px-6 py-8 sm:flex sm:items-center sm:justify-between sm:px-9"><div><p className="eyebrow">For growing businesses</p><h2 className="font-display mt-2 text-3xl tracking-[-0.045em] text-[#1B2A31]">Bring your good work to PRIME CART.</h2></div><button type="button" onClick={() => placeholderAction("Seller Center")} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#17232B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A] sm:mt-0">Visit Seller Center <ArrowRight className="h-4 w-4" /></button></div></section>
      </main>

      <QuickViewModal product={quickViewProduct} saved={quickViewProduct ? wishlist.has(quickViewProduct.id) : false} onOpenChange={(open) => !open && setQuickViewProduct(null)} onAdd={() => { if (quickViewProduct) { addToCart(quickViewProduct); setQuickViewProduct(null); } }} onSave={() => quickViewProduct && toggleWishlist(quickViewProduct)} />
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} items={cartItems} total={cartTotal} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />

      <footer className="bg-[#17232B] text-white"><div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1.25fr] lg:py-16"><div><div className="flex items-center gap-2.5"><img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="PRIME CART" className="h-9 w-9" /><span className="brand-wordmark text-xl font-black tracking-[-0.075em]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold text-white/70">CART</span></span></div><p className="mt-5 max-w-[260px] text-sm leading-6 font-medium text-white/60">A more considered way to discover, compare, and bring home the good stuff.</p></div><FooterLinks title="Shop" links={["New arrivals", "Today’s offers", "Home & living", "Electronics"]} onClick={placeholderAction} /><FooterLinks title="Help" links={["Track an order", "Delivery details", "Returns", "Contact support"]} onClick={placeholderAction} /><div><h3 className="text-[11px] font-extrabold tracking-[0.16em] text-[#FFB088] uppercase">A quieter inbox</h3><p className="mt-3 text-sm leading-6 font-medium text-white/60">One good edit, occasional offers, no noise.</p><form onSubmit={(event) => { event.preventDefault(); toast.success("You’re on the PRIME list.", { description: "We’ll keep it useful." }); }} className="mt-5 flex rounded-2xl border border-white/15 bg-white/5 p-1.5"><input required type="email" aria-label="Email address" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35" /><button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EF6A3A] text-white transition hover:bg-white hover:text-[#EF6A3A]" aria-label="Subscribe"><Send className="h-4 w-4" /></button></form></div></div><div className="border-t border-white/10"><div className="container flex flex-col gap-3 py-5 text-[11px] font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 PRIME CART. Storefront concept.</span><div className="flex gap-4"><button type="button" onClick={() => placeholderAction("Privacy policy")} className="hover:text-white">Privacy</button><button type="button" onClick={() => placeholderAction("Terms")} className="hover:text-white">Terms</button><button type="button" onClick={() => placeholderAction("Accessibility")} className="hover:text-white">Accessibility</button></div></div></div></footer>
    </div>
  );
}

function ProductCard({ product, saved, onAdd, onSave, onQuickView }: { product: Product; saved: boolean; onAdd: () => void; onSave: () => void; onQuickView: () => void }) {
  const hasSavings = product.originalPrice > product.price;
  return <article className="product-card group"><div className={`product-media relative overflow-hidden ${product.tone}`}><img src={product.image} alt={product.name} className="catalogue-image h-full w-full rounded-[18px] object-cover transition duration-500 group-hover:scale-[1.045]" /><div className="absolute top-3 left-3 flex flex-wrap gap-1.5"><span className="offer-ticket px-2.5 py-1 text-[9px] font-black tracking-[0.08em] text-white uppercase">{product.offer}</span>{product.badge && <span className="rounded-full border border-[#E8DED3] bg-white/95 px-2.5 py-1 text-[9px] font-black tracking-[0.06em] text-[#52615F] uppercase">{product.badge}</span>}</div><button type="button" onClick={onSave} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`} className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full border transition ${saved ? "border-[#EF6A3A] bg-[#EF6A3A] text-white" : "border-white/70 bg-white/90 text-[#314047] hover:text-[#EF6A3A]"}`}><Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /></button><button type="button" onClick={onQuickView} className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-xl bg-[#17232B]/92 px-3 py-2 text-[11px] font-extrabold text-white opacity-100 shadow-sm transition hover:bg-[#EF6A3A] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"><Eye className="h-3.5 w-3.5" /> Quick view</button></div><div className="px-1 pt-4"><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#89918E] uppercase">{product.category}</p><h3 className="mt-1.5 line-clamp-1 text-[15px] font-extrabold tracking-[-0.02em] text-[#283940]">{product.name}</h3><div className="mt-3 flex items-end gap-2"><span className="text-[21px] font-black tracking-[-0.055em] text-[#17232B]">{formattedPrice(product.price)}</span>{hasSavings && <span className="mb-0.5 text-xs font-semibold text-[#919895] line-through">{formattedPrice(product.originalPrice)}</span>}</div><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#70807B]"><Package className="h-3.5 w-3.5 text-[#6A866E]" />{product.delivery}</p><div className="mt-4 grid grid-cols-[1fr_44px] gap-2"><button type="button" onClick={onAdd} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#DEE4DF] bg-white text-sm font-extrabold text-[#314047] transition hover:border-[#17232B] hover:bg-[#17232B] hover:text-white active:scale-[0.98]"><ShoppingBag className="h-4 w-4" /> Add to cart</button><button type="button" onClick={onQuickView} className="grid h-11 place-items-center rounded-2xl border border-[#E7DED4] bg-[#FBF8F4] text-[#485B5C] transition hover:border-[#EF6A3A] hover:text-[#EF6A3A]" aria-label={`Quick view ${product.name}`}><Eye className="h-4 w-4" /></button></div></div></article>;
}

function CatalogueInterlude({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="catalogue-interlude group relative overflow-hidden rounded-[28px] p-6 text-left sm:col-span-2 sm:p-8 lg:col-span-3"><div className="catalogue-circle catalogue-circle-one" /><div className="catalogue-circle catalogue-circle-two" /><div className="relative z-10 flex min-h-[138px] flex-col justify-between sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.15em] text-[#C9532B] uppercase"><span className="spark-inline">✦</span> The considered edit</div><p className="font-display mt-3 max-w-[460px] text-[28px] leading-[0.98] tracking-[-0.045em] text-[#24343B] sm:text-[37px]">A small rotation of objects with <em className="text-[#C9532B]">big</em> everyday impact.</p></div><span className="mt-5 inline-flex w-fit items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-extrabold text-[#34454C] shadow-sm transition group-hover:bg-[#17232B] group-hover:text-white sm:mt-0">Sort by popularity <ArrowRight className="h-4 w-4" /></span></div></button>;
}

function CatalogueEmptyState({ onReset }: { onReset: () => void }) {
  return <div className="rounded-[28px] border border-dashed border-[#DCCFC2] bg-[#FBF6F0] px-6 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#F4E6DC] text-[#C9532B]"><Search className="h-5 w-5" /></div><h3 className="font-display mt-5 text-3xl tracking-[-0.04em] text-[#27363D]">Nothing in this edit — yet.</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 font-medium text-[#72807A]">Try widening your filters to uncover more of the catalogue.</p><button type="button" onClick={onReset} className="mt-6 rounded-2xl bg-[#17232B] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]">Reset filters</button></div>;
}

function QuickViewModal({ product, saved, onOpenChange, onAdd, onSave }: { product: Product | null; saved: boolean; onOpenChange: (open: boolean) => void; onAdd: () => void; onSave: () => void }) {
  if (!product) return null;
  const savings = product.originalPrice - product.price;
  const rating = Math.min(4.9, 4 + product.popularity / 100).toFixed(1);
  return <Dialog open={Boolean(product)} onOpenChange={onOpenChange}><DialogContent className="quick-view-dialog max-h-[90vh] max-w-[960px] overflow-y-auto rounded-[30px] border-[#E8DED3] bg-[#FFFDF9] p-0 shadow-[0_28px_80px_rgba(23,35,43,0.24)]"><div className="grid sm:grid-cols-[1.05fr_0.95fr]"><div className={`min-h-[330px] p-5 sm:min-h-[520px] sm:p-8 ${product.tone}`}><div className="relative h-full overflow-hidden rounded-[23px] border border-white/80 bg-white/35 p-2"><img src={product.image} alt={product.name} className="catalogue-image h-full min-h-[300px] w-full rounded-[17px] object-cover sm:min-h-[450px]" /><span className="offer-ticket absolute top-4 left-4 px-3 py-1.5 text-[10px] font-black tracking-[0.08em] text-white uppercase">{product.offer}</span></div></div><div className="flex flex-col p-7 sm:p-9"><div className="pr-9"><p className="eyebrow">{product.category}</p><DialogTitle className="font-display mt-3 text-[38px] leading-[0.95] tracking-[-0.05em] text-[#1E2D34]">{product.name}</DialogTitle><DialogDescription className="mt-4 text-sm leading-6 font-medium text-[#6C7875]">A considered everyday pick with reliable delivery, transparent pricing, and the details you need before it reaches your cart.</DialogDescription></div><div className="mt-7 flex items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0E5] px-3 py-1.5 text-xs font-extrabold text-[#57725D]"><Star className="h-3.5 w-3.5 fill-current" /> {rating} rated</span><span className="text-xs font-bold text-[#81908A]">{product.popularity}% shopper interest</span></div><div className="mt-6 border-y border-[#EAE2D8] py-5"><div className="flex items-end gap-3"><span className="text-[31px] font-black tracking-[-0.055em] text-[#17232B]">{formattedPrice(product.price)}</span><span className="mb-1 text-sm font-semibold text-[#929995] line-through">{formattedPrice(product.originalPrice)}</span></div><p className="mt-2 text-xs font-extrabold text-[#C9532B]">You save {formattedPrice(savings)} · {product.offer}</p></div><div className="mt-6 grid gap-3"><div className="flex items-center gap-3 rounded-2xl bg-[#F6F3ED] p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#6A866E]"><Truck className="h-4 w-4" /></span><span><span className="block text-xs font-extrabold text-[#35454B]">{product.delivery}</span><span className="mt-0.5 block text-[11px] font-medium text-[#82908A]">Calculated for Chennai 600001</span></span></div><div className="flex items-center gap-3 rounded-2xl bg-[#F6F3ED] p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#6A866E]"><BadgeCheck className="h-4 w-4" /></span><span><span className="block text-xs font-extrabold text-[#35454B]">Simple 7-day return window</span><span className="mt-0.5 block text-[11px] font-medium text-[#82908A]">Clear next steps after delivery</span></span></div></div><div className="mt-auto flex flex-wrap gap-3 pt-7"><button type="button" onClick={onAdd} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#17232B] px-4 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A] active:scale-[0.98]"><ShoppingBag className="h-4 w-4" /> Add to cart</button><button type="button" onClick={onSave} className={`grid h-12 w-12 place-items-center rounded-2xl border transition ${saved ? "border-[#EF6A3A] bg-[#EF6A3A] text-white" : "border-[#DED8CF] bg-white text-[#3A4A50] hover:border-[#EF6A3A] hover:text-[#EF6A3A]"}`} aria-label={saved ? "Remove from saved items" : "Save for later"}><Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} /></button></div></div></div></DialogContent></Dialog>;
}

function CartDrawer({ open, onOpenChange, items, total, onUpdateQuantity, onRemove }: { open: boolean; onOpenChange: (open: boolean) => void; items: CartItem[]; total: number; onUpdateQuantity: (id: number, amount: number) => void; onRemove: (product: Product) => void }) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="cart-drawer w-[min(100%,440px)] max-w-none gap-0 border-[#E6DDD2] bg-[#FFFDF9] p-0"><div className="border-b border-[#EAE2D8] px-6 pt-7 pb-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#F4E7DE] text-[#C9532B]"><ShoppingCart className="h-5 w-5" /></span><div><SheetTitle className="font-display text-[29px] tracking-[-0.04em] text-[#1D2C33]">Your cart</SheetTitle><SheetDescription className="mt-0.5 text-xs font-semibold text-[#7A8781]">{itemCount ? `${itemCount} considered ${itemCount === 1 ? "item" : "items"}` : "Your next good find starts here"}</SheetDescription></div></div></div>{items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><span className="grid h-16 w-16 place-items-center rounded-[22px] bg-[#F4E7DE] text-[#C9532B]"><ShoppingBag className="h-7 w-7" /></span><h3 className="font-display mt-5 text-3xl tracking-[-0.04em] text-[#2A3940]">Your cart is open.</h3><p className="mt-3 max-w-[260px] text-sm leading-6 font-medium text-[#74807C]">Find a piece you like and we’ll keep the next steps clear.</p><button type="button" onClick={() => onOpenChange(false)} className="mt-6 rounded-2xl bg-[#17232B] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]">Continue browsing</button></div> : <><div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">{items.map((item) => <div key={item.id} className="flex gap-3 border-b border-[#EEE7DE] py-4 first:pt-0"><img src={item.image} alt={item.name} className={`h-[82px] w-[82px] rounded-[17px] border border-[#E7DDD2] object-cover p-1 ${item.tone}`} /><div className="min-w-0 flex-1"><div className="flex gap-3"><div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold tracking-[0.12em] text-[#8A928E] uppercase">{item.category}</p><p className="mt-1 line-clamp-2 text-sm font-extrabold leading-5 text-[#314148]">{item.name}</p></div><button type="button" onClick={() => onRemove(item)} className="text-[#9A8177] transition hover:text-[#EF6A3A]" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black tracking-[-0.035em] text-[#17232B]">{formattedPrice(item.price * item.quantity)}</span><div className="flex items-center gap-1 rounded-xl border border-[#E7DED4] bg-white p-1"><button type="button" onClick={() => onUpdateQuantity(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg text-[#5C6A69] transition hover:bg-[#F5E9E1] hover:text-[#C9532B]" aria-label={`Decrease ${item.name} quantity`}><Minus className="h-3.5 w-3.5" /></button><span className="grid h-7 w-7 place-items-center text-xs font-black text-[#283940]">{item.quantity}</span><button type="button" onClick={() => onUpdateQuantity(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg text-[#5C6A69] transition hover:bg-[#17232B] hover:text-white" aria-label={`Increase ${item.name} quantity`}><Plus className="h-3.5 w-3.5" /></button></div></div></div></div>)}</div><div className="border-t border-[#EAE2D8] bg-[#FBF7F1] p-6"><div className="flex items-center justify-between text-sm font-bold text-[#63716E]"><span>Cart subtotal</span><span className="text-lg font-black tracking-[-0.04em] text-[#17232B]">{formattedPrice(total)}</span></div><p className="mt-2 text-[11px] font-medium text-[#87918D]">Taxes and delivery are calculated at checkout.</p><button type="button" onClick={() => toast.message("Checkout is ready for your payment integration.")} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#EF6A3A] text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(239,106,58,0.2)] transition hover:bg-[#17232B] active:scale-[0.98]">Continue to checkout <ArrowRight className="h-4 w-4" /></button></div></>}</SheetContent></Sheet>;
}

function Benefit({ icon: Icon, title, description }: { icon: ComponentType<{ className?: string }>; title: string; description: string }) {
  return <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#F7EEE7] text-[#D85B31]"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-extrabold text-[#2E3E45]">{title}</h3><p className="mt-1 max-w-[260px] text-xs leading-5 font-medium text-[#77817E]">{description}</p></div></div>;
}

function FooterLinks({ title, links, onClick }: { title: string; links: string[]; onClick: (label: string) => void }) {
  return <div><h3 className="text-[11px] font-extrabold tracking-[0.16em] text-[#FFB088] uppercase">{title}</h3><ul className="mt-4 space-y-3">{links.map((link) => <li key={link}><button type="button" onClick={() => onClick(link)} className="text-sm font-semibold text-white/60 transition hover:text-white">{link}</button></li>)}</ul></div>;
}
