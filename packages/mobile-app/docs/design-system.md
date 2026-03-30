# Brasse Bouillon — Design System

Reference document for the visual language of the Brasse Bouillon app.
All screens and components must comply with these rules. No hardcoded values are allowed.

---

## 1. Color Tokens — `src/core/theme/colors.ts`

### Brand palette

| Token                     | Hex       | Usage                                                       |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `colors.brand.primary`    | `#b7824b` | Accents, icons, colored backgrounds (beer colors)           |
| `colors.brand.secondary`  | `#8d5832` | CTAs, interactive elements, links, badge borders            |
| `colors.brand.background` | `#ede2bd` | Screen background, card subtle backgrounds, icon containers |

### Semantic palette

| Token                     | Hex       | Usage                                                |
| ------------------------- | --------- | ---------------------------------------------------- |
| `colors.semantic.success` | `#7e7e31` | Success badges, "Done" statuses, positive feedback   |
| `colors.semantic.error`   | `#573921` | Error states, destructive actions                    |
| `colors.semantic.warning` | `#d9b364` | Warnings, caution indicators                         |
| `colors.semantic.info`    | `#f3f3f3` | Neutral/info badge background, Card `subtle` variant |

### Neutral palette

| Token                          | Hex       | Usage                                                   |
| ------------------------------ | --------- | ------------------------------------------------------- |
| `colors.neutral.white`         | `#ffffff` | Card background, icon foreground on colored backgrounds |
| `colors.neutral.black`         | `#000000` | Use sparingly — prefer `textPrimary`                    |
| `colors.neutral.textPrimary`   | `#1e1e1e` | Titles, primary labels, key values                      |
| `colors.neutral.textSecondary` | `#5f5a4e` | Subtitles, metadata, descriptions                       |
| `colors.neutral.border`        | `#d6c8a4` | Card borders, dividers, separator lines                 |
| `colors.neutral.muted`         | `#a7a096` | Placeholder text, chevrons, disabled state              |

### State backgrounds

| Token                            | Hex       | Usage                          |
| -------------------------------- | --------- | ------------------------------ |
| `colors.state.errorBackground`   | `#fff0f0` | Error banner/card background   |
| `colors.state.successBackground` | `#f4f8e8` | Success banner/card background |
| `colors.state.infoBackground`    | `#f8f8f8` | Neutral info card background   |

---

## 2. Typography Tokens — `src/core/theme/typography.ts`

### Font sizes

| Token                     | Value | Usage                                                 |
| ------------------------- | ----- | ----------------------------------------------------- |
| `typography.size.h1`      | `32`  | Hero titles (dashboard greeting)                      |
| `typography.size.h2`      | `24`  | Screen titles, card section headers                   |
| `typography.size.body`    | `16`  | Card titles, primary text content                     |
| `typography.size.label`   | `14`  | Metadata, secondary info, filter labels               |
| `typography.size.caption` | `12`  | Badges, timestamps, tertiary info, action button text |

### Line heights

| Token                           | Value | Paired with               |
| ------------------------------- | ----- | ------------------------- |
| `typography.lineHeight.h1`      | `38`  | `typography.size.h1`      |
| `typography.lineHeight.h2`      | `30`  | `typography.size.h2`      |
| `typography.lineHeight.body`    | `24`  | `typography.size.body`    |
| `typography.lineHeight.label`   | `20`  | `typography.size.label`   |
| `typography.lineHeight.caption` | `16`  | `typography.size.caption` |

### Font weights

| Token                       | Value   | Usage                                        |
| --------------------------- | ------- | -------------------------------------------- |
| `typography.weight.regular` | `"400"` | Body text, descriptions                      |
| `typography.weight.medium`  | `"500"` | Secondary labels, filter labels, button text |
| `typography.weight.bold`    | `"700"` | Titles, card titles, badge text, stat values |

> **Rule:** Never use raw string weights (`"600"`, `"700"`) — always use tokens.

---

## 3. Spacing Tokens — `src/core/theme/spacing.ts`

| Token         | Value | Typical usage                                                            |
| ------------- | ----- | ------------------------------------------------------------------------ |
| `spacing.xxs` | `4`   | Gap between icon and text inline, `marginTop` within a text block        |
| `spacing.xs`  | `8`   | Gap between stat items, small internal padding, `marginTop` for metadata |
| `spacing.sm`  | `12`  | Card padding (default), gap between card elements, list `marginBottom`   |
| `spacing.md`  | `16`  | Screen container padding, `paddingBottom` on lists, section spacing      |
| `spacing.lg`  | `24`  | Section top margins, `paddingBottom` on ScrollView                       |
| `spacing.xl`  | `32`  | Large section gaps, hero spacing                                         |
| `spacing.xxl` | `40`  | Extra large spacers                                                      |

> **Rule:** Never hardcode pixel values. All spacing must use `spacing.*` tokens.

---

