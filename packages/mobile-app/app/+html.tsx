import { ScrollViewStyleReset } from "expo-router/html";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/*
          Force light color scheme to prevent browser auto-dark-mode tinting
          (Issue #734). Without this, browsers with "Auto Dark Mode for Web
          Contents" enabled (Chrome flag, OS dark theme) desaturate the
          EBC-driven hero colors of BeerInfoCardScreen — Punk IPA's amber
          renders as olive-green, Rochefort 10's deep brown washes out.
          The DOM still receives the right hex codes; this meta tag just
          tells the browser to render them faithfully without inversion.
        */}
        <meta name="color-scheme" content="light" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color stays light. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

// Forced light background — no `prefers-color-scheme: dark` override anymore.
// The app intentionally renders in light mode regardless of OS theme so the
// brewing-color palette stays faithful to the SRM/EBC reference.
const responsiveBackground = `
body {
  background-color: #fff;
}`;
