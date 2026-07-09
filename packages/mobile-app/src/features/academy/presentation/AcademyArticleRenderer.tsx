import { colors, radius, spacing, typography } from "@/core/theme";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import {
  AcademyArticle,
  AcademyContentBlock,
  AcademySection,
  CalloutTone,
} from "../domain";
import {
  formatAcademyCategoryLabel,
  formatAcademyLevelLabel,
  formatAcademyReadTime,
} from "./academy-display-formatters";
import React from "react";

type Props = {
  readonly article: AcademyArticle;
  readonly resolveArticleTitle?: (slug: string) => string | null;
  readonly onGlossaryPress?: (slug: string) => void;
  readonly onCalculatorPress?: (slug: string) => void;
  readonly onSectionLayout?: (sectionId: string, y: number) => void;
  readonly onSectionPress?: (sectionId: string) => void;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

export function AcademyArticleRenderer({
  article,
  resolveArticleTitle,
  onGlossaryPress,
  onCalculatorPress,
  onSectionLayout,
  onSectionPress,
  onRelatedArticlePress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{article.metadata.title}</Text>
        <Text style={styles.summary}>{article.metadata.summary}</Text>
        <View style={styles.metaRow}>
          <Badge
            label={formatAcademyLevelLabel(article.metadata.level)}
            variant="info"
          />
          <Badge
            label={formatAcademyReadTime(
              article.metadata.estimatedReadTimeMinutes,
            )}
            variant="neutral"
          />
          <Badge
            label={formatAcademyCategoryLabel(article.metadata.category)}
            variant="neutral"
          />
        </View>
      </View>

      {article.metadata.learningObjectives.length > 0 ? (
        <Card style={styles.objectivesCard} variant="subtle">
          <Text style={styles.cardTitle}>Objectifs pédagogiques</Text>
          <View style={styles.objectiveList}>
            {article.metadata.learningObjectives.map((objective) => (
              <Text key={objective} style={styles.objectiveItem}>
                {"\u2022"} {objective}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}

      {article.body.sections.length > 1 ? (
        <Card style={styles.tocCard}>
          <Text style={styles.cardTitle}>Dans cet article</Text>
          <View style={styles.tocList}>
            {article.body.sections.map((section, index) => (
              <Pressable
                key={section.id}
                accessibilityRole="button"
                accessibilityLabel={`Aller à la section ${section.title}`}
                onPress={() => onSectionPress?.(section.id)}
                style={styles.tocItem}
              >
                <Text style={styles.tocIndex}>{index + 1}</Text>
                <Text style={styles.tocText}>{section.title}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      {article.body.sections.map((section, index) => (
        <AcademySectionRenderer
          key={section.id}
          index={index}
          section={section}
          onGlossaryPress={onGlossaryPress}
          onCalculatorPress={onCalculatorPress}
          onSectionLayout={onSectionLayout}
          onRelatedArticlePress={onRelatedArticlePress}
          resolveArticleTitle={resolveArticleTitle}
        />
      ))}

      {article.metadata.sources.length > 0 ? (
        <Card style={styles.sourcesCard} variant="subtle">
          <Text style={styles.cardTitle}>Sources</Text>
          {article.metadata.sources.map((source) => (
            <View key={source.id} style={styles.sourceItem}>
              <Text style={styles.sourceTitle}>
                {source.title}
                {source.year ? ` (${source.year})` : ""}
              </Text>
              <Text style={styles.sourceText}>
                {[source.authors.join(", "), source.publisher]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

type SectionRendererProps = {
  readonly index: number;
  readonly section: AcademySection;
  readonly onGlossaryPress?: (slug: string) => void;
  readonly onCalculatorPress?: (slug: string) => void;
  readonly onSectionLayout?: (sectionId: string, y: number) => void;
  readonly resolveArticleTitle?: (slug: string) => string | null;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

function AcademySectionRenderer({
  index,
  section,
  onGlossaryPress,
  onCalculatorPress,
  onSectionLayout,
  resolveArticleTitle,
  onRelatedArticlePress,
}: SectionRendererProps) {
  const handleLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      onSectionLayout?.(section.id, event.nativeEvent.layout.y);
    },
    [onSectionLayout, section.id],
  );

  return (
    <View onLayout={handleLayout} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIndex}>{index + 1}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.blocks}>
        {section.blocks.map((block) => (
          <AcademyBlockRenderer
            key={block.id}
            block={block}
            onGlossaryPress={onGlossaryPress}
            onCalculatorPress={onCalculatorPress}
            onRelatedArticlePress={onRelatedArticlePress}
            resolveArticleTitle={resolveArticleTitle}
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
  readonly resolveArticleTitle?: (slug: string) => string | null;
  readonly onRelatedArticlePress?: (
    articleSlug: string,
    sectionId: string | null,
  ) => void;
};

function AcademyBlockRenderer({
  block,
  onGlossaryPress,
  onCalculatorPress,
  resolveArticleTitle,
  onRelatedArticlePress,
}: BlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "definition":
      return (
        <Card style={styles.definitionCard} variant="subtle">
          <Text style={styles.blockEyebrow}>Définition</Text>
          <Text style={styles.calloutTitle}>{block.term}</Text>
          <Text style={styles.paragraph}>{block.definition}</Text>
        </Card>
      );
    case "example":
      return (
        <Card style={styles.exampleCard}>
          <Text style={styles.blockEyebrow}>Exemple</Text>
          <Text style={styles.calloutTitle}>{block.title}</Text>
          <Text style={styles.paragraph}>{block.body}</Text>
        </Card>
      );
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
        <Card style={[styles.calloutCard, getCalloutToneStyle(block.tone)]}>
          <Text style={styles.calloutTone}>
            {formatCalloutTone(block.tone)}
          </Text>
          <Text style={styles.calloutTitle}>{block.title}</Text>
          <Text style={styles.paragraph}>{block.body}</Text>
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
            Lire aussi :{" "}
            {resolveArticleTitle?.(block.articleSlug) ??
              formatArticleSlugLabel(block.articleSlug)}
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
  objectivesCard: {
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  objectiveList: {
    gap: spacing.xs,
  },
  objectiveItem: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textPrimary,
  },
  tocCard: {
    gap: spacing.sm,
  },
  tocList: {
    gap: spacing.xs,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tocIndex: {
    minWidth: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.state.warningBackground,
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: 28,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  tocText: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  sectionIndex: {
    minWidth: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand.secondary,
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: 32,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  sectionTitle: {
    flex: 1,
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
    borderLeftWidth: spacing.xxs,
  },
  definitionCard: {
    gap: spacing.xs,
    borderLeftWidth: spacing.xxs,
    borderLeftColor: colors.brand.secondary,
    backgroundColor: colors.state.infoBackground,
  },
  exampleCard: {
    gap: spacing.xs,
    borderLeftWidth: spacing.xxs,
    borderLeftColor: colors.semantic.success,
  },
  blockEyebrow: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  calloutInfo: {
    borderLeftColor: colors.brand.secondary,
    backgroundColor: colors.state.infoBackground,
  },
  calloutTip: {
    borderLeftColor: colors.semantic.success,
    backgroundColor: colors.state.successBackground,
  },
  calloutWarning: {
    borderLeftColor: colors.semantic.warning,
    backgroundColor: colors.state.warningBackground,
  },
  calloutTechnical: {
    borderLeftColor: colors.brand.primary,
    backgroundColor: colors.semantic.info,
  },
  calloutTone: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
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
    gap: spacing.sm,
  },
  sourceItem: {
    gap: spacing.xxs,
  },
  sourceTitle: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
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

function formatArticleSlugLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCalloutTone(tone: CalloutTone): string {
  switch (tone) {
    case "info":
      return "À savoir";
    case "tip":
      return "Conseil";
    case "warning":
      return "Attention";
    case "safety":
      return "Sécurité";
    case "technical":
      return "Technique";
  }
}

function getCalloutToneStyle(tone: CalloutTone) {
  switch (tone) {
    case "warning":
    case "safety":
      return styles.calloutWarning;
    case "tip":
      return styles.calloutTip;
    case "technical":
      return styles.calloutTechnical;
    case "info":
      return styles.calloutInfo;
  }
}
