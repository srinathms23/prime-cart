import type { ElectronicsCategory, Product } from "./electronics-catalogue";

export type CatalogueSortOrder = "newest" | "price-low" | "price-high" | "category";
export type CataloguePriceRange = "all" | "under-10k" | "10k-50k" | "50k-100k" | "100k-plus";
export type CatalogueCategory = "all" | ElectronicsCategory;

export function filterCatalogueProducts(products: Product[], { search, category, priceRange, sortOrder }: { search: string; category: CatalogueCategory; priceRange: CataloguePriceRange; sortOrder: CatalogueSortOrder }) {
  const query = search.trim().toLowerCase();
  return products.filter((product) => {
    const matchingText = !query || [product.name, product.brand, product.category, ...product.specifications.map((specification) => specification.value)].join(" ").toLowerCase().includes(query);
    const matchingCategory = category === "all" || product.category === category;
    const matchingPrice = priceRange === "all"
      || (priceRange === "under-10k" && product.price < 10000)
      || (priceRange === "10k-50k" && product.price >= 10000 && product.price < 50000)
      || (priceRange === "50k-100k" && product.price >= 50000 && product.price < 100000)
      || (priceRange === "100k-plus" && product.price >= 100000);
    return matchingText && matchingCategory && matchingPrice;
  }).sort((left, right) => {
    if (sortOrder === "price-low") return left.price - right.price;
    if (sortOrder === "price-high") return right.price - left.price;
    if (sortOrder === "category") return left.category.localeCompare(right.category) || left.catalogueOrder - right.catalogueOrder;
    return left.catalogueOrder - right.catalogueOrder;
  });
}
