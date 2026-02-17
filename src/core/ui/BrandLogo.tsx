import { Image, ImageStyle, StyleProp, StyleSheet, View } from "react-native";

import React from "react";
import logoIcon from "../../../assets/images/brasse-bouillon-logo-icon-64.png";
import logoPrimary from "../../../assets/images/brasse-bouillon-logo-primary-256x256.png";

type BrandLogoVariant = "primary" | "icon";

type BrandLogoProps = {
  size?: number;
  variant?: BrandLogoVariant;
  style?: StyleProp<ImageStyle>;
  withContainer?: boolean;
};

const LOGO_SOURCES = {
  primary: logoPrimary,
  icon: logoIcon,
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
