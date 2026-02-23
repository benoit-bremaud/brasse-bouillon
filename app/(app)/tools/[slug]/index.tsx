import { Redirect, useLocalSearchParams } from "expo-router";

export default function AcademyTopicDetailsRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  if (!normalizedSlug) {
    return <Redirect href="/(app)/academy" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/(app)/academy/[slug]",
        params: { slug: normalizedSlug },
      }}
    />
  );
}
