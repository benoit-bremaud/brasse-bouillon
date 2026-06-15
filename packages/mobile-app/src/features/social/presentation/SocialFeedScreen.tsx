import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";

const ebcToSrm = (ebc: number): number => ebc * 0.508;

type SocialPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorBadge: string;
  beerName: string;
  beerStyle: string;
  beerColorEbc: number;
  postedAgo: string;
  likes: number;
  comments: number;
  caption: string;
};

const POSTS: ReadonlyArray<SocialPost> = [
  {
    id: "p-pdd-marie",
    authorName: "Marie",
    authorInitials: "MD",
    authorBadge: "Premier brassin",
    beerName: "La Première du dimanche",
    beerStyle: "Blonde simple · EBC 8",
    beerColorEbc: 8,
    postedAgo: "il y a 2 j",
    likes: 12,
    comments: 3,
    caption:
      "Mon tout premier brassin maison ! Une blonde guidée pas-à-pas par l’app. Hâte d’ouvrir la première bouteille dimanche prochain.",
  },
  {
    id: "p-saison-leo",
    authorName: "Léo",
    authorInitials: "LM",
    authorBadge: "BIAB · 8 brassins",
    beerName: "Saison fermière",
    beerStyle: "Saison belge · EBC 12",
    beerColorEbc: 12,
    postedAgo: "il y a 3 j",
    likes: 8,
    comments: 1,
    caption:
      "Levurage à 22 °C avec une 3711 Belgian Saison. L’arôme poivré-fruité est déjà incroyable au glouglouteur.",
  },
  {
    id: "p-stout-camille",
    authorName: "Camille",
    authorInitials: "CA",
    authorBadge: "All-grain · 32 brassins",
    beerName: "Imperial Stout maison",
    beerStyle: "Imperial Stout · EBC 80",
    beerColorEbc: 80,
    postedAgo: "il y a 1 sem.",
    likes: 24,
    comments: 6,
    caption:
      "Brassin doublé pour vieillir sur fûts de bourbon. OG 1.092, ABV cible 9,2 %. La patience va être longue mais elle vaudra le coup.",
  },
  {
    id: "p-apa-marie",
    authorName: "Marie",
    authorInitials: "MD",
    authorBadge: "Premier brassin",
    beerName: "Petite APA du jardin",
    beerStyle: "American Pale Ale · EBC 14",
    beerColorEbc: 14,
    postedAgo: "il y a 2 sem.",
    likes: 15,
    comments: 4,
    caption:
      "Premier essai d’APA en BIAB. Dry-hop Citra + Mosaic à J+7. Sec, fruité, parfait pour l’apéro de samedi.",
  },
];

export function SocialFeedScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();

  const handleGoBack = () => {
    // "Communauté" is a top-level dock tab (no parent stack to pop), so
    // router.back() would fall through to the previously focused tab. The
    // back button reads "Retour à l’accueil" — send the user there explicitly.
    router.replace("/dashboard");
  };

  return (
    <Screen>
      <ListHeader
        title="Communauté"
        subtitle="Découvre les brassins partagés cette semaine"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour à l’accueil"
            onPress={handleGoBack}
          />
        }
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          +24 brassins partagés cette semaine
        </Text>
        <Text style={styles.bannerSubtitle}>
          Inspire-toi, pose des questions, célèbre les réussites.
        </Text>
      </View>

      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        renderItem={({ item }) => (
          <Card style={styles.postCard}>
            <View style={styles.postHeader}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: getSrmColor(ebcToSrm(item.beerColorEbc)) },
                ]}
                accessible={false}
              >
                <Text style={styles.avatarText}>{item.authorInitials}</Text>
              </View>
              <View style={styles.postHeaderText}>
                <Text style={styles.authorName}>{item.authorName}</Text>
                <Text style={styles.postMeta}>
                  {item.authorBadge} · {item.postedAgo}
                </Text>
              </View>
            </View>

            <View style={styles.beerLine}>
              <Text style={styles.beerName}>{item.beerName}</Text>
              <Badge label={item.beerStyle} variant="neutral" />
            </View>

            <Text style={styles.caption}>{item.caption}</Text>

            <View style={styles.reactions}>
              <Text style={styles.reaction} accessible={false}>
                🍻 {item.likes}
              </Text>
              <Text style={styles.reaction} accessible={false}>
                💬 {item.comments}
              </Text>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  bannerTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  bannerSubtitle: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
  },
  list: {},
  postCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
  },
  postMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: 2,
  },
  beerLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  beerName: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginRight: spacing.xs,
  },
  caption: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.sm,
  },
  reactions: {
    flexDirection: "row",
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.border,
  },
  reaction: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginRight: spacing.md,
  },
});