## 4. Radius Tokens — `src/core/theme/radius.ts`

| Token         | Value  | Usage                                            |
| ------------- | ------ | ------------------------------------------------ |
| `radius.xs`   | `4`    | Small tags, minor inputs                         |
| `radius.sm`   | `8`    | Input fields, small buttons                      |
| `radius.md`   | `12`   | Icon containers, image thumbnails                |
| `radius.lg`   | `16`   | Cards (default), action buttons, list item icons |
| `radius.full` | `9999` | Badges, pill buttons, circular elements          |

---

## 5. Primitive Components — `src/core/ui/`

### `Screen`

Root container for every screen. Provides `SafeAreaView`, loading state, and error state.

```tsx
<Screen
  isLoading={boolean}     // shows ActivityIndicator centered
  error={string | null}   // shows error banner with retry
  onRetry={() => void}    // attached to retry button
>
  {/* screen content */}
</Screen>
```

> Every route screen must use `<Screen>` as its root.

### `Card`

White bordered card with shadow. Default padding: `spacing.sm` (12px).

```tsx
<Card style={...} variant="default" />  // white + shadow
<Card style={...} variant="subtle" />   // info background, no shadow
```

> Do not override `padding` in the `style` prop unless strictly necessary.
> Use `style={{ padding: spacing.md }}` explicitly when a larger padding is needed.

### `ListHeader`

Screen-level header with title, optional subtitle, and optional action slot.

```tsx
<ListHeader
  title="Mes Brassins"
  subtitle="Suivi de tes brassins"
  action={<Pressable>...</Pressable>} // optional right-side action
/>
```

> Every screen that uses `<Screen>` must start with `<ListHeader>` as the first child.

### `Badge`

Compact tag component. Text is always uppercase.

```tsx
<Badge label="Public" variant="success" />
<Badge label="En cours" variant="info" />
<Badge label="Neutre" variant="neutral" />   // default
```

Variants: `neutral` (info bg, secondary text), `info` (branded border + text), `success` (green bg + border)

### `EmptyStateCard`

Shown when a list has no items.

```tsx
<EmptyStateCard
  title="Aucun batch"
  description="Lance un batch depuis une recette."
  action={<PrimaryButton label="Recharger" onPress={reload} />}
/>
```

### `PrimaryButton`

Main CTA button.

```tsx
<PrimaryButton label="Démarrer" onPress={action} disabled={loading} />
```

---

## 6. Pattern: Écran liste

Used by: `BatchesScreen`, `RecipesScreen`, `IngredientsScreen`, `ShopCategoryScreen`

```tsx
<Screen
  isLoading={isLoading && list.length === 0}
  error={error}
  onRetry={fetch}
>
  {/* Header */}
  <View style={styles.header}>
    <ListHeader title="..." subtitle="..." />
    <Pressable
      onPress={navigate}
      style={styles.actionButton}
      accessibilityRole="button"
      accessibilityLabel="..."
    >
      <Ionicons
        name="school-outline"
        size={18}
        color={colors.brand.secondary}
      />
      <Text style={styles.actionText}>Academy</Text>
    </Pressable>
  </View>

  {/* Empty state */}
  {showEmptyState && (
    <EmptyStateCard
      title="..."
      description="..."
      action={<PrimaryButton label="Recharger" onPress={fetch} />}
    />
  )}

  {/* List */}
  <FlatList
    data={items}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.list}
    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetch} />}
    renderItem={({ item }) => (
      <Pressable onPress={() => router.push(`/route/${item.id}`)}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            {/* Colored icon */}
            <View style={[styles.itemIcon, { backgroundColor: themeColor }]}>
              <Ionicons name="..." size={24} color={colors.neutral.white} />
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Badge label="..." variant="..." />
              </View>
              <Text style={styles.cardMeta}>{item.meta}</Text>
            </View>

            {/* Chevron */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.neutral.muted}
            />
          </View>
        </Card>
      </Pressable>
    )}
  />
</Screen>
```

**Required styles:**

```ts
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.sm,
},
actionButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: radius.lg,
  backgroundColor: colors.brand.background,
  borderWidth: 1,
  borderColor: colors.brand.secondary,
},
actionText: {
  color: colors.brand.secondary,
  fontSize: typography.size.caption,
  fontWeight: typography.weight.medium,
},
list: {
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.sm,
},
card: { marginBottom: spacing.sm },
cardContent: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
itemIcon: { width: 48, height: 48, borderRadius: radius.lg, justifyContent: "center", alignItems: "center" },
cardInfo: { flex: 1 },
cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
cardTitle: { fontSize: typography.size.body, lineHeight: typography.lineHeight.body, fontWeight: typography.weight.bold, color: colors.neutral.textPrimary },
cardMeta: { fontSize: typography.size.label, color: colors.neutral.textSecondary, marginTop: spacing.xxs },
```

---

## 7. Pattern: Écran détail

