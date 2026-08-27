export type ElectronicsCategory = "Smartphone" | "Laptop" | "Gaming Laptop" | "Furniture" | "Lighting" | "Home Decor" | "Home & Living";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: number;
  brand: string;
  name: string;
  category: ElectronicsCategory;
  price: number;
  originalPrice: number;
  offer: string;
  delivery: string;
  image: string;
  tone: string;
  popularity: number;
  badge?: string;
  colors: string[];
  specifications: ProductSpecification[];
  catalogueOrder: number;
};

export type ProductSnapshot = {
  productId: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  offer: string;
  delivery: string;
  image: string;
  tone: string;
  popularity: number;
  badge?: string | null;
};

export type CartItem = Product & { quantity: number };

const image = (path: string) => path;

const palette = ["bg-[#E8EEF1]", "bg-[#F2E8DD]", "bg-[#E5EBE5]", "bg-[#ECE7F1]", "bg-[#F1E9D9]"];

const smartphone = (id: number, brand: string, name: string, price: number, colors: string[], specifications: ProductSpecification[], photo: string): Product => ({
  id, brand, name, category: "Smartphone", price, originalPrice: price, offer: "Transparent price", delivery: "Free delivery", image: image(photo), tone: palette[id % palette.length], popularity: Math.max(1, 200 - id), badge: "Smartphone", colors, specifications, catalogueOrder: id,
});

const laptop = (id: number, brand: string, name: string, price: number, category: ElectronicsCategory, colors: string[], specifications: ProductSpecification[], photo: string): Product => ({
  id, brand, name, category, price, originalPrice: price, offer: "Transparent price", delivery: "Free delivery", image: image(photo), tone: palette[id % palette.length], popularity: Math.max(1, 200 - id), badge: category === "Gaming Laptop" ? "Performance" : "Laptop", colors, specifications, catalogueOrder: id,
});

const home = (id: number, brand: string, name: string, price: number, category: ElectronicsCategory, colors: string[], specifications: ProductSpecification[], photo: string): Product => ({
  id, brand, name, category, price, originalPrice: price, offer: "Transparent price", delivery: "Free delivery", image: image(photo), tone: palette[id % palette.length], popularity: Math.max(1, 200 - id), badge: category, colors, specifications, catalogueOrder: id,
});

