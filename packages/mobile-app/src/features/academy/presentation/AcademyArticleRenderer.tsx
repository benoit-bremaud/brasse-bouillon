import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { AcademyArticle, AcademyContentBlock, AcademySection } from "../domain";

type Props = {
  readonly article: AcademyArticle;
  readonly onGlossaryPress?: (slug: string) => void;
  readonly onCalculatorPress?: (slug: string) => void;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

export function AcademyArticleRenderer({
  article,
  onGlossaryPress,
  onCalculatorPress,
  onRelatedArticlePress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{article.metadata.title}</Text>
        <Text style={styles.summary}>{article.metadata.summary}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{article.metadata.level}</Text>
          <Text style={styles.meta}>
            {article.metadata.estimatedReadTimeMinutes} min
          </Text>
          <Text style={styles.meta}>{article.metadata.category}</Text>
        </View>
      </View>

      {article.body.sections.map((section) => (
        <AcademySectionRenderer
          key={section.id}
          section={section}
          onGlossaryPress={onGlossaryPress}
          onCalculatorPress={onCalculatorPress}
          onRelatedArticlePress={onRelatedArticlePress}
        />
      ))}

      {article.metadata.sources.length > 0 ? (
        <Card style={styles.sourcesCard} variant="subtle">
          <Text style={styles.sourcesTitle}>Sources</Text>
          {article.metadata.sources.map((source) => (
            <Text key={source.id} style={styles.sourceText}>
              {source.title}
              {source.year ? ` (${source.year})` : ""}
            </Text>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

type SectionRendererProps = {
  readonly section: AcademySection;
  readonly onGlossaryPress?: (slug: string) => void;
  readonly onCalculatorPress?: (slug: string) => void;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

function AcademySectionRenderer({
  section,
  onGlossaryPress,
  onCalculatorPress,
  onRelatedArticlePress,
}: SectionRendererProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.blocks}>
        {section.blocks.map((block) => (
          <AcademyBlockRenderer
            key={block.id}
            block={block}
            onGlossaryPress={onGlossaryPress}
            onCalculatorPress={onCalculatorPress}
            onRelatedArticlePress={onRelatedArticlePress}
          />
        ))}
      </View>
    </View>
  );
}

type BlockRendererProps = {
  readonly block: AcademyContentBlock;
  readonly onGlossaryPress?: (slug: string) => void;
  readonly onCalculatorPress?: (slug: string) => void;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

function AcademyBlockRenderer({
  block,
  onGlossaryPress,
  onCalculatorPress,
  onRelatedArticlePress,
}: BlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "heading":
      return (
        <Text
          style={[
            styles.blockHeading,
            block.level === 3 && styles.blockHeadingLevelThree,
            block.level === 4 && styles.blockHeadingLevelFour,
          ]}
        >
          {block.text}
        </Text>
      );
    case "bulletList":
      return (
        <View style={styles.bulletList}>
          {block.items.map((item) => (
            <Text key={item} style={styles.bulletItem}>
              {"\u2022"} {item}
            </Text>
          ))}
        </View>
      );
    case "table":
      return (
        <View style={styles.table}>
          {block.caption ? (
            <Text style={styles.tableCaption}>{block.caption}</Text>
          ) : null}
          <View style={styles.tableRow}>
            {block.columns.map((column) => (
              <Text key={column} style={[styles.tableCell, styles.tableHeader]}>
                {column}
              </Text>
            ))}
          </View>
          {block.rows.map((row, rowIndex) => (
            <View key={`${block.id}-${rowIndex}`} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <Text
                  key={`${block.id}-${rowIndex}-${cellIndex}`}
                  style={styles.tableCell}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case "formula":
      return (
        <Card style={styles.calloutCard} variant="subtle">
          <Text style={styles.calloutTitle}>{block.label}</Text>
          <Text style={styles.codeText}>{block.expression}</Text>
          {block.variables.map((variable) => (
            <Text key={variable.symbol} style={styles.meta}>
              {variable.symbol}: {variable.label}
              {variable.unit ? ` (${variable.unit})` : ""}
            </Text>
          ))}
        </Card>
      );
    case "callout":
      return (
        <Card style={styles.calloutCard} variant="subtle">
          <Text style={styles.calloutTitle}>{block.title}</Text>
          <Text style={styles.paragraph}>{block.body}</Text>
          <Text style={styles.meta}>{block.tone}</Text>
        </Card>
      );
    case "diagram":
      return (
        <Card style={styles.calloutCard}>
          <Text style={styles.calloutTitle}>{block.title}</Text>
          <Text style={styles.paragraph}>{block.description}</Text>
          <Text
            accessibilityLabel={block.accessibilityLabel}
            style={styles.meta}
          >
            Diagramme
          </Text>
        </Card>
      );
    case "glossaryReference":
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => onGlossaryPress?.(block.termSlug)}
          style={styles.inlineCta}
        >
          <Text style={styles.inlineCtaText}>{block.label}</Text>
        </Pressable>
      );
    case "calculatorCta":
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => onCalculatorPress?.(block.calculatorSlug)}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaTitle}>{block.title}</Text>
          <Text style={styles.ctaDescription}>{block.description}</Text>
        </Pressable>
      );
    case "relatedArticle":
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onRelatedArticlePress?.(block.articleSlug, block.sectionId)
          }
          style={styles.inlineCta}
        >
          <Text style={styles.inlineCtaText}>
            Lire aussi: {block.articleSlug}
          </Text>
        </Pressable>
      );
    case "sourceReference":
      return (
        <Text style={styles.sourceText}>
          Source: {block.sourceId}
          {block.note ? ` - ${block.note}` : ""}
        </Text>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  summary: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  meta: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  blocks: {
    gap: spacing.sm,
  },
  paragraph: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textPrimary,
  },
  blockHeading: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  blockHeadingLevelThree: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  blockHeadingLevelFour: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  bulletList: {
    gap: spacing.xs,
  },
  bulletItem: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textPrimary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  tableCaption: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
    padding: spacing.xs,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textPrimary,
    flex: 1,
    padding: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  tableHeader: {
    fontWeight: typography.weight.bold,
    backgroundColor: colors.state.infoBackground,
  },
  calloutCard: {
    gap: spacing.xs,
  },
  calloutTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  codeText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  inlineCta: {
    alignSelf: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.state.infoBackground,
  },
  inlineCtaText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  ctaCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.state.warningBackground,
  },
  ctaTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  ctaDescription: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
  },
  sourcesCard: {
    gap: spacing.xs,
  },
  sourcesTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  sourceText: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
  },
});
