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

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85`;

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
  smartphone(101, "Apple", "iPhone 16", 69900, ["Black"], [{ label: "Storage", value: "128GB" }, { label: "RAM", value: "8GB" }, { label: "Display", value: "6.1-inch OLED" }, { label: "Camera", value: "48MP Main" }, { label: "Battery", value: "All-day battery" }], "photo-1511707171634-5f897ff02aa9"),
  smartphone(102, "Samsung", "Galaxy S25", 80999, ["Navy"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.2-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "4000mAh" }], "photo-1580910051074-3eb694886505"),
  smartphone(103, "OnePlus", "OnePlus 13", 69999, ["Black"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.82-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "6000mAh" }], "photo-1598327105666-5b89351aff97"),
  smartphone(104, "Google", "Pixel 9", 79999, ["Obsidian"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.3-inch OLED" }, { label: "Camera", value: "50MP Dual Camera" }, { label: "Battery", value: "4700mAh" }], "photo-1592750475338-74b7b21085ab"),
  smartphone(105, "Xiaomi", "Xiaomi 15", 64999, ["Green"], [{ label: "Storage", value: "512GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.36-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5240mAh" }], "photo-1565849904461-04a58ad377e0"),
  smartphone(106, "Nothing", "Nothing Phone (3)", 59999, ["White"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.7-inch AMOLED" }, { label: "Camera", value: "50MP Dual Camera" }, { label: "Battery", value: "5000mAh" }], "photo-1556656793-08538906a9f8"),
  smartphone(107, "Vivo", "Vivo X200", 65999, ["Blue"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.67-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5800mAh" }], "photo-1585060544812-6b45742d762f"),
  smartphone(108, "OPPO", "OPPO Find X8", 69999, ["Black"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.59-inch AMOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "5630mAh" }], "photo-1605236453806-6ff36851218e"),
  smartphone(109, "Realme", "Realme GT 7", 39999, ["Blue"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.78-inch AMOLED" }, { label: "Camera", value: "50MP" }, { label: "Battery", value: "7000mAh" }], "photo-1601784551446-20c9e07cdbdb"),
  smartphone(110, "Motorola", "Motorola Edge 60 Pro", 39999, ["Purple"], [{ label: "Storage", value: "256GB" }, { label: "RAM", value: "12GB" }, { label: "Display", value: "6.7-inch pOLED" }, { label: "Camera", value: "50MP Triple Camera" }, { label: "Battery", value: "6000mAh" }], "photo-1523206489230-c012c64b2b48"),
  laptop(111, "Apple", "MacBook Air M4", 99900, "Laptop", ["Midnight"], [{ label: "Processor", value: "Apple M4" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "256GB SSD" }, { label: "Display", value: "13.6-inch Retina" }, { label: "Graphics", value: "Integrated" }], "photo-1517336714731-489689fd1ca8"),
  laptop(112, "Dell", "Inspiron 14", 64990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD+" }, { label: "Graphics", value: "Integrated" }], "photo-1496181133206-80ce9b88a853"),
  laptop(113, "HP", "Pavilion 14", 67990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD" }, { label: "Graphics", value: "Intel Graphics" }], "photo-1525547719571-a2d4ac8945e2"),
  laptop(114, "Lenovo", "IdeaPad Slim 5", 62999, "Laptop", ["Arctic Grey"], [{ label: "Processor", value: "AMD Ryzen 7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch FHD" }, { label: "Graphics", value: "Integrated" }], "photo-1516321318423-f06f85e504b3"),
  laptop(115, "ASUS", "Vivobook 15", 59990, "Laptop", ["Silver"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch OLED" }, { label: "Graphics", value: "Integrated" }], "photo-1504707748692-419802cf939d"),
  laptop(116, "Acer", "Aspire 5", 54990, "Laptop", ["Grey"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch FHD" }, { label: "Graphics", value: "Intel Graphics" }], "photo-1541807084-5c52b6b3adef"),
  laptop(117, "MSI", "Modern 14", 58990, "Laptop", ["Black"], [{ label: "Processor", value: "Intel Core i5" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "14-inch FHD" }, { label: "Graphics", value: "Integrated" }], "photo-1496181133206-80ce9b88a853"),
  laptop(118, "ASUS", "ROG Strix G16", 119990, "Gaming Laptop", ["Eclipse Gray"], [{ label: "Processor", value: "Intel Core i7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "1TB SSD" }, { label: "Display", value: "16-inch 165Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "photo-1603302576837-37561b2e2302"),
  laptop(119, "Lenovo", "LOQ 15", 89990, "Gaming Laptop", ["Storm Grey"], [{ label: "Processor", value: "Intel Core i7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "1TB SSD" }, { label: "Display", value: "15.6-inch 144Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "photo-1593640408182-31c70c8268f5"),
  laptop(120, "HP", "Victus 15", 84990, "Gaming Laptop", ["Mica Silver"], [{ label: "Processor", value: "AMD Ryzen 7" }, { label: "RAM", value: "16GB" }, { label: "Storage", value: "512GB SSD" }, { label: "Display", value: "15.6-inch 144Hz" }, { label: "Graphics", value: "NVIDIA GeForce RTX" }], "photo-1600861194942-f883de0dfe96"),
  home(121, "Urban Living", "Modern 3-Seater Sofa", 24999, "Furniture", ["Beige"], [{ label: "Material", value: "Premium Fabric" }, { label: "Dimensions", value: "210 × 85 × 90 cm" }, { label: "Features", value: "Cushioned Seating, Wooden Frame, Removable Covers" }], "photo-1555041469-a586c61ea9bc"),
  home(122, "HomeCraft", "Scandinavian Coffee Table", 6499, "Furniture", ["Walnut"], [{ label: "Material", value: "Engineered Wood" }, { label: "Dimensions", value: "100 × 50 × 45 cm" }, { label: "Features", value: "Minimal Design, Scratch Resistant" }], "photo-1494438639946-1ebd1d20bf85"),
  home(123, "WoodNest", "Queen Size Wooden Bed", 29999, "Furniture", ["Natural Brown"], [{ label: "Material", value: "Solid Sheesham Wood" }, { label: "Size", value: "Queen" }, { label: "Features", value: "Strong Wooden Frame, Headboard, Storage Space" }], "photo-1505693416388-ac5ce068fe85"),
  home(124, "ComfortPro", "Ergonomic Office Chair", 8999, "Furniture", ["Black"], [{ label: "Material", value: "Mesh + Metal" }, { label: "Features", value: "Adjustable Height, Lumbar Support, Headrest" }], "photo-1505843490701-5c4b83b6e415"),
  home(125, "HomeSpace", "4-Door Storage Wardrobe", 18499, "Furniture", ["Dark Walnut"], [{ label: "Material", value: "Engineered Wood" }, { label: "Features", value: "4 Doors, Multiple Shelves, Hanging Space" }], "photo-1558997519-83ea9252edf8"),
  home(126, "Lumina", "Modern LED Ceiling Light", 3499, "Lighting", ["White"], [{ label: "Wattage", value: "36W" }, { label: "Light", value: "Warm White + Cool White" }, { label: "Features", value: "Energy Efficient, Remote Control, Dimmable" }], "photo-1513506003901-1e6a229e2d15"),
  home(127, "GlowTech", "Smart Table Lamp", 1999, "Lighting", ["White"], [{ label: "Wattage", value: "12W" }, { label: "Light", value: "RGB + Warm White" }, { label: "Connectivity", value: "Wi-Fi" }, { label: "Features", value: "App Control, Voice Control, Adjustable Brightness" }], "photo-1507473885765-e6ed057f782c"),
  home(128, "CasaGlow", "Decorative Floor Lamp", 4999, "Lighting", ["Gold + Cream"], [{ label: "Material", value: "Metal + Fabric" }, { label: "Height", value: "150 cm" }, { label: "Light", value: "Warm White" }, { label: "Features", value: "Modern Design, Bedroom/Living Room" }], "photo-1540932239986-30128078f3c5"),
  home(129, "DecoNest", "6-Piece Home Decor Set", 2499, "Home Decor", ["Beige + Brown"], [{ label: "Material", value: "Ceramic + Wood" }, { label: "Includes", value: "Vase, Photo Frame, Candle Holder, Decorative Objects" }, { label: "Features", value: "Premium Finish, Modern Design" }], "photo-1618221195710-dd6b41faaea6"),
  home(130, "HomeAura", "Smart Aroma Diffuser", 2999, "Home & Living", ["White"], [{ label: "Capacity", value: "300ml" }, { label: "Power", value: "12W" }, { label: "Features", value: "LED Mood Light, Timer, Auto Shut-Off" }], "photo-1603006905003-be475563bc59"),
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
