import type { LocalCartItem } from "@/features/shop/domain/cart.types";

function isFinitePositiveQuantity(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function addLocalCartItem(
  currentItems: LocalCartItem[],
  itemToAdd: LocalCartItem,
): LocalCartItem[] {
  if (!isFinitePositiveQuantity(itemToAdd.quantity)) {
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
  const existingQuantity = isFinitePositiveQuantity(existingItem.quantity)
    ? existingItem.quantity
    : 0;

  updatedItems[existingIndex] = {
    ...existingItem,
    quantity: existingQuantity + itemToAdd.quantity,
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
  return items.reduce(
    (total, item) =>
      total + (isFinitePositiveQuantity(item.quantity) ? item.quantity : 0),
    0,
  );
}