export const electronicsProducts: Product[] = [
  smartphone(101, "Apple", "iPhone 16", 69900, ["Black"], [{ label: "Storage", value: "128GB" }, { label: "RAM", value: "8GB" }, { label: "Display", value: "6.1-inch OLED" }, { label: "Camera", value: "48MP Main" }, { label: "Battery", value: "All-day battery" }], "/manus-storage/iphone-16_8b01b8ae.jpg"),
  smartphone(102, "Samsung", "Galaxy S25", 80999, ["Navy"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.2-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "4000mAh" }], "/manus-storage/galaxy-s25_3a0971a7.png"),
  smartphone(103, "OnePlus", "OnePlus 13", 69999, ["Black"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.82-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "6000mAh" }], "/manus-storage/oneplus-13_7fad967f.jpg"),
  smartphone(104, "Google", "Pixel 9", 79999, ["Obsidian"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.3-inch OLED" }, { label: "Camera", value: "50MP Dual Camera" }, { label: "Battery", value: "4700mAh" }], "/manus-storage/pixel-9_97f358ea.webp"),
  smartphone(105, "Xiaomi", "Xiaomi 15", 64999, ["Green"], [{ label: "Storage", value: "512GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.36-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5240mAh" }], "/manus-storage/xiaomi-15_97f1a04f.jpg"),
  smartphone(106, "Nothing", "Nothing Phone (3)", 59999, ["White"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.7-inch AMOLED" }, { label: "Camera", value: "50MP Dual Camera" }, { label: "Battery", value: "5000mAh" }], "/manus-storage/nothing-phone-3_791395d1.png"),
  smartphone(107, "Vivo", "Vivo X200", 65999, ["Blue"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.67-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5800mAh" }], "/manus-storage/vivo-x200_4d5ee827.jpg"),
  smartphone(108, "OPPO", "OPPO Find X8", 69999, ["Black"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.59-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5630mAh" }], "/manus-storage/oppo-find-x8_60f24c23.png"),
  smartphone(109, "Realme", "Realme GT 7", 39999, ["Blue"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.78-inch AMOLED" }, { label: "Camera", value: "50MP" }, { label: "Battery", value: "7000mAh" }], "/manus-storage/realme-gt-7_df10d192.webp"),
  smartphone(110, "Motorola", "Motorola Edge 60 Pro", 39999, ["Purple"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.7-inch pOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "6000mAh" }], "/manus-storage/motorola-edge-60-pro_abfdcc86.png"),
  laptop(111, "Apple", "MacBook Air M4", 99900, "Laptop", ["Midnight"], [{ label: "Processor", value: "Apple M4" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "256GB SSD" }, { label: "Display", value: "13.6-inch Retina" }, { label: "Graphics", value: "Integrated" }], "/manus-storage/macbook-air-m4_9b4f38ca.png"),
  laptop(112, "Dell", "Inspiron 14", 64990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD+" }, { label: "Graphics", value: "Integrated" }], "/manus-storage/dell-inspiron-14_7cdd5acd.jpg"),
  laptop(113, "HP", "Pavilion 14", 67990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD" }, { label: "Graphics", value: "Intel Graphics" }], "/manus-storage/hp-pavilion-14_08f77474.jpg"),
  laptop(114, "Lenovo", "IdeaPad Slim 5", 62999, "Laptop", ["Arctic Grey"], [{ label: "Processor", value: "AMD Ryzen 7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch FHD" }, { label: "Graphics", value: "Integrated" }], "/manus-storage/lenovo-ideapad-slim-5_dae9c661.png"),
  laptop(115, "ASUS", "Vivobook 15", 59990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch OLED" }, { label: "Graphics", value: "Integrated" }], "/manus-storage/asus-vivobook-15_b4755d45.jpg"),
  laptop(116, "Acer", "Aspire 5", 54990, "Laptop", ["Grey"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch FHD" }, { label: "Graphics", value: "Intel Graphics" }], "/manus-storage/acer-aspire-5-official_9676c98f.jpg"),
  laptop(117, "MSI", "Modern 14", 58990, "Laptop", ["Black"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD" }, { label: "Graphics", value: "Integrated" }], "/manus-storage/msi-modern-14_d4042013.jpg"),
  laptop(118, "ASUS", "ROG Strix G16", 119990, "Gaming Laptop", ["Eclipse Gray"], [{ label: "Processor", value: "Intel Core i7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "1TB SSD" }, { label: "Display", value: "16-inch 165Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "/manus-storage/asus-rog-strix-g16_e301ba31.webp"),
  laptop(119, "Lenovo", "LOQ 15", 89990, "Gaming Laptop", ["Storm Grey"], [{ label: "Processor", value: "Intel Core i7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "1TB SSD" }, { label: "Display", value: "15.6-inch 144Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "/manus-storage/lenovo-loq-15_2e3cf5b1.png"),
  laptop(120, "HP", "Victus 15", 84990, "Gaming Laptop", ["Mica Silver"], [{ label: "Processor", value: "AMD Ryzen 7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch 144Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "/manus-storage/hp-victus-15-official_0c0d009b.png"),
  home(121, "Urban Living", "Modern 3-Seater Sofa", 24999, "Furniture", ["Beige"], [{ label: "Material", value: "Premium Fabric" }, { label: "Dimensions", value: "210 × 85 × 90 cm" }, { label: "Features", value: "Cushioned Seating, Wooden Frame, Removable Covers" }], "/manus-storage/modern-sofa_1c3d839b.jpg"),
  home(122, "HomeCraft", "Scandinavian Coffee Table", 6499, "Furniture", ["Walnut"], [{ label: "Material", value: "Engineered Wood" }, { label: "Dimensions", value: "100 × 50 × 45 cm" }, { label: "Features", value: "Minimal Design, Scratch Resistant" }], "/manus-storage/scandinavian-coffee-table-ikea_562a0bd6.jpg"),
  home(123, "WoodNest", "Queen Size Wooden Bed", 29999, "Furniture", ["Natural Brown"], [{ label: "Material", value: "Solid Sheesham Wood" }, { label: "Size", value: "Queen" }, { label: "Features", value: "Strong Wooden Frame, Headboard, Storage Space" }], "/manus-storage/queen-wooden-bed-ikea_dff4fbfa.jpg"),
  home(124, "ComfortPro", "Ergonomic Office Chair", 8999, "Furniture", ["Black"], [{ label: "Material", value: "Mesh + Metal" }, { label: "Features", value: "Adjustable Height, Lumbar Support, Headrest" }], "/manus-storage/ergonomic-office-chair_1c388464.jpg"),
  home(125, "HomeSpace", "4-Door Storage Wardrobe", 18499, "Furniture", ["Dark Walnut"], [{ label: "Material", value: "Engineered Wood" }, { label: "Features", value: "4 Doors, Multiple Shelves, Hanging Space" }], "/manus-storage/storage-wardrobe-ikea_b0ae6677.jpg"),
  home(126, "Lumina", "Modern LED Ceiling Light", 3499, "Lighting", ["White"], [{ label: "Wattage", value: "36W" }, { label: "Light", value: "Warm White + Cool White" }, { label: "Features", value: "Energy Efficient, Remote Control, Dimmable" }], "/manus-storage/modern-led-ceiling-light_89aedfd1.jpg"),
  home(127, "GlowTech", "Smart Table Lamp", 1999, "Lighting", ["White"], [{ label: "Wattage", value: "12W" }, { label: "Light", value: "RGB + Warm White" }, { label: "Connectivity", value: "Wi-Fi" }, { label: "Features", value: "App Control, Voice Control, Adjustable Brightness" }], "/manus-storage/smart-table-lamp_0a63a8c8.jpg"),
  home(128, "CasaGlow", "Decorative Floor Lamp", 4999, "Lighting", ["Gold + Cream"], [{ label: "Material", value: "Metal + Fabric" }, { label: "Height", value: "150 cm" }, { label: "Light", value: "Warm White" }, { label: "Features", value: "Modern Design, Bedroom/Living Room" }], "/manus-storage/decorative-floor-lamp_23de683b.jpg"),
  home(129, "DecoNest", "6-Piece Home Decor Set", 2499, "Home Decor", ["Beige + Brown"], [{ label: "Material", value: "Ceramic + Wood" }, { label: "Includes", value: "Vase, Photo Frame, Candle Holder, Decorative Objects" }, { label: "Features", value: "Premium Finish, Modern Design" }], "/manus-storage/home-decor-set_b71c2f7d.jpg"),
  home(130, "HomeAura", "Smart Aroma Diffuser", 2999, "Home & Living", ["White"], [{ label: "Capacity", value: "300ml" }, { label: "Power", value: "12W" }, { label: "Features", value: "LED Mood Light, Timer, Auto Shut-Off" }], "/manus-storage/smart-aroma-diffuser_a32c9bac.jpg"),
];

export const electronicsBrands = Array.from(new Set(electronicsProducts.map((product) => product.brand)));

export function toProductSnapshot(product: Product): ProductSnapshot {
  const { id, brand: _brand, colors: _colors, specifications: _specifications, catalogueOrder: _catalogueOrder, ...snapshot } = product;
  return { ...snapshot, popularity: Math.max(0, snapshot.popularity), productId: id, badge: product.badge ?? null };
}

export function hydrateProduct(snapshot: ProductSnapshot): Product {
  const catalogueProduct = electronicsProducts.find((product) => product.id === snapshot.productId);
  const base: Product = catalogueProduct ?? {
    id: snapshot.productId,
    brand: "PRIME CART",
    name: snapshot.name,
    category: snapshot.category as ElectronicsCategory,
    price: snapshot.price,
    originalPrice: snapshot.originalPrice,
    offer: snapshot.offer,
    delivery: snapshot.delivery,
    image: snapshot.image,
    tone: snapshot.tone,
    popularity: snapshot.popularity,
    badge: snapshot.badge ?? undefined,
    colors: [],
    specifications: [],
    catalogueOrder: snapshot.productId,
  };
  return { ...base, ...snapshot, id: snapshot.productId, category: snapshot.category as ElectronicsCategory, badge: snapshot.badge ?? base.badge };
}