Used by: `BatchDetailsScreen`, `RecipeDetailsScreen`, `IngredientDetailsScreen`

```tsx
<Screen isLoading={isLoading} error={error} onRetry={fetch}>
  {/* Screen header */}
  <ListHeader title="Titre" subtitle="sous-titre ou identifiant" />

  <ScrollView contentContainerStyle={styles.content}>
    {/* Header card */}
    {item && (
      <Card style={styles.headerCard}>
        <Text style={styles.title}>{item.name}</Text>
        {item.description && (
          <Text style={styles.subtitle}>{item.description}</Text>
        )}
        {/* optional stats grid */}
      </Card>
    )}

    {/* Section title */}
    <Text style={styles.sectionTitle}>Section</Text>

    {/* Section card */}
    <Card style={styles.sectionCard}>{/* list items inside */}</Card>

    {/* Primary action */}
    <PrimaryButton label="Action" onPress={action} />
  </ScrollView>
</Screen>
```

**Required styles (section elements):**

```ts
sectionTitle: {
  marginTop: spacing.md,
  marginBottom: spacing.xs,
  fontWeight: typography.weight.bold,
  color: colors.neutral.textPrimary,
  fontSize: typography.size.body,
  lineHeight: typography.lineHeight.body,
},
```

---

## 8. Pattern: Écran hub (Tools / Academy)

Used by: `ToolsHubScreen`, `AcademyHubScreen`

Hub screens show a scrollable list of rich topic cards with mascot images.

```tsx
<Screen>
  <ListHeader title="..." subtitle="..." />

  <ScrollView contentContainerStyle={styles.content}>
    {topics.map((topic) => (
      <Pressable key={topic.slug}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${topic.title}`}
        onPress={() => router.push(...)}
        style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressablePressed]}
      >
        <Card style={styles.card}>

          {/* Main row: mascot + info + chevron */}
          <View style={styles.cardRow}>
            <Image source={...} style={styles.mascot}
              resizeMode="cover" accessibilityRole="image" accessibilityLabel={topic.mascotAlt} />
            <View style={styles.cardInfo}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{topic.title}</Text>
                <Badge label={statusLabel} variant={statusVariant} />
              </View>
              <Text style={styles.cardMeta}>{topic.shortDescription}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.muted} />
          </View>

          {/* Secondary badges row */}
          <View style={styles.badgesRow}>
            <Badge label={topic.focus} />
            <Badge label={topic.estimatedReadTime} />
          </View>

        </Card>
      </Pressable>
    ))}
  </ScrollView>
</Screen>
```

**Required styles:**

```ts
content: { paddingBottom: spacing.lg },
cardPressable: { borderRadius: radius.lg, marginBottom: spacing.sm },
cardPressablePressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
card: { padding: spacing.md },
cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
mascot: { width: 48, height: 48, borderRadius: radius.md },
cardInfo: { flex: 1 },
cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
cardTitle: {
  color: colors.neutral.textPrimary,
  fontSize: typography.size.body,
  lineHeight: typography.lineHeight.body,
  fontWeight: typography.weight.bold,
  flex: 1,
  paddingRight: spacing.xs,
},
cardMeta: {
  color: colors.neutral.textSecondary,
  fontSize: typography.size.label,
  lineHeight: typography.lineHeight.label,
  marginTop: spacing.xxs,
},
badgesRow: {
  marginTop: spacing.sm,
  paddingTop: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: colors.neutral.border,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
},
```

---

## 9. Icon conventions — Ionicons

| Feature            | Icon                 | Context                                            |
| ------------------ | -------------------- | -------------------------------------------------- |
| Batches            | `beer`               | Batch list item icon                               |
| Recipes            | `document-text`      | Recipe list item icon                              |
| Malt               | `nutrition-outline`  | Ingredient category icon                           |
| Hops               | `leaf-outline`       | Ingredient category icon                           |
| Yeast              | `flask-outline`      | Ingredient category icon                           |
| Equipment          | `construct-outline`  | Equipment list item icon                           |
| Academy            | `school-outline`     | Contextual action button (header)                  |
| Shop               | `storefront-outline` | Shop navigation                                    |
| Navigation forward | `chevron-forward`    | All navigable list items, size: 20, color: `muted` |
| Navigation back    | `chevron-back`       | Back navigation buttons in header actions          |
| Info               | `information-circle` | Info cards / banners                               |

---

## 10. Accessibility rules

All interactive elements (`Pressable`) must have:

- `accessibilityRole="button"` (or appropriate role)
- `accessibilityLabel="..."` (descriptive, not just the visible label)

FlatList items that navigate must have the label describe the destination:

```tsx
accessibilityLabel={`Ouvrir le brassin ${item.id.slice(0, 8)}`}
```

---

## 11. Import pattern

```ts
import { colors, radius, spacing, typography } from "@/core/theme";
```

All four tokens should be imported together. Never destructure from individual files.
