import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/core/theme";

import beerMugAnimation from "../../../assets/lottie/beer-mug-fill.json";

const SIZE_PX = {
  small: 24,
  medium: 48,
  large: 96,
} as const;

export type BeerMugLoaderSize = keyof typeof SIZE_PX;

export type BeerMugLoaderProps = {
  size?: BeerMugLoaderSize;
  message?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export const BeerMugLoader = ({
  size = "medium",
  message,
  testID = "beer-mug-loader",
  accessibilityLabel = "Chargement en cours",
}: BeerMugLoaderProps) => {
  const px = SIZE_PX[size];
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
        style={{ width: px, height: px }}
      />
      {message ? (
        <Text testID={`${testID}-message`} style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

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
