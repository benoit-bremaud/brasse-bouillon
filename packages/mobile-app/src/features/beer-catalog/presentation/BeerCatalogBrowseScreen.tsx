import React, { useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { getErrorMessage } from "@/core/http/http-error";
import { colors, spacing } from "@/core/theme";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { Screen } from "@/core/ui/Screen";

import { toBeerListItemVM } from "@/features/beer-catalog/application/beer-catalog.view-model";
import { useBeerCatalogPagination } from "@/features/beer-catalog/application/use-beer-catalog-pagination";
import {
  BROWSE_EMPTY_DESCRIPTION,
  BROWSE_EMPTY_TITLE,
  BROWSE_ERROR,
  BROWSE_SUBTITLE,
  BROWSE_TITLE,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";
import { BeerCard } from "@/features/beer-catalog/presentation/components/BeerCard";
import { CatalogListFooter } from "@/features/beer-catalog/presentation/components/CatalogListFooter";

/**
 * UC1 — Browse the beer catalogue as an infinite list, per
 * `mobile-catalog/02-sequence-browse.md` (orchestration) and
 * `mobile-catalog/07-state-list-screen.md` (derived screen states).
 * All states are derived from the TanStack flags — no hand-written FSM.
 */
export function BeerCatalogBrowseScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const {
    data,
    isLoading,
    isFetching,
    isFetched,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useBeerCatalogPagination({ mode: "browse" });

  const beers = data?.beers;
  const rows = useMemo(() => (beers ?? []).map(toBeerListItemVM), [beers]);

  // Error vs NextPageError (conception 05/07): a `fetchNextPage` failure
  // must NOT raise the full-screen error — the loaded list stays visible
  // and the footer shows the inline retry. The error is also suppressed
  // while a refetch is in flight (same pattern as recipes/CatalogScreen).
  const settledError =
    error && !isFetching && !isFetchNextPageError
      ? getErrorMessage(error, BROWSE_ERROR)
      : null;
  const showEmptyState = isFetched && !isLoading && rows.length === 0;

  const handleRefetch = () => {
    void refetch();
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <Screen
      isLoading={isLoading && rows.length === 0}
      error={settledError}
      onRetry={handleRefetch}
    >
      <ListHeader
        title={BROWSE_TITLE}
        subtitle={BROWSE_SUBTITLE}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rechercher une bière"
            // Href cast: the `app/(app)/beer-catalog/*` route files land
            // with the routing slice; typed routes do not know them yet.
            onPress={() => router.push("/(app)/beer-catalog/search" as Href)}
            style={styles.searchAction}
            testID="beer-catalog-search-action"
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={colors.brand.primary}
            />
          </Pressable>
        }
      />

      {showEmptyState ? (
        <EmptyStateCard
          title={BROWSE_EMPTY_TITLE}
          description={BROWSE_EMPTY_DESCRIPTION}
        />
      ) : null}

      <FlatList
        testID="beer-catalog-browse-list"
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BeerCard
            beer={item}
            onPress={() =>
              router.push(`/(app)/beer-catalog/beer/${item.id}` as Href)
            }
          />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <CatalogListFooter
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            hasNextPage={hasNextPage}
            itemCount={rows.length}
            onRetry={() => void fetchNextPage()}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={handleRefetch}
          />
        }
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchAction: {
    padding: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
});
