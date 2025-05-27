# Design Assets – Brasse-Bouillon

This folder contains all source and exported design assets for the Brasse-Bouillon application. Assets are grouped by type (logo, typography, UI components, palette) and are referenced throughout the design charter and implementation.

## Structure

```text
assets/
├── logo/           # Main and icon logos in SVG/PNG
├── palette/        # Color references in .json/.md formats
├── typography/     # Fonts, weights, usage docs
└── ui/             # Buttons, inputs, icons, etc.
```

## Usage Guidelines

* Do not modify assets manually. All updates must go through design validation.
* Filenames must be lowercase, kebab-case (e.g., `logo-primary.svg`, `color-palette.json`)
* For new assets, ensure alignment with the styleguide and add a short description in the corresponding subfolder's `README.md` (if applicable)

## Versioning

* Exported visual assets should reflect the latest approved visual identity
* When assets are finalized, they should be referenced from `charte_graphique.md` and `styleguide.md`

## Notes

✅ Assets will be finalized during milestones CG3 (visual identity), CG5 (mockups), and CG6 (delivery).

---

For contributors: If adding new files here, please inform the team and make sure to document their purpose and usage.
