import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing, typography } from "@/core/theme";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { getAcademyTopicBySlug } from "./academy-topics";
import { useRouter } from "expo-router";

type Props = {
  slugParam?: string;
};

export function AcademyTopicDetailsScreen({ slugParam }: Props) {
  const router = useRouter();
  const topic = getAcademyTopicBySlug(slugParam);
  const isFermentescibles = topic?.slug === "fermentescibles";
  const isCouleur = topic?.slug === "couleur";
  const isHoublons = topic?.slug === "houblons";
  const isEau = topic?.slug === "eau";

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
        ) : isCouleur ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi la couleur est un repère clé
              </Text>
              <Text style={styles.paragraph}>
                La couleur n'est pas juste esthétique : elle annonce déjà le
                profil de la bière (légère, caramel, torréfiée) et aide à
                vérifier que ta recette est cohérente avec le style visé.
              </Text>
              <Text style={styles.bullet}>
                • Pilsner : teinte très claire, profil léger
              </Text>
              <Text style={styles.bullet}>
                • IPA ambrée : plus de malts caramels
              </Text>
              <Text style={styles.bullet}>
                • Stout : malts très torréfiés, teinte foncée à noire
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • MCU : unité intermédiaire calculée depuis les malts
              </Text>
              <Text style={styles.bullet}>
                • SRM : échelle de couleur utilisée côté US
              </Text>
              <Text style={styles.bullet}>
                • EBC : échelle de couleur utilisée en Europe
              </Text>
              <Text style={styles.bullet}>• Conversion : EBC ≈ SRM × 1,97</Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Calculer la couleur (méthode Morey)
              </Text>
              <Text style={styles.paragraph}>
                La méthode la plus utilisée en brassage amateur est : calcul
                MCU, puis conversion en SRM avec Morey, puis conversion en EBC.
              </Text>
              <Text style={styles.formula}>SRM = 1,4922 × (MCU ^ 0,6859)</Text>
              <Text style={styles.formula}>EBC ≈ SRM × 1,97</Text>
              <Text style={styles.paragraph}>
                La constante 1,4922 et l'exposant 0,6859 viennent d'un
                ajustement empirique : ils reflètent la façon non linéaire dont
                on perçoit la couleur. Le facteur 1,97 sert à passer de SRM vers
                EBC.
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple simple</Text>
              <Text style={styles.bullet}>
                • Tu obtiens MCU = 10,3 avec ta recette
              </Text>
              <Text style={styles.bullet}>
                • SRM ≈ 1,4922 × (10,3^0,6859) ≈ 7,4
              </Text>
              <Text style={styles.bullet}>• EBC ≈ 7,4 × 1,97 ≈ 14,6</Text>
              <Text style={styles.bullet}>
                • Lecture visuelle : doré soutenu
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Plages utiles pour se situer
              </Text>
              <Text style={styles.bullet}>
                • 4-8 EBC : paille à doré très clair
              </Text>
              <Text style={styles.bullet}>
                • 12-20 EBC : doré intense à ambré
              </Text>
              <Text style={styles.bullet}>
                • 28-40 EBC : cuivre à brun clair
              </Text>
              <Text style={styles.bullet}>• 60+ EBC : brun foncé à noir</Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Erreurs fréquentes à éviter
              </Text>
              <Text style={styles.bullet}>
                • Confondre EBC du malt et EBC final de la bière
              </Text>
              <Text style={styles.bullet}>
                • Oublier l'impact du volume final sur la couleur perçue
              </Text>
              <Text style={styles.bullet}>
                • Croire que MCU = SRM (la relation n'est pas linéaire)
              </Text>
              <Text style={styles.bullet}>
                • Surdoser les malts torréfiés (couleur ok, goût trop agressif)
              </Text>
            </Card>
          </>
        ) : isHoublons ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi les houblons sont un repère clé
              </Text>
              <Text style={styles.paragraph}>
                Le houblon structure l'équilibre entre douceur du malt et
                amertume. Bien dosé, il apporte aussi la signature aromatique
                (agrumes, floral, résine, tropical) du style que tu vises.
              </Text>
              <Text style={styles.bullet}>
                • Trop peu d'IBU : bière plate ou trop sucrée
              </Text>
              <Text style={styles.bullet}>
                • Trop d'IBU : amertume agressive et déséquilibre
              </Text>
              <Text style={styles.bullet}>
                • Timing des ajouts = impact direct sur amer, saveur et arôme
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • IBU : intensité d'amertume (1 IBU = 1 mg/L d'iso-alpha-acides)
              </Text>
              <Text style={styles.bullet}>
                • %AA : pourcentage d'acides alpha du houblon (pouvoir
                amérisant)
              </Text>
              <Text style={styles.bullet}>
                • Utilisation : rendement réel selon temps d'ébullition
              </Text>
              <Text style={styles.bullet}>
                • BU:GU : ratio amer/sucré pour juger l'équilibre global
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Calculer l'IBU (Tinseth)</Text>
              <Text style={styles.paragraph}>
                En pratique, la méthode Tinseth est la référence en brassage
                amateur pour estimer l'amertume avant brassin.
              </Text>
              <Text style={styles.formula}>
                IBU = (AA% × g × U × 10) / (Volume L × G)
              </Text>
              <Text style={styles.paragraph}>
                U dépend surtout du temps d'ébullition (plus c'est long, plus
                l'amertume monte), et G corrige l'effet de densité du moût (OG
                élevée = extraction un peu moins efficace).
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple simple</Text>
              <Text style={styles.bullet}>
                • Recette : 20 L, OG 1,065, Cascade 6% AA
              </Text>
              <Text style={styles.bullet}>• Ajout : 30 g à 60 min</Text>
              <Text style={styles.bullet}>
                • Avec U corrigé ≈ 0,26 → IBU ≈ 23,4
              </Text>
              <Text style={styles.bullet}>
                • Lecture : amertume modérée, base IPA légère ou Pale Ale
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Piloter l'équilibre (BU:GU)
              </Text>
              <Text style={styles.formula}>
                BU:GU = IBU / ((OG - 1) × 1000)
              </Text>
              <Text style={styles.bullet}>
                • Exemple : OG 1,065 (65 GU) et 60 IBU → BU:GU ≈ 0,92
              </Text>
              <Text style={styles.bullet}>
                • 0,6-0,8 : équilibré | 0,8-1,0 : bien houblonné | 1,0+ : très
                amer
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Plages utiles par style</Text>
              <Text style={styles.bullet}>
                • 15-25 IBU : Blonde, Kölsch, bières légères
              </Text>
              <Text style={styles.bullet}>
                • 30-45 IBU : Pilsner, Pale Ale, bières équilibrées
              </Text>
              <Text style={styles.bullet}>
                • 45-70 IBU : IPA classiques, amertume prononcée
              </Text>
              <Text style={styles.bullet}>
                • 70+ IBU : Double/Imperial IPA (intense)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Erreurs fréquentes à éviter
              </Text>
              <Text style={styles.bullet}>
                • Oublier que le whirlpool chaud (80-90°C) ajoute des IBU
              </Text>
              <Text style={styles.bullet}>
                • Ignorer la correction liée à l'OG sur les bières fortes
              </Text>
              <Text style={styles.bullet}>
                • Confondre dry hop (arôme) et ajout amérisant (IBU)
              </Text>
              <Text style={styles.bullet}>
                • Mélanger plusieurs formules sans cohérence (Tinseth/Rager)
              </Text>
            </Card>
          </>
        ) : isEau ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi l'eau est un thème critique
              </Text>
              <Text style={styles.paragraph}>
                L'eau représente la très grande majorité du volume final d'une
                bière. C'est aussi l'un des leviers les plus puissants pour
                piloter le pH, l'extraction des sucres et l'équilibre gustatif.
              </Text>
              <Text style={styles.bullet}>
                • Un pH mal réglé peut réduire l'efficacité d'extraction
              </Text>
              <Text style={styles.bullet}>
                • Les minéraux influencent directement sec/houblonné vs
                rond/malté
              </Text>
              <Text style={styles.bullet}>
                • Le profil d'eau aide à coller au style (Pilsner, IPA, Stout)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides : 6 ions</Text>
              <Text style={styles.bullet}>
                • Calcium (Ca²⁺) : aide le pH, la clarté et la floculation
                levure
              </Text>
              <Text style={styles.bullet}>
                • Magnésium (Mg²⁺) : nutriment levure (à garder modéré)
              </Text>
              <Text style={styles.bullet}>
                • Sodium (Na⁺) : apporte rondeur à petite dose
              </Text>
              <Text style={styles.bullet}>
                • Sulfates (SO₄²⁻) : accentuent sécheresse et perception de
                l'amertume
              </Text>
              <Text style={styles.bullet}>
                • Chlorures (Cl⁻) : soutiennent rondeur et expression maltée
              </Text>
              <Text style={styles.bullet}>
                • Bicarbonates (HCO₃⁻) : tamponnent le pH (souvent trop élevés
                en eau calcaire)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Le pH à chaque étape</Text>
              <Text style={styles.paragraph}>
                Le repère principal pendant l'empâtage reste une zone autour de
                5,2 à 5,6. En dehors de cette zone, les enzymes travaillent
                moins bien et la bière perd en précision.
              </Text>
              <Text style={styles.bullet}>
                • Empâtage : pH cible 5,2-5,6 (zone optimale)
              </Text>
              <Text style={styles.bullet}>
                • Rinçage : pH 5,5-5,8 pour limiter l'extraction de tannins
              </Text>
              <Text style={styles.bullet}>
                • pH trop haut (&gt;5,8) : extraction plus faible, risque
                d'astringence
              </Text>
              <Text style={styles.bullet}>
                • pH trop bas (&lt;5,0) : acidité excessive et profil agressif
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Alcalinité résiduelle (RA) : l'indicateur clé
              </Text>
              <Text style={styles.paragraph}>
                La RA résume la capacité de l'eau à résister à l'acidification
                des malts. Plus elle est élevée, plus le pH a tendance à monter.
              </Text>
              <Text style={styles.formula}>
                RA (ppm) ≈ HCO₃⁻ − (Ca²⁺ / 3,5 + Mg²⁺ / 7)
              </Text>
              <Text style={styles.bullet}>
                • RA faible (−50 à +25) : adaptée aux bières pâles
              </Text>
              <Text style={styles.bullet}>
                • RA moyenne (0 à +75) : profils ambrés/maltés
              </Text>
              <Text style={styles.bullet}>
                • RA élevée (&gt;+100) : utile surtout pour bières très foncées
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Ratio sulfates/chlorures : sec ou rond ?
              </Text>
              <Text style={styles.formula}>Ratio SO₄/Cl = SO₄²⁻ / Cl⁻</Text>
              <Text style={styles.bullet}>
                • 0,5:1 à 1,5:1 : profil plus malté, doux et rond
              </Text>
              <Text style={styles.bullet}>
                • 1,5:1 à 3:1 : compromis équilibré
              </Text>
              <Text style={styles.bullet}>
                • 3:1 à 8:1 : profil plus sec, houblon mis en avant
              </Text>
              <Text style={styles.bullet}>
                • Toujours vérifier aussi les valeurs absolues (pas uniquement
                le ratio)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Cibles utiles pour débuter
              </Text>
              <Text style={styles.bullet}>• Calcium : 50-150 ppm</Text>
              <Text style={styles.bullet}>• Magnésium : 10-30 ppm</Text>
              <Text style={styles.bullet}>• Sodium : 10-75 ppm</Text>
              <Text style={styles.bullet}>
                • Sulfates : 50-400 ppm selon le style
              </Text>
              <Text style={styles.bullet}>
                • Chlorures : 50-150 ppm selon le style
              </Text>
              <Text style={styles.bullet}>
                • Bicarbonates : plutôt bas pour styles pâles, plus élevés pour
                styles foncés
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Méthode pas-à-pas (simple et fiable)
              </Text>
              <Text style={styles.bullet}>
                1) Lire ton analyse d'eau (Ca, Mg, Na, SO₄, Cl, HCO₃)
              </Text>
              <Text style={styles.bullet}>
                2) Fixer une cible style (ex: IPA, Lager, Stout)
              </Text>
              <Text style={styles.bullet}>
                3) Réduire d'abord les bicarbonates (dilution eau osmosée)
              </Text>
              <Text style={styles.bullet}>
                4) Ajuster ensuite avec sels (gypse, CaCl₂, etc.)
              </Text>
              <Text style={styles.bullet}>
                5) Contrôler le pH de maische, puis corriger finement si besoin
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple pédagogique : IPA</Text>
              <Text style={styles.paragraph}>
                Eau de départ très calcaire (HCO₃ élevé) : on dilue d'abord,
                puis on remonte les ions utiles au style.
              </Text>
              <Text style={styles.bullet}>
                • Étape 1 : dilution pour rapprocher HCO₃ de ~50 ppm
              </Text>
              <Text style={styles.bullet}>
                • Étape 2 : gypse pour augmenter Ca et SO₄ (profil plus sec)
              </Text>
              <Text style={styles.bullet}>
                • Étape 3 : CaCl₂ pour remonter Cl et garder de la rondeur
              </Text>
              <Text style={styles.bullet}>
                • Cible finale type IPA : SO₄/Cl autour de 3:1 à 5:1
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Erreurs fréquentes à éviter
              </Text>
              <Text style={styles.bullet}>
                • Ajuster les sels sans mesurer le pH de maische
              </Text>
              <Text style={styles.bullet}>
                • Se focaliser sur le ratio SO₄/Cl sans regarder les ppm réels
              </Text>
              <Text style={styles.bullet}>
                • Surdoser les sels (goût minéral, chimique ou métallique)
              </Text>
              <Text style={styles.bullet}>
                • Oublier la déchloration de l'eau du robinet
              </Text>
              <Text style={styles.bullet}>
                • Utiliser un pH-mètre non calibré (mesures trompeuses)
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
              isFermentescibles || isCouleur || isHoublons || isEau
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
