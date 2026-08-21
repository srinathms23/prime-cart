/** PRIME CART — shared browser storage for lightweight storefront interactions. */
export const CART_STORAGE_KEY = "prime-cart-cart";
export const WISHLIST_STORAGE_KEY = "prime-cart-wishlist";

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
