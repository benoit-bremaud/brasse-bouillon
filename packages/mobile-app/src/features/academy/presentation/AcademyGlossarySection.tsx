import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { GlossaryTerm } from "../domain";

type AcademyHighlightedGlossaryTermProps = {
  readonly term: GlossaryTerm;
  readonly relatedTerms: readonly GlossaryTerm[];
  readonly onRelatedTermPress: (termSlug: string) => void;
};

export function AcademyHighlightedGlossaryTerm({
  term,
  relatedTerms,
  onRelatedTermPress,
}: AcademyHighlightedGlossaryTermProps) {
  const aliases =
    term.aliases.length > 0 ? `Alias : ${term.aliases.join(", ")}` : null;

  return (
    <Card style={styles.highlightedGlossaryCard} variant="subtle">
      <Text style={styles.highlightedGlossaryEyebrow}>Terme recherché</Text>
      <Text style={styles.highlightedGlossaryTitle}>{term.label}</Text>
      <Text style={styles.highlightedGlossarySummary}>
        {term.shortDefinition}
      </Text>
      <Text style={styles.highlightedGlossaryDetails}>
        {term.detailedDefinition}
      </Text>
      {aliases ? (
        <Text style={styles.highlightedGlossaryAliases}>{aliases}</Text>
      ) : null}
      {relatedTerms.length > 0 ? (
        <View style={styles.relatedGlossarySection}>
          <Text style={styles.relatedGlossaryTitle}>Termes associés</Text>
          <View style={styles.relatedGlossaryTerms}>
            {relatedTerms.map((relatedTerm) => (
              <Pressable
                key={relatedTerm.slug}
                accessibilityRole="button"
                accessibilityLabel={`Consulter le terme associé ${relatedTerm.label}`}
                onPress={() => onRelatedTermPress(relatedTerm.slug)}
                style={styles.relatedGlossaryTerm}
              >
                <Text style={styles.relatedGlossaryTermText}>
                  {relatedTerm.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {term.sources.length > 0 ? (
        <View style={styles.glossarySourcesSection}>
          <Text style={styles.glossarySourcesTitle}>Sources</Text>
          <View style={styles.glossarySourcesList}>
            {term.sources.map((source) => (
              <View key={source.id} style={styles.glossarySourceItem}>
                <Text style={styles.glossarySourceTitle}>
                  {source.title}
                  {source.year ? ` (${source.year})` : ""}
                </Text>
                <Text style={styles.glossarySourceMeta}>
                  {[source.authors.join(", "), source.publisher]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

type AcademyGlossaryTermsListProps = {
  readonly terms: readonly GlossaryTerm[];
  readonly totalTermsCount: number;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly selectedTermSlug: string | null;
  readonly onTermPress: (termSlug: string) => void;
};

export function AcademyGlossaryTermsList({
  terms,
  totalTermsCount,
  query,
  onQueryChange,
  selectedTermSlug,
  onTermPress,
}: AcademyGlossaryTermsListProps) {
  const trimmedQuery = query.trim();
  const countLabel = trimmedQuery
    ? formatGlossarySearchCount(terms.length)
    : formatGlossaryTermsCount(totalTermsCount);

  return (
    <Card style={styles.glossaryListCard}>
      <View style={styles.glossaryListHeader}>
        <Text style={styles.glossaryListTitle}>Tous les termes</Text>
        <Text style={styles.glossaryListCount}>{countLabel}</Text>
      </View>

      <View style={styles.glossarySearchBox}>
        <TextInput
          accessibilityLabel="Rechercher un terme du glossaire"
          value={query}
          onChangeText={onQueryChange}
          placeholder="Rechercher un terme"
          placeholderTextColor={colors.neutral.muted}
          style={styles.glossarySearchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          maxLength={80}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche du glossaire"
            onPress={() => onQueryChange("")}
            style={styles.glossarySearchClearButton}
          >
            <Text style={styles.glossarySearchClearText}>Effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {terms.length > 0 ? (
        <View style={styles.glossaryTermsList}>
          {terms.map((term) => {
            const selected = term.slug === selectedTermSlug;

            return (
              <Pressable
                key={term.slug}
                accessibilityRole="button"
                accessibilityLabel={`Consulter le terme ${term.label}`}
                accessibilityState={{ selected }}
                onPress={() => onTermPress(term.slug)}
                style={[
                  styles.glossaryTermItem,
                  selected && styles.glossaryTermItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.glossaryTermTitle,
                    selected && styles.glossaryTermTitleSelected,
                  ]}
                >
                  {term.label}
                </Text>
                <Text style={styles.glossaryTermSummary}>
                  {term.shortDefinition}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.glossaryEmptyText}>
          Aucun terme ne correspond à cette recherche.
        </Text>
      )}
    </Card>
  );
}

function formatGlossaryTermsCount(count: number): string {
  return count > 1 ? `${count} termes` : `${count} terme`;
}

function formatGlossarySearchCount(count: number): string {
  return count === 1 ? `${count} terme trouvé` : `${count} termes trouvés`;
}

const styles = StyleSheet.create({
  highlightedGlossaryCard: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightedGlossaryEyebrow: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossarySummary: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossaryDetails: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  highlightedGlossaryAliases: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  relatedGlossarySection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  relatedGlossaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  relatedGlossaryTerms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  relatedGlossaryTerm: {
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  relatedGlossaryTermText: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossarySourcesSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  glossarySourcesTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  glossarySourcesList: {
    gap: spacing.xs,
  },
  glossarySourceItem: {
    borderLeftWidth: spacing.xxs,
    borderLeftColor: colors.neutral.border,
    paddingLeft: spacing.xs,
  },
  glossarySourceTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossarySourceMeta: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossaryListCard: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  glossaryListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  glossaryListTitle: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  glossaryListCount: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossaryTermsList: {
    gap: spacing.xs,
  },
  glossarySearchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  glossarySearchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    paddingVertical: 0,
  },
  glossarySearchClearButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  glossarySearchClearText: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossaryTermItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  glossaryTermItemSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.state.infoBackground,
  },
  glossaryTermTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  glossaryTermTitleSelected: {
    color: colors.brand.primary,
  },
  glossaryTermSummary: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossaryEmptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
