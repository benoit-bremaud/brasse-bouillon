# Brasse-Bouillon Design Charter – Development Plan

This document defines the development structure for the Brasse-Bouillon design charter. It serves as a comprehensive roadmap for gradually building a coherent, accessible, and professional visual identity aligned with the functional and technical requirements of the mobile-first application.

Each phase (CG0 to CG6) corresponds to a dedicated milestone in the GitHub Project `brasse-bouillon · Charte Graphique`. Every section outlines the atomic tasks to be completed and the expected deliverables. This document will be regularly updated throughout the design process until final delivery.

---

## CG0 – Development Plan

* Define the roadmap structure
* Organize milestones and planning scope
* Validate the plan with the team before execution

---

## CG1 – Analysis & Preparation

* Define project identity pillars (values, tone, purpose)
* Identify target audience and user expectations
* Analyze competing applications and visual trends
* Gather legal & compliance constraints:
  * Define GDPR UI requirements (explicit opt‑in, separate consents, revocation, privacy policy link)
  * Specify data retention disclosures (duration + user deletion/export)
  * Identify restrictions requiring age verification and parental consent (<15)
  * Define criteria for age verification methods (proportionality, data minimization, robustness, independence)
  * Link summary to `docs/design/design-charter.md` under "Legal & Compliance Constraints"
* Compile accessibility constraints (WCAG 2.2 AA + RGAA v4):
  * List WCAG 2.2 AA success criteria and RGAA‑specific obligations
  * Define measurable metrics: contrast ratios, focus visibility, target sizes, form accessibility, drag alternatives, authentication, help visibility, alt-text
  * Link checklist to `docs/design/design-charter.md#accessibility-constraints-(wcag 2.2 aa+-+rgaa v4)`
* Compile inspirational and reference material
* Compile design checklists from constraints:
  * Draft measurable rules: contrast, typography, touch target, keyboard, focus, forms, media, semantic HTML, alt-text, help/session
  * Link checklist to `docs/design/design-charter.md#accessibility-constraints-(wcag 2.2 aa+-+rgaa v4)`

---

## CG2 – Moodboard & Art Direction

* Collect visual inspirations (color, typography, icons, layout)
* Select initial color palettes
* Explore typography pairings
* Define iconography and illustration direction
* Assemble and present a moodboard using Figma, Canva, or Miro
* Validate art direction with the team

---

## CG3 – Identity & Visual Elements

* Design or refine the logo (SVG/PNG formats)
* Choose primary and secondary fonts for headers, text, UI
* Define the color system (primary, secondary, success, error, info)
* Build UI component styles (buttons, inputs, alerts, tooltips)
* Define visual system rules (spacing, radius, shadows, layout)
* Save finalized assets in `/frontend/assets/` and `/docs/design`

---

## CG4 – Wireframes

* Define the key screens to structure (Home, Dashboard, Recipe Editor, etc.)
* Sketch low-fidelity wireframes for UX logic and layout
* Organize screens into meaningful user flows
* Validate wireframes with internal reviews or early testers

---

## CG5 – High-Fidelity Mockups

* Build a structured UI kit in Figma with reusable components
* Design high-fidelity mockups for all major screens
* Apply consistent styleguide and identity rules
* Prepare screen variants (e.g., dark/light mode, mobile/tablet responsiveness)
* Export mockups and assets for frontend integration

---

## CG6 – Documentation & Delivery

* Complete the `charte_graphique.md` file (identity, colors, fonts, rules)
* Complete the `styleguide.md` file (UI components, states, usage examples)
* Provide implementation guidelines for developers
* Review, finalize, and validate visual assets and documentation
* Version and store all deliverables in GitHub

## Deliverables Overview

This section lists the expected design deliverables for the Brasse-Bouillon visual identity. All outputs must be versioned and organized within the appropriate folders of the project.

### 1. Documentation

* `docs/design/cg_plan.md` – Design charter development roadmap
* `docs/design/charte_graphique.md` – Visual identity guidelines (logo, colors, fonts, tone)
* `docs/design/styleguide.md` – Component style rules and UI patterns

### 2. Visual Identity Assets

* `logo-primary.svg`, `logo-icon.svg` – Vector logo formats
* `logo-preview.png` – Raster version for presentation
* `palette.theme.json`, `colors.md` – Color palette references
* `typography-guide.md`, `fonts.pdf` – Font families, sizes, weights and usage

### 3. UI Components & System

* `ui-kit.figma` – UI component kit (Figma file or link)
* `assets/ui_components/` – Exported buttons, inputs, icons, alerts, etc.

### 4. Wireframes

* `wireframes/*.png` – Low-fidelity screen layouts
* `wireframes/README.md` – Description and user flow mapping

### 5. Mockups

* `mockups/*.fig` or `.png` – High-fidelity application screens
* `mockups/README.md` – File usage instructions

### 6. Developer-Ready Assets

* `frontend/assets/` – Fonts, images, icons usable by frontend developers
* `docs/design/assets/` – Full archive of source design materials (optional)
