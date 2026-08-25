import type { CartItem } from "./electronics-catalogue";

type CartQuantity = Pick<CartItem, "id" | "quantity">;

export function cartFingerprint(items: CartQuantity[]) {
  return items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join("|");
}

export function shouldHydrateRemoteCart(previousFingerprint: string | null, remoteItems: CartQuantity[]) {
  return previousFingerprint !== cartFingerprint(remoteItems);
}

export function mergeCartItems(localItems: CartItem[], remoteItems: CartItem[]) {
  const merged = new Map(remoteItems.map((item) => [item.id, item]));
  localItems.forEach((item) => {
    const remote = merged.get(item.id);
    merged.set(item.id, remote ? { ...remote, ...item, quantity: Math.max(remote.quantity, item.quantity) } : item);
  });
  return Array.from(merged.values());
}
