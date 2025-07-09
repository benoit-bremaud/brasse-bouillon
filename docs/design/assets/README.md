# Design Assets – Brasse-Bouillon

This folder contains all source and exported design assets for the Brasse-Bouillon application. Assets are grouped by type (logo, typography, UI components, palette) and are referenced throughout the design charter and implementation.

## Structure

```text
assets/
├── logo/             # Main and icon logos in SVG/PNG
│   ├— logo-primary.svg         # Official vector logo (monochrome)
│   ├— logo-primary.png         # Official raster logo (full color)
│   ├— logo-primary-64x64.png   # Export for favicon/small icons
│   ├— logo-primary-128x128.png # Export for mobile app icon
│   ├— logo-primary-256x256.png # Export for web header and splash screens
│   └— logo-primary-512x512.png # Export for high-res splash screens
├── palette/          # Color references in .json/.md formats
├── typography/       # Fonts, weights, usage docs
└── ui/               # Buttons, inputs, icons, etc.
```

## Usage Guidelines

* Do not modify assets manually. All updates must go through design validation.
* Filenames must be lowercase, kebab-case (e.g., `logo-primary.svg`, `color-palette.json`)
* For new assets, ensure alignment with the styleguide and add a short description in the corresponding subfolder's `README.md` (if applicable).
* Use the appropriate export size:

  * `64x64` for favicon or tiny icons.
  * `128x128` for mobile app icons.
  * `256x256` for web headers, previews, or splash screens.
  * `512x512` for high-resolution splash screens or marketing materials.

## Versioning

* Exported visual assets should reflect the latest approved visual identity.
* When assets are finalized, they should be referenced from `charte_graphique.md` and `styleguide.md`.
* Older versions of logos should be archived in a `/deprecated/` subfolder if needed.

## Notes

🗼 Assets will be finalized during milestones CG3 (visual identity), CG5 (mockups), and CG6 (delivery).

## Contributors

If adding new files here:

1. Inform the design team.
2. Document their purpose and usage in this `README.md`.
3. Ensure all logos comply with the official color palette and style guide.

---

> 💡 Tip: All exported logos here are optimized for app and web use (transparent background, precise alignment).
