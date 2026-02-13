import { colors, spacing, typography } from "@/core/theme";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyTopicBySlug } from "./academy-topics";

type Props = {
  slugParam?: string;
};

export function AcademyTopicDetailsScreen({ slugParam }: Props) {
  const router = useRouter();
  const topic = getAcademyTopicBySlug(slugParam);
  const isFermentescibles = topic?.slug === "fermentescibles";

  if (!topic) {
    return (
      <Screen>
        <ListHeader
          title="Académie brassicole"
          subtitle="Thème introuvable"
          action={
            <Pressable onPress={() => router.push("/tools")}>
              <Text style={styles.backLink}>← Retour</Text>
            </Pressable>
          }
        />
        <EmptyStateCard
          title="Thème introuvable"
          description="Ce thème n'existe pas (ou n'est plus disponible)."
          action={
            <PrimaryButton
              label="Retour au catalogue"
              onPress={() => router.push("/tools")}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ListHeader
        title={topic.title}
        subtitle="Fiche thématique"
        action={
          <Pressable onPress={() => router.push("/tools")}>
            <Text style={styles.backLink}>← Retour</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Image
              source={topic.mascotImage}
              style={styles.mascot}
              accessibilityRole="image"
              accessibilityLabel={topic.mascotAlt}
            />
            <View style={styles.heroBody}>
              <Text style={styles.description}>{topic.shortDescription}</Text>
              <View style={styles.badgesRow}>
                <Badge label={topic.focus} />
                <Badge label={topic.estimatedReadTime} />
              </View>
            </View>
          </View>
        </Card>

        {isFermentescibles ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi c'est un thème clé
              </Text>
              <Text style={styles.paragraph}>
                Les fermentescibles (malts et sucres) sont la base énergétique
                de la bière. Ils déterminent en grande partie le degré d'alcool,
                le corps et l'équilibre final en bouche.
              </Text>
              <Text style={styles.bullet}>
                • Plus de sucres fermentescibles = potentiel alcool plus élevé
              </Text>
              <Text style={styles.bullet}>
                • Plus de sucres résiduels = bière plus ronde et plus douce
              </Text>
              <Text style={styles.bullet}>
                • Mauvaise estimation OG/FG = style raté et fermentation
                instable
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • OG (Original Gravity) : densité du moût avant fermentation
              </Text>
              <Text style={styles.bullet}>
                • FG (Final Gravity) : densité de la bière après fermentation
              </Text>
              <Text style={styles.bullet}>
                • ABV : pourcentage d'alcool final (% vol)
              </Text>
              <Text style={styles.bullet}>
                • Atténuation : part des sucres consommés par la levure
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Comprendre OG et FG</Text>
              <Text style={styles.paragraph}>
                Pense l'OG comme la "quantité de sucre au départ", puis la FG
                comme "ce qu'il reste à la fin". L'écart OG → FG te montre
                directement si la levure a bien travaillé.
              </Text>
              <Text style={styles.bullet}>
                • OG élevée = potentiel d'alcool plus élevé
              </Text>
              <Text style={styles.bullet}>
                • FG basse = bière plus sèche (moins sucrée en bouche)
              </Text>
              <Text style={styles.bullet}>
                • Écart OG→FG = indicateur simple de la performance de la levure
              </Text>
              <Text style={styles.bullet}>
                • Exemple : OG 1,060 vers FG 1,012 = fermentation cohérente
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Calculer l'ABV simplement</Text>
              <Text style={styles.paragraph}>
                Formule pratique pour obtenir une estimation rapide du taux
                d'alcool.
              </Text>
              <Text style={styles.formula}>ABV ≈ (OG - FG) × 131,25</Text>
              <Text style={styles.paragraph}>
                La constante 131,25 est un coefficient empirique : elle sert à
                transformer un écart de densité (OG-FG) en pourcentage d'alcool.
                Elle vient de la relation entre sucres fermentés, production
                d'éthanol et densité de l'alcool. Ce n'est pas une loi physique
                parfaite, mais c'est la référence la plus utilisée pour une
                estimation fiable en brassage amateur.
              </Text>
              <Text style={styles.bullet}>
                • Exemple : OG 1,060 et FG 1,012 → ABV ≈ 6,3%
              </Text>
              <Text style={styles.bullet}>
                • Pour les bières très fortes (ABV élevé), une formule avancée
                peut affiner le résultat
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Estimer la FG avec l'atténuation
              </Text>
              <Text style={styles.paragraph}>
                L'atténuation donnée par le fabricant de levure permet de
                prévoir une FG réaliste avant brassage.
              </Text>
              <Text style={styles.formula}>
                FG = OG - (OG - 1) × (Atténuation / 100)
              </Text>
              <Text style={styles.bullet}>
                • Ex : OG 1,060 et atténuation 80% → FG attendue ≈ 1,012
              </Text>
              <Text style={styles.bullet}>
                • En pratique : Ale souvent 70-85% d'atténuation, Lager 70-80%
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Plages utiles pour se repérer
              </Text>
              <Text style={styles.bullet}>
                • OG 1,044-1,050 : bières légères
              </Text>
              <Text style={styles.bullet}>
                • OG 1,055-1,070 : IPA / bières fortes
              </Text>
              <Text style={styles.bullet}>
                • FG 1,008-1,012 : finale sèche | FG 1,015+ : finale plus douce
              </Text>
              <Text style={styles.bullet}>
                • ABV courant en brassage maison : ~4% à 7%
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Erreurs fréquentes à éviter
              </Text>
              <Text style={styles.paragraph}>
                Ces erreurs sont très courantes au début. Les éviter améliore
                immédiatement la qualité de tes estimations.
              </Text>
              <Text style={styles.bullet}>
                • Lire la densité sans corriger la température de mesure
              </Text>
              <Text style={styles.bullet}>
                • Mélanger les unités (SG, °Plato, points) sans conversion
              </Text>
              <Text style={styles.bullet}>
                • Oublier que la recette, la levure et l'empâtage influencent FG
              </Text>
            </Card>
          </>
        ) : (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Ce que tu trouveras bientôt
              </Text>
              <Text style={styles.bullet}>• Résumé structuré du chapitre</Text>
              <Text style={styles.bullet}>• Formules clés et explications</Text>
              <Text style={styles.bullet}>
                • Exemples pratiques et pièges fréquents
              </Text>
              <Text style={styles.bullet}>• Pont vers calculateur dédié</Text>
            </Card>

            <PrimaryButton
              label="En savoir plus"
              onPress={() =>
                router.push({
                  pathname: "/tools/[slug]/learn",
                  params: { slug: topic.slug },
                })
              }
            />
          </>
        )}

        {topic.hasCalculator ? (
          <PrimaryButton
            label={
              isFermentescibles
                ? "Accéder au futur calculateur"
                : "Accéder au calcul"
            }
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]/calculator",
                params: { slug: topic.slug },
              })
            }
            style={styles.secondaryButtonSpacing}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  heroCard: {
    marginBottom: spacing.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  mascot: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  heroBody: {
    flex: 1,
  },
  description: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  badgesRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  bullet: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xxs,
  },
  paragraph: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xs,
  },
  formula: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  secondaryButtonSpacing: {
    marginTop: spacing.xs,
  },
  backLink: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
