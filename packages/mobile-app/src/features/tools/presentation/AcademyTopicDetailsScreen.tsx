import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { colors, spacing, typography } from "@/core/theme";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { normalizeRouteParam } from "@/core/navigation/route-params";
import { getAcademyArticleBySlug } from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
import { AcademyArticleRenderer } from "@/features/academy/presentation";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { getAcademyTopicBySlug } from "@/features/tools/data";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyMascotImage } from "./academy-mascot";

type Props = {
  slugParam?: string | string[];
};

export function AcademyTopicDetailsScreen({ slugParam }: Props) {
  const router = useRouter();
  const bottomPadding = useNavigationFooterOffset();
  const normalizedSlug = normalizeRouteParam(slugParam);
  const topic = getAcademyTopicBySlug(normalizedSlug);
  const isAvances = topic?.slug === "avances";
  const calculatorLabel = "Ouvrir le calculateur";
  const generatedArticle = normalizedSlug
    ? getAcademyArticleBySlug(generatedAcademyRepository, normalizedSlug)
    : null;
  const publishedGeneratedArticle =
    generatedArticle?.metadata.status === "published" ? generatedArticle : null;
  const generatedArticleCalculatorSlug =
    publishedGeneratedArticle?.metadata.relatedCalculators[0]?.target.slug ??
    null;
  const legacyCalculatorSlug = topic?.hasCalculator ? topic.slug : null;
  const calculatorSlug = generatedArticleCalculatorSlug ?? legacyCalculatorSlug;

  if (!topic && !publishedGeneratedArticle) {
    return (
      <Screen>
        <ListHeader
          title="Académie brassicole"
          subtitle="Thème introuvable"
          action={
            <Pressable onPress={() => router.push("/(app)/academy")}>
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
              onPress={() => router.push("/(app)/academy")}
            />
          }
        />
      </Screen>
    );
  }

  if (publishedGeneratedArticle) {
    return (
      <Screen>
        <ListHeader
          title={publishedGeneratedArticle.metadata.title}
          subtitle="Article Académie"
          action={
            <Pressable onPress={() => router.push("/(app)/academy")}>
              <Text style={styles.backLink}>← Retour</Text>
            </Pressable>
          }
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPadding },
          ]}
        >
          {calculatorSlug ? (
            <Card style={styles.sectionCard}>
              <PrimaryButton
                label={calculatorLabel}
                onPress={() =>
                  router.push({
                    pathname: "/tools/[slug]/calculator",
                    params: { slug: calculatorSlug },
                  })
                }
              />
            </Card>
          ) : null}

          <AcademyArticleRenderer
            article={publishedGeneratedArticle}
            onCalculatorPress={(slug) =>
              router.push({
                pathname: "/tools/[slug]/calculator",
                params: { slug },
              })
            }
            onGlossaryPress={() =>
              router.push({
                pathname: "/(app)/academy/[slug]",
                params: { slug: "glossaire" },
              })
            }
            onRelatedArticlePress={(articleSlug) =>
              router.push({
                pathname: "/(app)/academy/[slug]",
                params: { slug: articleSlug },
              })
            }
          />
        </ScrollView>
      </Screen>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <Screen>
      <ListHeader
        title={topic.title}
        subtitle="Fiche thématique"
        action={
          <Pressable onPress={() => router.push("/(app)/academy")}>
            <Text style={styles.backLink}>← Retour</Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
      >
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Image
              source={getAcademyMascotImage(topic.mascotVariant)}
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

        {isAvances ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi ces calculs sont “avancés”
              </Text>
              <Text style={styles.paragraph}>
                Cette fiche regroupe les indicateurs de pilotage fin du brassage
                : activité enzymatique, qualité protéique, viscosité,
                disponibilité azotée et corrections de procédé. C'est ce qui
                permet de transformer un brassin correct en brassin très
                maîtrisé.
              </Text>
              <Text style={styles.bullet}>
                • Objectif : améliorer régularité, filtration et stabilité
              </Text>
              <Text style={styles.bullet}>
                • Utile dès que tu ajustes recettes, malts ou process
              </Text>
              <Text style={styles.bullet}>
                • Idéal pour diagnostiquer des écarts difficiles (haze,
                filtration lente, FG imprévisible)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • WKU : pouvoir diastasique (force enzymatique des malts)
              </Text>
              <Text style={styles.bullet}>
                • Indice Kolbach : niveau de solubilisation des protéines
              </Text>
              <Text style={styles.bullet}>
                • β-glucanes : impact direct sur viscosité et filtration
              </Text>
              <Text style={styles.bullet}>
                • FAN : azote assimilable pour la levure
              </Text>
              <Text style={styles.bullet}>
                • Extractibilité : potentiel réel de rendement labo
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Pouvoir diastasique (WKU)</Text>
              <Text style={styles.formula}>
                WKU total = Σ (Kg maltᵢ × WKUᵢ)
              </Text>
              <Text style={styles.formula}>
                WKU/kg recette = WKU total / Kg total recette
              </Text>
              <Text style={styles.paragraph}>
                Le WKU traduit la capacité globale à convertir l'amidon. Une
                base trop faible expose à une conversion incomplète, surtout
                avec beaucoup de malts spéciaux non enzymatiques.
              </Text>
              <Text style={styles.bullet}>
                • Zone utile : ~120 à 180 WKU/kg recette
              </Text>
              <Text style={styles.bullet}>
                • Pilsner/Pale : souvent 220 à 350 WKU/kg (très enzymatiques)
              </Text>
              <Text style={styles.bullet}>
                • Crystal/roasted : WKU proche de 0
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Indice Kolbach</Text>
              <Text style={styles.formula}>
                Kolbach % = (Azote soluble / Azote total) × 100
              </Text>
              <Text style={styles.bullet}>
                • Base malt : repère courant 38-45%
              </Text>
              <Text style={styles.bullet}>
                • Trop bas (&lt;35%) : corps lourd, risque de trouble
              </Text>
              <Text style={styles.bullet}>
                • Trop haut (&gt;48%) : stabilité réduite, haze à froid
              </Text>
              <Text style={styles.bullet}>
                • Sert aussi d'entrée pour estimer FAN et comportement
                fermentation
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>β-glucanes et viscosité</Text>
              <Text style={styles.formula}>
                Viscosité (cP) ≈ 1,2 + 0,015 × β-glucanes (mg/L)
              </Text>
              <Text style={styles.bullet}>
                • &lt;200 mg/L : filtration généralement fluide
              </Text>
              <Text style={styles.bullet}>
                • 200-350 mg/L : filtration plus lente
              </Text>
              <Text style={styles.bullet}>
                • &gt;350 mg/L : zone problématique (drêches compactes)
              </Text>
              <Text style={styles.bullet}>
                • Prévention : qualité malt + palier 45-55°C court et piloté
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>FAN (Wort Nitrogen)</Text>
              <Text style={styles.formula}>
                FAN (mg/L) ≈ 0,2 × Indice Kolbach × OG_points
              </Text>
              <Text style={styles.bullet}>
                • Cible fréquente : ~150 à 250 mg/L
              </Text>
              <Text style={styles.bullet}>
                • &lt;120 mg/L : fermentation lente ou incomplète
              </Text>
              <Text style={styles.bullet}>
                • &gt;300 mg/L : risque d'excès d'esters selon la souche
              </Text>
              <Text style={styles.bullet}>
                • Croiser FAN avec température/pitch rate pour un diagnostic
                fiable
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Extractibilité et bilan thermique
              </Text>
              <Text style={styles.formula}>
                EFM labo (base Pilsner) : souvent autour de 83%
              </Text>
              <Text style={styles.formula}>
                Q = (m × Cp × ΔT)malt + (m × Cp × ΔT)eau
              </Text>
              <Text style={styles.bullet}>
                • L'extractibilité indique le potentiel théorique matière
              </Text>
              <Text style={styles.bullet}>
                • Le calcul thermique aide à stabiliser les paliers d'empâtage
              </Text>
              <Text style={styles.bullet}>
                • Cp de repère : malt ~1,8 kJ/kg°C | eau ~4,18 kJ/kg°C
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Corrections altitude et pression
              </Text>
              <Text style={styles.formula}>
                T° ébullition ≈ 100 − (Altitude m / 300)
              </Text>
              <Text style={styles.formula}>
                P_atm ≈ 1013 − (Altitude m / 8,5)
              </Text>
              <Text style={styles.bullet}>
                • En altitude, ébullition plus basse → isomérisation houblon
                réduite
              </Text>
              <Text style={styles.bullet}>
                • Ajustement pratique IBU : +10 à 15% de houblon vers 1500 m
              </Text>
              <Text style={styles.bullet}>
                • Le CO₂ résiduel dépend aussi de la pression atmosphérique
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Checklist “mode expert”</Text>
              <Text style={styles.bullet}>
                □ Vérifier WKU/kg recette avant brassage
              </Text>
              <Text style={styles.bullet}>
                □ Contrôler Kolbach / qualité malt fournisseur
              </Text>
              <Text style={styles.bullet}>
                □ Surveiller β-glucanes si filtration lente récurrente
              </Text>
              <Text style={styles.bullet}>
                □ Estimer FAN pour sécuriser fermentation
              </Text>
              <Text style={styles.bullet}>
                □ Appliquer correction altitude pour IBU/CO₂ si nécessaire
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
                  pathname: "/academy/[slug]/learn",
                  params: { slug: topic.slug },
                })
              }
            />
          </>
        )}

        {topic.hasCalculator ? (
          <PrimaryButton
            label={calculatorLabel}
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
  content: {},
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
