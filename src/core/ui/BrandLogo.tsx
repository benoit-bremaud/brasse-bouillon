import { Image, ImageStyle, StyleProp, StyleSheet, View } from "react-native";

import React from "react";
import logoPrimary from "../../../assets/images/brasse-bouillon-logo-primary-512.png";

type BrandLogoVariant = "primary" | "icon";

type BrandLogoProps = {
  size?: number;
  variant?: BrandLogoVariant;
  style?: StyleProp<ImageStyle>;
  withContainer?: boolean;
};

const LOGO_SOURCES = {
  primary: logoPrimary,
  icon: logoPrimary,
} as const;

export function BrandLogo({
  size = 64,
  variant = "primary",
  style,
  withContainer = false,
}: BrandLogoProps) {
  const image = (
    <Image
      source={LOGO_SOURCES[variant]}
      resizeMode="contain"
      style={[styles.logo, { width: size, height: size }, style]}
      accessibilityRole="image"
      accessibilityLabel="Brasse Bouillon logo"
    />
  );

  if (!withContainer) {
    return image;
  }

  return <View style={styles.container}>{image}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    alignSelf: "center",
  },
});
