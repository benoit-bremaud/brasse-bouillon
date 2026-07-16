import React from "react";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

import { useNavBarClearance } from "@/core/ui/use-nav-bar-clearance";

/**
 * `FlatList` that clears the flush navigation bar on its own (ADR-0029,
 * clause 4) — the virtualised counterpart to `ScreenScrollView`, with the same
 * contract. Use it instead of a raw `FlatList` on any in-app screen.
 *
 * Stays generic over the item type so callers keep full inference on
 * `data` / `renderItem`.
 */
export function ScreenFlatList<ItemT>({
  contentContainerStyle,
  ...props
}: FlatListProps<ItemT>) {
  const clearance = useNavBarClearance();
  return (
    <FlatList
      {...props}
      contentContainerStyle={StyleSheet.compose(contentContainerStyle, {
        paddingBottom: clearance,
      })}
    />
  );
}
