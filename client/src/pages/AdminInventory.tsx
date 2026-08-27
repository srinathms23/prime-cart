import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout, { type DashboardNavItem } from "@/components/DashboardLayout";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { AlertTriangle, Boxes, CircleOff, Home, PackageCheck, PackagePlus, Pencil, ShieldCheck, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

type ProductForm = {
  brand: string;
  name: string;
  category: string;
  price: string;
  image: string;
  imageSourceUrl: string;
  stockQuantity: string;
  colors: string;
  specifications: string;
  isActive: boolean;
};

const emptyForm: ProductForm = { brand: "", name: "", category: "Furniture", price: "", image: "", imageSourceUrl: "", stockQuantity: "0", colors: "", specifications: "", isActive: true };
const navigation: DashboardNavItem[] = [
  { icon: Boxes, label: "Inventory", path: "/admin" },
  { icon: PackageCheck, label: "Fulfilment", path: "/admin/orders" },
  { icon: Home, label: "Marketplace", path: "/" },
];

const parseSpecs = (source: string) => source.split("\n").map((row) => row.trim()).filter(Boolean).map((row) => {
  const [label, ...parts] = row.split(":");
  return { label: label.trim(), value: parts.join(":").trim() };
}).filter((item) => item.label && item.value);

const price = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function AdminInventory() {
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const inventory = trpc.inventory.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const stockOverview = trpc.inventory.stockOverview.useQuery(undefined, { enabled: isAdmin });
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const refreshInventory = () => {
    void utils.inventory.listAdmin.invalidate();
    void utils.inventory.stockOverview.invalidate();
  };
  const create = trpc.inventory.create.useMutation({ onSuccess: () => { refreshInventory(); toast.success("Inventory product added"); } });
  const update = trpc.inventory.update.useMutation({ onSuccess: () => { refreshInventory(); toast.success("Inventory product updated"); } });
  const remove = trpc.inventory.remove.useMutation({ onSuccess: () => { refreshInventory(); toast.success("Inventory product removed"); } });

  const editingProduct = useMemo(() => inventory.data?.find((product) => product.id === editingId), [editingId, inventory.data]);
  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => { setEditingId(null); setForm(emptyForm); };
  const beginEdit = (product: NonNullable<typeof inventory.data>[number]) => {
    setEditingId(product.id);
    setForm({
      brand: product.brand,
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      imageSourceUrl: product.imageSourceUrl ?? "",
      stockQuantity: String(product.stockQuantity),
      colors: product.colors.join(", "),
      specifications: product.specifications.map((item) => `${item.label}: ${item.value}`).join("\n"),
      isActive: product.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const listedPrice = Number(form.price);
    const product = {
      brand: form.brand.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: listedPrice,
      originalPrice: listedPrice,
      offer: "Transparent price",
      delivery: "Free delivery",
      image: form.image.trim(),
      imageSourceUrl: form.imageSourceUrl.trim() || null,
      tone: "bg-[#E8EEF1]",
      popularity: 0,
      badge: form.category.trim(),
      colors: form.colors.split(",").map((color) => color.trim()).filter(Boolean),
      specifications: parseSpecs(form.specifications),
      stockQuantity: Math.max(0, Number(form.stockQuantity) || 0),
      isActive: form.isActive,
    };
    if (editingId) update.mutate({ id: editingId, product }, { onSuccess: resetForm });
    else create.mutate(product, { onSuccess: resetForm });
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#FFFDF9] text-sm font-bold text-[#687570]">Loading workspace…</main>;
  if (!isAuthenticated) return <AccessPrompt onSignIn={startLogin} title="Admin access" message="Sign in to access your product management workspace." />;
  if (!isAdmin) return <main className="grid min-h-screen place-items-center bg-[#FFFDF9] p-6"><section className="max-w-md rounded-[30px] border border-[#E8DED3] bg-white p-9 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-[#C9532B]" /><h1 className="font-display mt-5 text-4xl">Admin access only.</h1><p className="mt-3 text-sm leading-6 font-medium text-[#687570]">This workspace is available only to PRIME CART administrators.</p><Link href="/" className="mt-7 inline-flex h-12 items-center rounded-2xl bg-[#17232B] px-5 text-sm font-extrabold text-white">Return to marketplace</Link></section></main>;

  const overview = stockOverview.data;
  const threshold = overview?.threshold ?? 5;
  return <DashboardLayout menuItems={navigation} title="PRIME CART Admin"><div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-col gap-3 border-b border-[#E8DED3] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Admin workspace</p><h1 className="section-title mt-2">Inventory, <em>kept clear.</em></h1><p className="mt-2 text-sm font-medium text-[#687570]">Manage on-hand quantities and respond to products running low.</p></div><Link href="/admin/orders" className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E2DBD2] bg-white px-4 text-sm font-extrabold text-[#42535A] transition hover:border-[#17232B]">Manage fulfilment</Link></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Active products" value={overview?.activeProductCount ?? "—"} icon={Boxes} tone="bg-[#EEF2EB] text-[#4E6C53]" /><Metric label="Units on hand" value={overview?.totalUnits ?? "—"} icon={PackagePlus} tone="bg-[#EAF0F3] text-[#476777]" /><Metric label="Low stock" value={overview?.lowStockCount ?? "—"} icon={AlertTriangle} tone="bg-[#FFF1E9] text-[#C35A32]" /><Metric label="Out of stock" value={overview?.outOfStockCount ?? "—"} icon={CircleOff} tone="bg-[#F7E8E8] text-[#AD4B4B]" /></section>
    {overview?.lowStockCount ? <section className="rounded-[26px] border border-[#F0D2C5] bg-[#FFF8F4] p-5 shadow-[0_10px_28px_rgba(195,90,50,0.06)] sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FBE4D7] text-[#C9532B]"><AlertTriangle className="h-5 w-5" /></span><div><p className="eyebrow text-[#B65431]">Restock attention</p><h2 className="font-display mt-1 text-2xl">{overview.lowStockCount} items at or below {threshold} units.</h2></div></div><p className="text-sm font-bold text-[#8A6758]">Select an item to update its on-hand quantity.</p></div><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{overview.products.slice(0, 6).map((product) => <button type="button" key={product.id} onClick={() => beginEdit(product)} className="flex items-center gap-3 rounded-2xl border border-[#F0D9CF] bg-white p-3 text-left transition hover:border-[#EF6A3A]"><img src={product.image} alt="" className="h-10 w-10 rounded-xl object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-[#34454A]">{product.name}</span><span className="mt-0.5 block text-xs font-bold text-[#C9532B]">{product.stockQuantity} units remaining</span></span></button>)}</div></section> : null}
    <section className="rounded-[26px] border border-[#E8DED3] bg-white p-5 shadow-[0_10px_30px_rgba(23,35,43,0.05)] sm:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">{editingId ? "Edit product" : "New inventory item"}</p><h2 className="font-display mt-1 text-3xl">{editingProduct ? editingProduct.name : "Add a product"}</h2></div>{editingId ? <button type="button" onClick={resetForm} className="grid h-10 w-10 place-items-center rounded-xl border border-[#E4DDD3] text-[#5D6C68] transition hover:text-[#C9532B]" aria-label="Cancel product editing"><X className="h-4 w-4" /></button> : null}</div><form onSubmit={submit} className="grid gap-4 lg:grid-cols-3"><Field label="Brand" value={form.brand} onChange={(value) => updateForm("brand", value)} required /><Field label="Product name" value={form.name} onChange={(value) => updateForm("name", value)} required /><Field label="Category" value={form.category} onChange={(value) => updateForm("category", value)} required /><Field label="Price (₹)" value={form.price} onChange={(value) => updateForm("price", value)} inputMode="numeric" required /><Field label="Stock quantity" value={form.stockQuantity} onChange={(value) => updateForm("stockQuantity", value)} inputMode="numeric" required /><Field label="Colours (comma-separated)" value={form.colors} onChange={(value) => updateForm("colors", value)} /><div className="lg:col-span-3"><Field label="Product image URL or managed asset path" value={form.image} onChange={(value) => updateForm("image", value)} required /><p className="mt-1 text-xs font-medium text-[#7B8882]">Use a hosted original product image or a managed `/manus-storage/` path.</p></div><div className="lg:col-span-3"><Field label="Original image source URL (optional)" value={form.imageSourceUrl} onChange={(value) => updateForm("imageSourceUrl", value)} /></div><label className="lg:col-span-3"><span className="text-[10px] font-extrabold tracking-[0.12em] text-[#6B7873] uppercase">Specifications (one per line: Label: Value)</span><textarea value={form.specifications} onChange={(event) => updateForm("specifications", event.target.value)} className="mt-2 min-h-[100px] w-full rounded-xl border border-[#E5DED5] bg-[#FBF9F5] p-3 text-sm font-semibold outline-none transition focus:border-[#EF6A3A]" placeholder="Material: Solid wood\nDimensions: 100 × 50 cm" /></label><label className="flex items-center gap-3 text-sm font-extrabold text-[#42535A]"><input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} className="h-4 w-4 accent-[#EF6A3A]" /> Available in marketplace</label><div className="flex items-end gap-3 lg:justify-end"><button type="button" onClick={resetForm} className="h-11 rounded-xl border border-[#DED7CE] px-4 text-sm font-extrabold text-[#52615E]">Reset</button><button type="submit" disabled={create.isPending || update.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#17232B] px-4 text-sm font-extrabold text-white transition hover:bg-[#EF6A3A] disabled:opacity-60"><PackagePlus className="h-4 w-4" /> {editingId ? "Save changes" : "Add product"}</button></div></form></section>
    <section className="overflow-hidden rounded-[26px] border border-[#E8DED3] bg-white shadow-[0_10px_30px_rgba(23,35,43,0.05)]"><div className="flex items-center justify-between border-b border-[#EEE7DE] px-6 py-5"><div><p className="eyebrow">Current inventory</p><h2 className="font-display mt-1 text-3xl">{inventory.data?.length ?? 0} managed products</h2></div></div><div className="divide-y divide-[#EEE7DE]">{inventory.isLoading ? <p className="p-6 text-sm font-semibold text-[#6B7873]">Loading inventory…</p> : inventory.data?.map((product) => <div key={product.id} className="grid gap-4 p-5 sm:grid-cols-[76px_1fr_auto] sm:items-center"><img src={product.image} alt={product.name} className="h-[76px] w-[76px] rounded-2xl border border-[#E7DED4] bg-[#F7F2EB] object-cover p-1" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-extrabold text-[#293A40]">{product.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${product.isActive ? "bg-[#E8F0E7] text-[#517151]" : "bg-[#F4E7DE] text-[#B85A38]"}`}>{product.isActive ? "Live" : "Hidden"}</span>{product.isActive && product.stockQuantity <= threshold ? <span className="rounded-full bg-[#FFF0E7] px-2 py-1 text-[10px] font-extrabold text-[#C9532B]">Low stock</span> : null}</div><p className="mt-1 text-xs font-bold text-[#74817C]">{product.brand} · {product.category} · {price(product.price)} · {product.stockQuantity} in stock</p></div><div className="flex gap-2"><button type="button" onClick={() => beginEdit(product)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#E3DBD2] text-[#405159] transition hover:border-[#17232B] hover:bg-[#17232B] hover:text-white" aria-label={`Edit ${product.name}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => { if (window.confirm(`Remove ${product.name} from inventory?`)) remove.mutate({ id: product.id }); }} className="grid h-10 w-10 place-items-center rounded-xl border border-[#E9D5D0] text-[#C9532B] transition hover:bg-[#C9532B] hover:text-white" aria-label={`Remove ${product.name}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section></div></DashboardLayout>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: typeof Boxes; tone: string }) {
  return <div className="rounded-[22px] border border-[#E8DED3] bg-white p-5 shadow-[0_8px_22px_rgba(23,35,43,0.04)]"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span><p className="mt-4 text-[10px] font-extrabold tracking-[0.12em] text-[#78857F] uppercase">{label}</p><p className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#24343A]">{value}</p></div>;
}

function Field({ label, value, onChange, required, inputMode }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; inputMode?: "numeric" }) {
  return <label><span className="text-[10px] font-extrabold tracking-[0.12em] text-[#6B7873] uppercase">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} required={required} inputMode={inputMode} className="mt-2 h-11 w-full rounded-xl border border-[#E5DED5] bg-[#FBF9F5] px-3 text-sm font-semibold outline-none transition focus:border-[#EF6A3A]" /></label>;
}

function AccessPrompt({ title, message, onSignIn }: { title: string; message: string; onSignIn: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#FFFDF9] p-6"><section className="max-w-md rounded-[30px] border border-[#E8DED3] bg-white p-9 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-[#C9532B]" /><h1 className="font-display mt-5 text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 font-medium text-[#687570]">{message}</p><button type="button" onClick={onSignIn} className="mt-7 h-12 rounded-2xl bg-[#17232B] px-5 text-sm font-extrabold text-white">Sign in</button></section></main>;
}
