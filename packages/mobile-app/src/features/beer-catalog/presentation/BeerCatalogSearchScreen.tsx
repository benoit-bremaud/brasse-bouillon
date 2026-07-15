import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { useRouter, type Href } from "expo-router";

import { getErrorMessage } from "@/core/http/http-error";
import { spacing } from "@/core/theme";
import { BeerMugLoader } from "@/core/ui/BeerMugLoader";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { BackHeaderAction } from "@/core/ui/BackHeaderAction";
import { ListHeader } from "@/core/ui/ListHeader";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { Screen } from "@/core/ui/Screen";

import { toBeerListItemVM } from "@/features/beer-catalog/application/beer-catalog.view-model";
import {
  MIN_SEARCH_LENGTH,
  useBeerCatalogPagination,
} from "@/features/beer-catalog/application/use-beer-catalog-pagination";
import { useDebouncedValue } from "@/features/beer-catalog/application/use-debounced-value";
import {
  SEARCH_EMPTY_DESCRIPTION,
  SEARCH_EMPTY_TITLE,
  SEARCH_ERROR,
  SEARCH_PROMPT_DESCRIPTION,
  SEARCH_PROMPT_TITLE,
  SEARCH_TITLE,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";
import { BeerCard } from "@/features/beer-catalog/presentation/components/BeerCard";
import { CatalogListFooter } from "@/features/beer-catalog/presentation/components/CatalogListFooter";
import { SearchField } from "@/features/beer-catalog/presentation/components/SearchField";

/**
 * UC2 — Search a beer by name, per `mobile-catalog/03-sequence-search.md`
 * (debounce → stale result ignored) and `mobile-catalog/08-state-search-input.md`
 * (input FSM: the raw term lives here, only the debounced term reaches the
 * hook). The results list follows the same lifecycle as UC1
 * (`mobile-catalog/07-state-list-screen.md`).
 */
export function BeerCatalogSearchScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const debounced = useDebouncedValue(term);
  const settledTerm = debounced.trim();
  const isTermReady = settledTerm.length >= MIN_SEARCH_LENGTH;

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
  } = useBeerCatalogPagination({ mode: "search", query: debounced });

  const beers = data?.beers;
  const rows = useMemo(() => (beers ?? []).map(toBeerListItemVM), [beers]);

  // Same Error vs NextPageError distinction as the browse screen
  // (conception 05/07): a next-page failure keeps the results visible
  // with the inline footer retry, never the full-screen error.
  const settledError =
    error && !isFetching && !isFetchNextPageError
      ? getErrorMessage(error, SEARCH_ERROR)
      : null;

  const showPrompt = !isTermReady;
  const isInitialLoading = isLoading && rows.length === 0;
  // Mutually exclusive with a settled error (same guard as the browse
  // screen): a failed search must not also claim "no results".
  const showEmptyState =
    isFetched && !isLoading && rows.length === 0 && !settledError;

  const handleRefetch = () => {
    void refetch();
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  // The search field must stay mounted in every state (its own FSM,
  // conception 08), so the loader is inline instead of `Screen.isLoading`.
  let content: React.ReactNode;
  if (showPrompt) {
    content = (
      <EmptyStateCard
        title={SEARCH_PROMPT_TITLE}
        description={SEARCH_PROMPT_DESCRIPTION}
      />
    );
  } else if (isInitialLoading) {
    content = (
      <View style={styles.loader}>
        <BeerMugLoader size="large" />
      </View>
    );
  } else if (showEmptyState) {
    content = (
      <EmptyStateCard
        title={SEARCH_EMPTY_TITLE(settledTerm)}
        description={SEARCH_EMPTY_DESCRIPTION}
      />
    );
  } else {
    content = (
      <FlatList
        testID="beer-catalog-search-list"
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BeerCard
            beer={item}
            // Href cast: the `app/(app)/beer-catalog/*` route files land
            // with the routing slice; typed routes do not know them yet.
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
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <Screen error={settledError} onRetry={handleRefetch}>
      <ListHeader
        title={SEARCH_TITLE}
        action={<BackHeaderAction fallback="/(app)/beer-catalog" />}
      />
      <SearchField value={term} onChangeText={setTerm} />
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
});
