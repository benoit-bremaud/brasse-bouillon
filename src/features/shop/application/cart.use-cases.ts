import type { LocalCartItem } from "@/features/shop/domain/cart.types";

export function addLocalCartItem(
  currentItems: LocalCartItem[],
  itemToAdd: LocalCartItem,
): LocalCartItem[] {
  if (itemToAdd.quantity <= 0) {
    return currentItems;
  }

  const existingIndex = currentItems.findIndex(
    (item) => item.key === itemToAdd.key,
  );

  if (existingIndex === -1) {
    return [...currentItems, itemToAdd];
  }

  const updatedItems = [...currentItems];
  const existingItem = updatedItems[existingIndex];

  updatedItems[existingIndex] = {
    ...existingItem,
    quantity: existingItem.quantity + itemToAdd.quantity,
  };

  return updatedItems;
}

export function addLocalCartItems(
  currentItems: LocalCartItem[],
  itemsToAdd: LocalCartItem[],
): LocalCartItem[] {
  return itemsToAdd.reduce(
    (accumulator, item) => addLocalCartItem(accumulator, item),
    currentItems,
  );
}

export function getLocalCartLineCount(items: LocalCartItem[]): number {
  return items.length;
}

export function getLocalCartTotalQuantity(items: LocalCartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
