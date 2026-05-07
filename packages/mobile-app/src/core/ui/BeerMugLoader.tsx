import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/core/theme";

import beerMugAnimation from "../../../assets/lottie/beer-mug-fill.json";

export type BeerMugLoaderSize = "small" | "medium" | "large";

export type BeerMugLoaderProps = {
  size?: BeerMugLoaderSize;
  message?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export function BeerMugLoader({
  size = "medium",
  message,
  testID = "beer-mug-loader",
  accessibilityLabel = "Chargement en cours",
}: Readonly<BeerMugLoaderProps>) {
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      <LottieView
        testID={`${testID}-lottie`}
        source={beerMugAnimation}
        autoPlay
        loop
        style={lottieStyles[size]}
      />
      {message ? (
        <Text testID={`${testID}-message`} style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: spacing.xs,
    color: colors.brand.secondary,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
});

const lottieStyles = StyleSheet.create({
  small: { width: 24, height: 24 },
  medium: { width: 48, height: 48 },
  large: { width: 96, height: 96 },
});
