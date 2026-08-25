/**
 * PRIME CART — Sunlit Mercantile checkout
 * A focused, low-noise shipping form paired with a transparent editorial order summary.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, LockKeyhole, MapPin, Package, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { CART_STORAGE_KEY, readStored, writeStored } from "@/lib/commerce-storage";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";

type CartItem = {
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
  quantity: number;
};

type CommerceCartItem = Omit<CartItem, "id" | "badge"> & { productId: number; badge?: string | null };

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
};

const formattedPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

const initialForm: ShippingForm = { fullName: "", email: "", phone: "", address: "", apartment: "", city: "", state: "Tamil Nadu", postalCode: "" };

export default function Checkout() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_STORAGE_KEY, []));
  const commerce = trpc.commerce.get.useQuery(undefined, { enabled: isAuthenticated });
  const setRemoteCart = trpc.commerce.setCart.useMutation();
  const createStripeCheckout = trpc.payments.createCheckout.useMutation();
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [delivery, setDelivery] = useState("standard");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !commerce.data) return;
    const next = commerce.data.cart.map((item) => ({ id: item.productId, name: item.name, category: item.category, price: item.price, originalPrice: item.originalPrice, offer: item.offer, delivery: item.delivery, image: item.image, tone: item.tone, popularity: item.popularity, quantity: item.quantity }));
    setCartItems(next);
    writeStored(CART_STORAGE_KEY, next);
  }, [commerce.data, isAuthenticated]);

  const persistCart = (items: CartItem[]) => {
    writeStored(CART_STORAGE_KEY, items);
    if (isAuthenticated) setRemoteCart.mutate({ items: items.map((item): CommerceCartItem => ({ ...item, productId: item.id, badge: null })) });
  };

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal === 0 || subtotal >= 2000 || delivery === "express" ? (delivery === "express" ? 149 : 0) : 99;
  const total = subtotal + shipping;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) {
      toast.error("Your cart is still waiting for a good find.", { description: "Add an item before checking out." });
      navigate("/");
      return;
    }
    if (!isAuthenticated) {
      toast.message("Join free to continue securely", { description: "A free account keeps your cart and payment history together." });
      startLogin();
      return;
    }
    createStripeCheckout.mutate({ shipping: form }, {
      onSuccess: ({ url }) => {
        toast.success("Opening secure payment", { description: "Stripe Checkout opens in a new tab. PRIME CART never sees your card details." });
        window.open(url, "_blank", "noopener,noreferrer");
      },
      onError: (error) => toast.error("Secure payment could not start", { description: error.message }),
    });
  };

  if (isComplete) {
    return <div className="min-h-screen bg-[#FFFDF9] text-[#17232B]"><CheckoutHeader /><main className="container flex min-h-[calc(100vh-74px)] items-center justify-center py-14"><div className="max-w-[610px] rounded-[34px] border border-[#E7DED4] bg-white p-8 text-center shadow-[0_20px_60px_rgba(23,35,43,0.08)] sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-[23px] bg-[#E7F0E5] text-[#59775D]"><CheckCircle2 className="h-8 w-8" /></span><p className="eyebrow mt-7">Details received</p><h1 className="font-display mt-3 text-5xl leading-[0.95] tracking-[-0.055em] text-[#26363D]">Your order is <em className="text-[#C9532B]">ready</em> for its next step.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-6 font-medium text-[#71807A]">We have your shipping details. Connect a payment provider when you are ready to turn this checkout into a live order flow.</p><div className="mt-8 grid gap-2 text-left sm:grid-cols-3"><SummaryPoint icon={Package} label="Order" value="Reviewed" /><SummaryPoint icon={MapPin} label="Ship to" value={form.city || "Your address"} /><SummaryPoint icon={Truck} label="Delivery" value={delivery === "express" ? "Express" : "Standard"} /></div><button type="button" onClick={() => navigate("/")} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#17232B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]"><ShoppingBag className="h-4 w-4" /> Return to the edit <ArrowRight className="h-4 w-4" /></button></div></main></div>;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#17232B]"><CheckoutHeader /><main className="container py-9 sm:py-12"><div className="mb-8"><button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#60706D] transition hover:text-[#EF6A3A]"><ArrowLeft className="h-4 w-4" /> Back to shopping</button><p className="eyebrow mt-8">Secure checkout</p><h1 className="section-title mt-2">A few details, then <em>done.</em></h1><p className="mt-3 max-w-xl text-sm leading-6 font-medium text-[#6B7875]">Tell us where this order should go. You can review every detail before payment is connected.</p></div>{cartItems.length ? <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start"><section className="rounded-[28px] border border-[#E8E0D6] bg-white p-6 shadow-[0_8px_28px_rgba(23,35,43,0.04)] sm:p-8"><div className="flex items-start gap-3 border-b border-[#EEE7DE] pb-6"><span className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#F4E7DE] text-[#C9532B]"><MapPin className="h-5 w-5" /></span><div><h2 className="font-display text-[28px] tracking-[-0.04em] text-[#26363D]">Shipping details</h2><p className="mt-1 text-xs font-medium text-[#7A8782]">We use these details only to prepare delivery.</p></div></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Full name" name="fullName" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} placeholder="Sri Kumar" required /><Field label="Email address" name="email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="sri@example.com" required /><Field label="Mobile number" name="phone" type="tel" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} placeholder="98765 43210" required /><div className="hidden sm:block" /><Field label="Address" name="address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} placeholder="Door number, street, locality" required className="sm:col-span-2" /><Field label="Apartment, suite, etc. (optional)" name="apartment" value={form.apartment} onChange={(value) => setForm((current) => ({ ...current, apartment: value }))} placeholder="Floor or landmark" className="sm:col-span-2" /><Field label="City" name="city" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="Chennai" required /><label className="checkout-field"><span>State</span><select value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}><option>Tamil Nadu</option><option>Karnataka</option><option>Kerala</option><option>Maharashtra</option><option>Delhi</option></select></label><Field label="Postal code" name="postalCode" value={form.postalCode} onChange={(value) => setForm((current) => ({ ...current, postalCode: value }))} placeholder="600001" required /></div><div className="mt-8 border-t border-[#EEE7DE] pt-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#E8F0E5] text-[#59775D]"><Truck className="h-5 w-5" /></span><div><h2 className="font-display text-[28px] tracking-[-0.04em] text-[#26363D]">Delivery pace</h2><p className="mt-1 text-xs font-medium text-[#7A8782]">Choose what fits this order.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><DeliveryChoice checked={delivery === "standard"} onChange={() => setDelivery("standard")} title="Standard delivery" detail="2–4 business days · Free over ₹2,000" price={shipping === 0 && delivery === "standard" ? "Included" : "₹99"} /><DeliveryChoice checked={delivery === "express"} onChange={() => setDelivery("express")} title="Express delivery" detail="Next business day where available" price="₹149" /></div></div></section><aside className="rounded-[28px] border border-[#E8E0D6] bg-[#FBF7F1] p-6 shadow-[0_8px_28px_rgba(23,35,43,0.04)] sm:p-7 lg:sticky lg:top-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Order summary</p><h2 className="font-display mt-2 text-[29px] tracking-[-0.045em] text-[#26363D]">Your considered cart.</h2></div><span className="rounded-full bg-[#F4E7DE] px-2.5 py-1 text-[10px] font-black text-[#C9532B]">{itemCount} items</span></div><div className="mt-6 space-y-4">{cartItems.map((item) => <div key={item.id} className="flex gap-3"><img src={item.image} alt={item.name} className={`h-14 w-14 rounded-[14px] border border-[#E7DDD2] object-cover p-1 ${item.tone}`} /><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-extrabold text-[#314148]">{item.name}</p><p className="mt-1 text-xs font-semibold text-[#7B8781]">Qty {item.quantity}</p></div><span className="text-sm font-black tracking-[-0.03em] text-[#26363D]">{formattedPrice(item.price * item.quantity)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-[#E5DDD3] pt-5 text-sm"><SummaryRow label="Subtotal" value={formattedPrice(subtotal)} /><SummaryRow label="Delivery" value={shipping === 0 ? "Included" : formattedPrice(shipping)} /><div className="flex items-center justify-between border-t border-[#E5DDD3] pt-4 text-[17px] font-black tracking-[-0.035em] text-[#17232B]"><span>Total</span><span>{formattedPrice(total)}</span></div></div><button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#EF6A3A] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(239,106,58,0.2)] transition hover:bg-[#17232B] active:scale-[0.98]"><CreditCard className="h-4 w-4" /> Review & continue <ArrowRight className="h-4 w-4" /></button><p className="mt-4 flex items-start gap-2 text-[11px] leading-4 font-semibold text-[#7A8780]"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6A866E]" /> This prototype collects shipping details locally. A payment provider can be connected in the next step.</p></aside></form> : <div className="rounded-[30px] border border-dashed border-[#DCCFC2] bg-[#FBF6F0] px-6 py-20 text-center"><span className="mx-auto grid h-15 w-15 place-items-center rounded-[22px] bg-[#F4E6DC] text-[#C9532B]"><ShoppingBag className="h-7 w-7" /></span><h2 className="font-display mt-6 text-4xl tracking-[-0.05em] text-[#28383E]">Your cart needs a good find.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 font-medium text-[#71807A]">Add a product before beginning checkout.</p><button type="button" onClick={() => navigate("/")} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#17232B] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A]"><ShoppingBag className="h-4 w-4" /> Browse the edit <ArrowRight className="h-4 w-4" /></button></div>}</main></div>
  );
}

function CheckoutHeader() {
  return <header className="border-b border-[#E7E2DA] bg-[#FFFDF9]/95 backdrop-blur-xl"><div className="container flex h-[74px] items-center justify-between gap-4"><Link href="/" className="flex items-center gap-2.5" aria-label="Return to PRIME CART home"><img src="/manus-storage/prime-cart-spark_1191fbd0.png" alt="" className="h-8 w-8 object-contain" /><span className="brand-wordmark text-[18px] font-black tracking-[-0.075em]">PRIME<span className="text-[#EF6A3A]">.</span><span className="ml-1 font-semibold text-[#526069]">CART</span></span></Link><span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] text-[#667571] uppercase"><ShieldCheck className="h-4 w-4 text-[#6A866E]" /> Free to shop · no membership fee</span></div></header>;
}

function Field({ label, name, value, onChange, placeholder, required, type = "text", className = "" }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean; type?: string; className?: string }) {
  return <label className={`checkout-field ${className}`}><span>{label}</span><input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>;
}

function DeliveryChoice({ checked, onChange, title, detail, price }: { checked: boolean; onChange: () => void; title: string; detail: string; price: string }) {
  return <label className={`delivery-choice ${checked ? "is-selected" : ""}`}><input type="radio" name="delivery" checked={checked} onChange={onChange} /><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-[#34454C]">{title}</span><span className="mt-1 block text-[11px] leading-4 font-medium text-[#75827C]">{detail}</span></span><span className="text-xs font-black text-[#C9532B]">{price}</span></label>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between font-semibold text-[#667571]"><span>{label}</span><span className="font-extrabold text-[#33434A]">{value}</span></div>;
}

function SummaryPoint({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return <div className="rounded-2xl bg-[#FBF7F1] p-3"><Icon className="h-4 w-4 text-[#C9532B]" /><span className="mt-3 block text-[10px] font-extrabold tracking-[0.12em] text-[#87918C] uppercase">{label}</span><span className="mt-1 block text-xs font-extrabold text-[#34454C]">{value}</span></div>;
}
