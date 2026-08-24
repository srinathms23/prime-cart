/**
 * PRIME CART — Sunlit Mercantile saved items
 * A quiet, paper-framed holding place for products worth returning to.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Heart, Package, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CART_STORAGE_KEY, readStored, WISHLIST_STORAGE_KEY, writeStored } from "@/lib/commerce-storage";
import { useAuth } from "@/_core/hooks/useAuth";
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

const formattedPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

export default function SavedItems() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [savedItems, setSavedItems] = useState<Product[]>(() => readStored<Product[]>(WISHLIST_STORAGE_KEY, []));
  const commerce = trpc.commerce.get.useQuery(undefined, { enabled: isAuthenticated });
  const setRemoteCart = trpc.commerce.setCart.useMutation();
  const setRemoteWishlist = trpc.commerce.setWishlist.useMutation();
  const totalSaved = useMemo(() => savedItems.length, [savedItems]);
  const toRemoteProduct = (product: Product): CommerceProduct => ({ ...product, productId: product.id, badge: product.badge ?? null });
  const toLocalProduct = (product: CommerceProduct): Product => ({ id: product.productId, name: product.name, category: product.category, price: product.price, originalPrice: product.originalPrice, offer: product.offer, delivery: product.delivery, image: product.image, tone: product.tone, popularity: product.popularity, badge: product.badge ?? undefined });

  useEffect(() => {
    if (!isAuthenticated || !commerce.data) return;
    const next = commerce.data.wishlist.map(toLocalProduct);
    setSavedItems(next);
    writeStored(WISHLIST_STORAGE_KEY, next);
  }, [commerce.data, isAuthenticated]);

  const persistWishlist = (items: Product[]) => {
    writeStored(WISHLIST_STORAGE_KEY, items);
    if (isAuthenticated) setRemoteWishlist.mutate({ items: items.map(toRemoteProduct) });
  };

  const persistCart = (items: CartItem[]) => {
    writeStored(CART_STORAGE_KEY, items);
    if (isAuthenticated) setRemoteCart.mutate({ items: items.map((item): CommerceCartItem => ({ ...toRemoteProduct(item), quantity: item.quantity })) });
  };

  const removeSaved = (product: Product) => {
    setSavedItems((current) => {
      const next = current.filter((item) => item.id !== product.id);
      persistWishlist(next);
      return next;
    });
    toast.message("Removed from saved items", { description: product.name });
  };

  const addToCart = (product: Product) => {
    const currentCart = readStored<CartItem[]>(CART_STORAGE_KEY, []);
    const existing = currentCart.find((item) => item.id === product.id);
    const nextCart = existing
      ? currentCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...currentCart, { ...product, quantity: 1 }];
    persistCart(nextCart);
    toast.success(`${product.name} added to your cart`, { description: `${formattedPrice(product.price)} · ${product.delivery}` });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#17232B]">
      <header className="border-b border-[#E7E2DA] bg-[#FFFDF9]/95 backdrop-blur-xl">
        <div className="container flex h-[74px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Return to PRIME CART home">
            <img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-8 w-8 object-contain" />
            <span className="brand-wordmark text-[18px] font-black tracking-[-0.075em]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold text-[#526069]">CART</span></span>
          </Link>
          <button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E2D9] bg-white px-3.5 py-2 text-sm font-extrabold text-[#314047] transition hover:border-[#EF6A3A] hover:text-[#EF6A3A]"><ArrowLeft className="h-4 w-4" /> Continue shopping</button>
        </div>
      </header>

      <main className="container py-10 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Your considered edit</p>
            <h1 className="section-title mt-2">Saved for <em>later.</em></h1>
            <p className="mt-3 max-w-md text-sm leading-6 font-medium text-[#6A7774]">A calm place for the pieces you might bring home when the moment is right.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F5E9E1] px-3.5 py-2 text-xs font-extrabold text-[#B74C2A]"><Heart className="h-3.5 w-3.5 fill-current" /> {totalSaved} {totalSaved === 1 ? "saved item" : "saved items"}</div>
        </div>

        {savedItems.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{savedItems.map((product) => <article key={product.id} className="overflow-hidden rounded-[26px] border border-[#E8E0D6] bg-white p-3 shadow-[0_10px_28px_rgba(23,35,43,0.05)]"><div className={`relative h-[250px] overflow-hidden rounded-[19px] border border-[#E9DED2] p-1.5 ${product.tone}`}><img src={product.image} alt={product.name} className="h-full w-full rounded-[14px] object-cover" /><span className="offer-ticket absolute top-3 left-3 px-2.5 py-1 text-[9px] font-black tracking-[0.08em] text-white uppercase">{product.offer}</span><button type="button" onClick={() => removeSaved(product)} className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#A4583C] shadow-sm transition hover:bg-[#EF6A3A] hover:text-white" aria-label={`Remove ${product.name} from saved items`}><Trash2 className="h-4 w-4" /></button></div><div className="px-1 pt-4 pb-2"><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#89918E] uppercase">{product.category}</p><h2 className="mt-1 text-[17px] font-extrabold tracking-[-0.025em] text-[#283940]">{product.name}</h2><div className="mt-3 flex items-end gap-2"><span className="text-[22px] font-black tracking-[-0.055em] text-[#17232B]">{formattedPrice(product.price)}</span><span className="mb-0.5 text-xs font-semibold text-[#919895] line-through">{formattedPrice(product.originalPrice)}</span></div><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#70807B]"><Package className="h-3.5 w-3.5 text-[#6A866E]" /> {product.delivery}</p><button type="button" onClick={() => addToCart(product)} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#17232B] text-sm font-extrabold text-white transition hover:bg-[#EF6A3A] active:scale-[0.98]"><ShoppingBag className="h-4 w-4" /> Move to cart</button></div></article>)}</div> : <div className="rounded-[30px] border border-dashed border-[#DCCFC2] bg-[#FBF6F0] px-6 py-20 text-center"><span className="mx-auto grid h-15 w-15 place-items-center rounded-[22px] bg-[#F4E6DC] text-[#C9532B]"><Sparkles className="h-7 w-7" /></span><h2 className="font-display mt-6 text-4xl tracking-[-0.05em] text-[#28383E]">The next good find is still out there.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 font-medium text-[#71807A]">Save the objects you want to revisit, and they’ll be waiting here.</p><button type="button" onClick={() => navigate("/")} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#17232B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]"><ShoppingBag className="h-4 w-4" /> Browse the edit <ArrowRight className="h-4 w-4" /></button></div>}
      </main>
    </div>
  );
}
