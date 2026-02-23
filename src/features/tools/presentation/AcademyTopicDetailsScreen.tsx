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
import { getAcademyTopicBySlug } from "@/features/tools/data";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  slugParam?: string;
};

export function AcademyTopicDetailsScreen({ slugParam }: Props) {
  const router = useRouter();
  const topic = getAcademyTopicBySlug(slugParam);
  const isIntroduction = topic?.slug === "introduction";
  const isFermentescibles = topic?.slug === "fermentescibles";
  const isCouleur = topic?.slug === "couleur";
  const isHoublons = topic?.slug === "houblons";
  const isEau = topic?.slug === "eau";
  const isRendement = topic?.slug === "rendement";
  const isLevures = topic?.slug === "levures";
  const isCarbonatation = topic?.slug === "carbonatation";
  const isAvances = topic?.slug === "avances";
  const isGlossaire = topic?.slug === "glossaire";
  const calculatorLabel =
    topic?.status === "ready"
      ? "Accéder au calcul"
      : "Accéder au futur calculateur";

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

        {isIntroduction ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi commencer par l'introduction
              </Text>
              <Text style={styles.paragraph}>
                Cette fiche te donne la carte d'ensemble du brassage : les
                ingrédients, les étapes clés et les indicateurs à suivre.
                L'objectif est d'avoir une base solide avant d'entrer dans les
                chapitres techniques.
              </Text>
              <Text style={styles.bullet}>
                • Comprendre la logique globale avant d'optimiser les détails
              </Text>
              <Text style={styles.bullet}>
                • Éviter les erreurs de débutant liées au process
              </Text>
              <Text style={styles.bullet}>
                • Construire des recettes plus cohérentes dès les premiers
                brassins
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Les 4 ingrédients fondamentaux
              </Text>
              <Text style={styles.bullet}>
                • Eau : base du volume et levier majeur sur pH et profil
                gustatif
              </Text>
              <Text style={styles.bullet}>
                • Malt : apporte sucres fermentescibles, couleur et structure
              </Text>
              <Text style={styles.bullet}>
                • Houblon : équilibre l'amertume et construit l'aromatique
              </Text>
              <Text style={styles.bullet}>
                • Levure : transforme les sucres en alcool et CO₂
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Vue d'ensemble du process</Text>
              <Text style={styles.bullet}>
                1) Empâtage : conversion de l'amidon en sucres fermentescibles
              </Text>
              <Text style={styles.bullet}>
                2) Filtration / rinçage : extraction des sucres du grain bill
              </Text>
              <Text style={styles.bullet}>
                3) Ébullition : stérilisation + ajouts de houblon
              </Text>
              <Text style={styles.bullet}>
                4) Refroidissement puis ensemencement de la levure
              </Text>
              <Text style={styles.bullet}>
                5) Fermentation et conditionnement (bouteille ou fût)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Repères à suivre sur chaque brassin
              </Text>
              <Text style={styles.bullet}>
                • OG / FG : indicateurs de fermentation et d'alcool final
              </Text>
              <Text style={styles.bullet}>
                • ABV : estimation du taux d'alcool
              </Text>
              <Text style={styles.bullet}>
                • IBU / EBC : équilibre amertume et couleur
              </Text>
              <Text style={styles.bullet}>
                • pH d'empâtage : clé d'une bonne extraction
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Hygiène : règle non négociable
              </Text>
              <Text style={styles.paragraph}>
                Tout ce qui touche le moût refroidi ou la bière doit être
                nettoyé puis désinfecté. Une contamination peut ruiner un
                brassin même avec une recette parfaitement calculée.
              </Text>
              <Text style={styles.bullet}>
                • Nettoyer d'abord, désinfecter ensuite
              </Text>
              <Text style={styles.bullet}>
                • Limiter les manipulations après refroidissement
              </Text>
              <Text style={styles.bullet}>
                • Privilégier la régularité et la traçabilité dans ton carnet
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Par où continuer ensuite ?
              </Text>
              <Text style={styles.bullet}>
                • Fermentescibles : pour maîtriser OG, FG et ABV
              </Text>
              <Text style={styles.bullet}>
                • Eau : pour stabiliser pH et profil minéral
              </Text>
              <Text style={styles.bullet}>
                • Levures : pour fiabiliser la fermentation
              </Text>
              <Text style={styles.bullet}>
                • Glossaire : pour sécuriser le vocabulaire technique
              </Text>
            </Card>
          </>
        ) : isFermentescibles ? (
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
        ) : isRendement ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi le rendement est critique
              </Text>
              <Text style={styles.paragraph}>
                Le rendement mesure l'efficacité d'extraction des sucres du
                malt. C'est un levier direct sur le coût matière, l'OG atteinte
                et la reproductibilité de tes brassins.
              </Text>
              <Text style={styles.bullet}>
                • Rendement faible = OG trop basse et ABV plus faible que prévu
              </Text>
              <Text style={styles.bullet}>
                • +10 points de rendement = moins de malt pour même résultat
              </Text>
              <Text style={styles.bullet}>
                • Un objectif réaliste amateur expert : 75-80%
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • Points de densité : (OG - 1) × 1000 (ex: 1,060 = 60 points)
              </Text>
              <Text style={styles.bullet}>
                • PPG : potentiel théorique d'extraction d'un malt
              </Text>
              <Text style={styles.bullet}>
                • EFM : extractibilité labo (base théorique)
              </Text>
              <Text style={styles.bullet}>
                • Rendement brassin : % réel extrait vs potentiel
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Formule simple du rendement
              </Text>
              <Text style={styles.formula}>
                Rendement % = (Points réels / Points théoriques) × 100
              </Text>
              <Text style={styles.paragraph}>
                Les points réels viennent de la mesure OG et du volume. Les
                points théoriques viennent du potentiel des malts (PPG/EFM).
              </Text>
              <Text style={styles.bullet}>
                • Exemple : 67% = tu extrais 67% du potentiel de ta recette
              </Text>
              <Text style={styles.bullet}>
                • 70-78% : zone courante sur installations amateurs bien réglées
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Calculer le malt pour une OG cible
              </Text>
              <Text style={styles.formula}>
                Kg malt = (Points cible × Volume) / (Rendement × Facteur malt)
              </Text>
              <Text style={styles.paragraph}>
                Le facteur malt est lié au PPG moyen du grain bill (souvent
                autour de 3,4 à 3,7 points/kg/L à 100%).
              </Text>
              <Text style={styles.bullet}>
                • Si ton rendement réel baisse, il faut augmenter la masse de
                malt
              </Text>
              <Text style={styles.bullet}>
                • Toujours baser le calcul sur ton historique, pas sur une
                valeur idéale
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Rendements réalistes par équipement
              </Text>
              <Text style={styles.bullet}>
                • BIAB : ~60-70% (optimisé jusqu'à ~72%)
              </Text>
              <Text style={styles.bullet}>
                • 3 cuves amateur : ~70-78% (optimisé jusqu'à ~82%)
              </Text>
              <Text style={styles.bullet}>• RIMS/HERMS amateur : ~75-82%</Text>
              <Text style={styles.bullet}>
                • Pro artisanal : ~78-84% | industriel : ~85%+
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Où se perd le rendement ?</Text>
              <Text style={styles.bullet}>
                • Concassage (écarture non adaptée) : pertes importantes
              </Text>
              <Text style={styles.bullet}>
                • Empâtage (pH/température hors cible) : enzymes moins actives
              </Text>
              <Text style={styles.bullet}>
                • Filtration/rinçage : principal gisement de pertes en amateur
              </Text>
              <Text style={styles.bullet}>
                • Transferts/conditionnement : pertes de volume et de sucres
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Méthode pas-à-pas pour progresser
              </Text>
              <Text style={styles.bullet}>
                1) Mesurer OG et volume final à chaque brassin
              </Text>
              <Text style={styles.bullet}>
                2) Calculer le rendement réel et le noter systématiquement
              </Text>
              <Text style={styles.bullet}>
                3) Ajuster une seule variable à la fois (concassage, rinçage,
                pH...)
              </Text>
              <Text style={styles.bullet}>
                4) Re-mesurer pour vérifier le gain réel
              </Text>
              <Text style={styles.bullet}>
                5) Recalibrer les recettes sur le rendement stabilisé
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple concret (IPA 20L)</Text>
              <Text style={styles.paragraph}>
                Grain bill de 5 kg, OG mesurée à 1,062 : rendement constaté
                autour de 67% sur l'installation.
              </Text>
              <Text style={styles.bullet}>
                • Objectif : atteindre 75% via concassage + rinçage
              </Text>
              <Text style={styles.bullet}>
                • Gain attendu : même OG avec moins de malt à terme
              </Text>
              <Text style={styles.bullet}>
                • Bénéfice : coût réduit + brassins plus prévisibles
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Pièges fréquents à éviter</Text>
              <Text style={styles.bullet}>
                • Utiliser un rendement “théorique” jamais vérifié
              </Text>
              <Text style={styles.bullet}>
                • Changer 3 paramètres en même temps (impossible à
                diagnostiquer)
              </Text>
              <Text style={styles.bullet}>
                • Oublier la correction de température sur la densité
              </Text>
              <Text style={styles.bullet}>
                • Confondre rendement extraction et rendement global packaging
              </Text>
            </Card>
          </>
        ) : isLevures ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi la levure est critique
              </Text>
              <Text style={styles.paragraph}>
                La levure transforme le moût sucré en alcool, CO₂ et composés
                aromatiques. C'est elle qui fait passer une recette correcte à
                une bière propre, expressive et stable.
              </Text>
              <Text style={styles.bullet}>
                • Elle pilote FG, ABV et sensation de sécheresse
              </Text>
              <Text style={styles.bullet}>
                • Elle définit le profil style (Ale fruitée vs Lager propre)
              </Text>
              <Text style={styles.bullet}>
                • Une levure mal gérée = off-flavors ou fermentation bloquée
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Les 4 piliers d'une fermentation réussie
              </Text>
              <Text style={styles.bullet}>
                1) Quantité (pitch rate) : assez de cellules dès le départ
              </Text>
              <Text style={styles.bullet}>
                2) Viabilité : levure fraîche et active
              </Text>
              <Text style={styles.bullet}>
                3) Température : plage adaptée à la souche
              </Text>
              <Text style={styles.bullet}>
                4) Nutrition/oxygène : bon départ de multiplication cellulaire
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • Pitch rate Ale : ~0,75 M cellules / mL / °Plato
              </Text>
              <Text style={styles.bullet}>
                • Pitch rate Lager : ~1,5 M cellules / mL / °Plato
              </Text>
              <Text style={styles.bullet}>
                • Atténuation : % des sucres fermentés (impact direct sur FG)
              </Text>
              <Text style={styles.bullet}>
                • Floculation : vitesse de sédimentation de la levure
              </Text>
              <Text style={styles.bullet}>
                • Température = levier majeur sur esters/phénols
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Formules clés</Text>
              <Text style={styles.formula}>
                Cellules = Pitch rate × °Plato × Volume (mL)
              </Text>
              <Text style={styles.formula}>
                FG = OG - (OG - 1) × (Atténuation / 100)
              </Text>
              <Text style={styles.formula}>ABV ≈ (OG - FG) × 131,25</Text>
              <Text style={styles.paragraph}>
                Avec ces 3 formules, tu peux prévoir la dose de levure,
                l'atterrissage de fermentation et l'alcool final attendu.
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple concret (IPA 20L)</Text>
              <Text style={styles.bullet}>• OG 1,065 ≈ 16,25 °Plato</Text>
              <Text style={styles.bullet}>
                • Besoin cellules (Ale) : 0,75 × 16,25 × 20 000 ≈ 244 milliards
              </Text>
              <Text style={styles.bullet}>
                • En pratique : ~2 sachets de levure sèche moderne
              </Text>
              <Text style={styles.bullet}>
                • Avec atténuation 80% : FG ≈ 1,013 ; ABV ≈ 6,8%
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Choisir la levure selon le style
              </Text>
              <Text style={styles.bullet}>
                • US-05 : neutre et polyvalente (IPA/Pale Ale)
              </Text>
              <Text style={styles.bullet}>
                • S-04 : plus britannique, fruité léger, floculente
              </Text>
              <Text style={styles.bullet}>
                • WB-06 : profil Weizen (banane/clou girofle)
              </Text>
              <Text style={styles.bullet}>
                • BE-134 : Saison sèche, épicée, très atténuante
              </Text>
              <Text style={styles.bullet}>
                • W-34/70 : référence Lager propre et nette
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Température et impact aromatique
              </Text>
              <Text style={styles.bullet}>
                • Plus bas = profil plus propre, moins d'esters
              </Text>
              <Text style={styles.bullet}>
                • Plus haut = plus fruité/épicé (selon la souche)
              </Text>
              <Text style={styles.bullet}>
                • Trop chaud = risque solvants/alcools fusel
              </Text>
              <Text style={styles.bullet}>
                • Trop froid = fermentation lente ou incomplète
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Pièges fréquents à éviter</Text>
              <Text style={styles.bullet}>
                • Sous-pitch : fermentation lente, FG trop haute
              </Text>
              <Text style={styles.bullet}>
                • Levure trop vieille : viabilité insuffisante
              </Text>
              <Text style={styles.bullet}>
                • Mauvais contrôle de température : off-flavors
              </Text>
              <Text style={styles.bullet}>
                • Oxygénation insuffisante du moût avant ensemencement
              </Text>
              <Text style={styles.bullet}>
                • Oublier un diacetyl rest sur certaines Lagers
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Checklist pré-pitch</Text>
              <Text style={styles.bullet}>
                □ Vérifier date et état de la levure
              </Text>
              <Text style={styles.bullet}>
                □ Calculer les cellules nécessaires (volume + OG)
              </Text>
              <Text style={styles.bullet}>
                □ Réhydrater (levure sèche) ou starter (levure liquide) si
                besoin
              </Text>
              <Text style={styles.bullet}>
                □ Oxygéner le moût puis ensemencer à la bonne température
              </Text>
            </Card>
          </>
        ) : isCarbonatation ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi la carbonatation est critique
              </Text>
              <Text style={styles.paragraph}>
                La carbonatation ne sert pas qu'à faire des bulles : elle
                influence la mousse, la perception des arômes et la sensation en
                bouche. Une cible bien choisie renforce le style ; une cible mal
                ajustée peut déséquilibrer toute la bière.
              </Text>
              <Text style={styles.bullet}>
                • Trop faible : bière plate, mousse fragile
              </Text>
              <Text style={styles.bullet}>
                • Trop élevée : gushing, sensation agressive
              </Text>
              <Text style={styles.bullet}>
                • Bonne cible = style respecté + service plus propre
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Repères rapides</Text>
              <Text style={styles.bullet}>
                • Volumes de CO₂ : 1 volume = 1 L de CO₂ dissous par litre de
                bière
              </Text>
              <Text style={styles.bullet}>
                • CO₂ résiduel : déjà présent après fermentation, dépend de la
                température
              </Text>
              <Text style={styles.bullet}>
                • Plus la bière est froide, plus elle retient naturellement le
                CO₂
              </Text>
              <Text style={styles.bullet}>
                • Priming : ajout de sucre avant embouteillage pour générer le
                CO₂ manquant
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Formule de priming (glucose)
              </Text>
              <Text style={styles.formula}>
                Sucre (g) ≈ (CO₂ cible - CO₂ résiduel) × Volume (L) × 4,0
              </Text>
              <Text style={styles.paragraph}>
                La constante 4,0 est un repère pratique pour le glucose
                (dextrose). Pour du sucre de table (saccharose), la quantité est
                légèrement plus faible à objectif identique.
              </Text>
              <Text style={styles.formula}>
                Saccharose (g) ≈ (CO₂ cible - CO₂ résiduel) × Volume (L) × 3,8
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                CO₂ résiduel selon température (ordre de grandeur)
              </Text>
              <Text style={styles.bullet}>• 0°C : ~1,7 vol</Text>
              <Text style={styles.bullet}>• 10°C : ~1,2 vol</Text>
              <Text style={styles.bullet}>• 20°C : ~0,85 vol</Text>
              <Text style={styles.bullet}>
                • Toujours prendre la température la plus haute atteinte avant
                conditionnement
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Exemple concret</Text>
              <Text style={styles.bullet}>
                • Lot : 20 L à 20°C, cible 2,4 vol de CO₂
              </Text>
              <Text style={styles.bullet}>
                • CO₂ résiduel estimé : 0,85 vol
              </Text>
              <Text style={styles.bullet}>• ΔCO₂ = 2,4 - 0,85 = 1,55 vol</Text>
              <Text style={styles.bullet}>
                • Dextrose ≈ 1,55 × 20 × 4,0 ≈ 124 g
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Cibles utiles par style</Text>
              <Text style={styles.bullet}>
                • Bitter / Stout anglaise : ~1,8 à 2,2 vol
              </Text>
              <Text style={styles.bullet}>
                • Pale Ale / IPA : ~2,2 à 2,6 vol
              </Text>
              <Text style={styles.bullet}>
                • Belgian Ale / Wheat : ~2,6 à 3,2 vol
              </Text>
              <Text style={styles.bullet}>
                • Saison / Weizen : ~3,0 à 4,0 vol (bouteilles adaptées
                indispensables)
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Priming bouteille vs force carbonation (fût)
              </Text>
              <Text style={styles.bullet}>
                • Priming : simple, autonome, style traditionnel bouteille
              </Text>
              <Text style={styles.bullet}>
                • Force carb : rapide, précis, idéal service en fût
              </Text>
              <Text style={styles.bullet}>
                • En fût, pression cible dépend de la température de service
              </Text>
              <Text style={styles.bullet}>
                • En bouteille, homogénéiser le sirop de sucre est essentiel
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Pièges et sécurité</Text>
              <Text style={styles.bullet}>
                • Embouteiller trop tôt (FG non stable) = surpression dangereuse
              </Text>
              <Text style={styles.bullet}>
                • Dosage approximatif du sucre = carbonatation incohérente
              </Text>
              <Text style={styles.bullet}>
                • Mauvaise homogénéisation = bouteilles sous/sur-carbonatées
              </Text>
              <Text style={styles.bullet}>
                • Utiliser uniquement des bouteilles compatibles pression
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Checklist conditionnement</Text>
              <Text style={styles.bullet}>
                □ Vérifier la stabilité FG sur 2-3 jours
              </Text>
              <Text style={styles.bullet}>
                □ Mesurer la température max atteinte avant packaging
              </Text>
              <Text style={styles.bullet}>
                □ Calculer et peser précisément le sucre de priming
              </Text>
              <Text style={styles.bullet}>
                □ Mélanger doucement et uniformément avant soutirage
              </Text>
              <Text style={styles.bullet}>
                □ Contrôler une bouteille test après 7-10 jours
              </Text>
            </Card>
          </>
        ) : isAvances ? (
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
        ) : isGlossaire ? (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Pourquoi un glossaire brassicole
              </Text>
              <Text style={styles.paragraph}>
                En brassage, les décisions dépendent souvent d'un mot technique
                bien compris : OG, atténuation, IBU, FAN, etc. Ce glossaire est
                pensé comme une base de référence rapide pour fiabiliser tes
                recettes et mieux lire les fiches techniques.
              </Text>
              <Text style={styles.bullet}>
                • Objectif : parler le même langage à chaque brassin
              </Text>
              <Text style={styles.bullet}>
                • Référence utile du débutant au niveau avancé
              </Text>
              <Text style={styles.bullet}>
                • Complément direct des fiches Fermentescibles, Eau, Levures,
                etc.
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Comment lire une entrée</Text>
              <Text style={styles.bullet}>• Définition simple du terme</Text>
              <Text style={styles.bullet}>
                • Unité associée (si applicable)
              </Text>
              <Text style={styles.bullet}>
                • Impact pratique sur ton process (empâtage, fermentation,
                conditionnement)
              </Text>
              <Text style={styles.bullet}>
                • Erreur fréquente à éviter ou confusion courante
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Familles de termes couvertes
              </Text>
              <Text style={styles.bullet}>
                • Densité & alcool : OG, FG, ABV, atténuation, °Plato
              </Text>
              <Text style={styles.bullet}>
                • Amertume & couleur : IBU, BU:GU, MCU, SRM, EBC
              </Text>
              <Text style={styles.bullet}>
                • Eau & chimie : pH, RA, sulfates, chlorures, bicarbonates
              </Text>
              <Text style={styles.bullet}>
                • Fermentation : pitch rate, floculation, diacetyl rest, FAN
              </Text>
              <Text style={styles.bullet}>
                • Process avancé : WKU, Kolbach, β-glucanes, extractibilité
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                10 repères incontournables
              </Text>
              <Text style={styles.bullet}>
                • OG : densité du moût avant fermentation
              </Text>
              <Text style={styles.bullet}>
                • FG : densité finale après fermentation
              </Text>
              <Text style={styles.bullet}>
                • ABV : pourcentage d'alcool final (% vol)
              </Text>
              <Text style={styles.bullet}>
                • IBU : intensité d'amertume perçue
              </Text>
              <Text style={styles.bullet}>• EBC/SRM : échelles de couleur</Text>
              <Text style={styles.bullet}>
                • pH : acidité du milieu (clé en empâtage)
              </Text>
              <Text style={styles.bullet}>
                • Atténuation : part des sucres fermentés
              </Text>
              <Text style={styles.bullet}>
                • Pitch rate : dose de levure nécessaire
              </Text>
              <Text style={styles.bullet}>
                • RA : capacité tampon de l'eau (impact pH)
              </Text>
              <Text style={styles.bullet}>
                • Volumes CO₂ : niveau de carbonatation
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Confusions fréquentes</Text>
              <Text style={styles.bullet}>
                • OG/FG (mesures) vs ABV (résultat calculé)
              </Text>
              <Text style={styles.bullet}>
                • EBC du malt vs EBC final de la bière
              </Text>
              <Text style={styles.bullet}>
                • IBU théoriques vs amertume réellement perçue
              </Text>
              <Text style={styles.bullet}>
                • SG, points et °Plato mélangés sans conversion
              </Text>
              <Text style={styles.bullet}>
                • pH cible d'empâtage vs pH mesuré à chaud non corrigé
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Méthode d'apprentissage rapide
              </Text>
              <Text style={styles.bullet}>
                1) Mémoriser d'abord les 10 repères incontournables
              </Text>
              <Text style={styles.bullet}>
                2) Associer chaque terme à une décision concrète de brassage
              </Text>
              <Text style={styles.bullet}>
                3) Noter les unités à côté de tes mesures dans ton carnet
              </Text>
              <Text style={styles.bullet}>
                4) Revenir au glossaire après chaque brassin pour consolider
              </Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Checklist de lecture technique
              </Text>
              <Text style={styles.bullet}>
                □ Je comprends les unités des valeurs annoncées
              </Text>
              <Text style={styles.bullet}>
                □ Je distingue bien mesures, calculs et cibles
              </Text>
              <Text style={styles.bullet}>
                □ Je sais quel levier process agit sur chaque terme
              </Text>
              <Text style={styles.bullet}>
                □ Je peux expliquer simplement les principaux acronymes
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
