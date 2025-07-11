# 📘 Brasse-Bouillon – Design Charter

> This document defines the visual, identity, and communication foundations of the Brasse-Bouillon project.
> It provides clear guidelines to maintain visual coherence, strengthen brand identity, and deliver a unique user experience.

The design charter evolves continuously throughout Brasse-Bouillon's development and should be reviewed at least once per major design milestone or every six months to ensure alignment with evolving project needs. It serves as a collaborative reference for all contributors: developers, designers, and community members.

---

## 📋 Table of Contents

1. [Introduction & Scope](#1-introduction--scope)
2. [Core Values](#2-core-values)
3. [Culture & Spirit](#3-culture--spirit)
4. [Communication Tone](#4-communication-tone)
5. [Purpose & Vision](#5-purpose--vision)
6. [Iconography & Illustration](#6-iconography--illustration)
7. [Logo Usage Guidelines](#7-logo-usage-guidelines)
8. [Color System](#8-color-system)
9. [Visual System](#9-visual-system)
10. [UI Styleguide Reference](#10-ui-styleguide-reference)
11. [References & Maintenance](#11-references--maintenance)

---

## 1. Introduction & Scope

Brasse-Bouillon is a community-driven, open-source project designed to empower amateur brewers.
This charter documents the project's visual and communication principles.

It covers:

* Brand values
* Cultural identity
* Communication tone
* Visual design guidelines

All visual guidelines must stay aligned with the Figma Design System and the global UI design tokens. Regular reviews should occur at least once every design milestone or every six months to ensure alignment.

---

## 2. Core Values

Brasse-Bouillon is built upon core values that guide every aspect of the project:

1. **Community:** Empowering users to connect, share, and grow together as passionate homebrewers.
2. **Accessibility:** Making brewing knowledge and tools available to everyone.
3. **Quality:** Ensuring a robust, enjoyable, and reliable experience across all touchpoints.
4. **Transparency:** Communicating openly and sharing knowledge through open-source principles.
5. **Innovation:** Continuously improving to enrich the brewing experience.

---

## 3. Culture & Spirit

Brasse-Bouillon is more than a tool—it's a collaborative adventure inspired by DIY brewing.

* **DIY Spirit:** Promoting hands-on experimentation and learning.
* **Creativity:** Encouraging recipe innovation and personal brewing styles.
* **Collaboration:** Emphasizing collective contribution and knowledge exchange.
* **Learning & Sharing:** Fostering open discussions on brewing successes and failures.
* **Openness:** Welcoming brewers of all backgrounds and experience levels.

---

## 4. Communication Tone

Brasse-Bouillon maintains a **friendly, inclusive, professional, and playful** tone in all interactions.

### Key Characteristics

* **Friendly & Supportive:** Every question is welcomed.
* **Inclusive:** Every user, from kitchen brewer to seasoned veteran, belongs.
* **Professional (but not boring):** Clear, approachable guidance.
* **Playful & DIY-Inspired:** Fun, flexible, and open to experimentation.

*The community encourages experimentation and celebrates both successes and mistakes.*

---

## 5. Purpose & Vision

### User Challenges Addressed

* Scattered recipe data
* Complex brewing calculations
* Fragmented brewing knowledge
* Lack of a dedicated community space

### Purpose

**To provide a modern, intuitive, and community-centered platform for homebrewing, empowering users through recipe management, guided brewing, and knowledge sharing.**

### Vision

In the next five years, Brasse-Bouillon aims to become the reference hub for homebrewers:

* Share, refine, and document brewing knowledge
* Offer intelligent tools to simplify brewing
* Remain open-source and community-powered
* Connect users with local suppliers and events

**Brasse-Bouillon is a dynamic ecosystem dedicated to collective brewing growth.**

---

## 6. Iconography & Illustration

*Visual identity plays a key role in defining the Brasse-Bouillon experience. Icons and illustrations create an emotional connection with users and reinforce the playful, welcoming atmosphere central to the app's design.*

### Visual Direction

Brasse-Bouillon's iconography features a playful, vintage-inspired cartoon aesthetic:

* **Line Thickness:** Approximately 2px with rounded corners
* **Color Palette:** Warm, earthy tones optimized for dark backgrounds
* **Style:** Flat, cartoon-like characters with subtle depth
* **Minimum Size:** 64x64 px for clarity

### Illustration Concepts

#### Hero Images

Festive, large-scale scenes for app intros and featured pages.

#### Empty States

Visuals for screens without content.

#### Onboarding

Welcoming and instructional visuals.

#### Success & Rewards

Celebratory visuals for user achievements.

### Figma Styleguide

All icons and illustrations are organized in the Figma page:

**Mini-Styleguide · Icons & Illustrations**

Includes:

* Icon sets categorized by use
* Annotated guidelines for size, usage, and spacing
* Contribution best practices for adding new icons and illustrations

### Documentation Reference

All design guidelines must remain aligned with this document and the Figma file.

---

## 7. Logo Usage Guidelines

The logo is a central element of Brasse-Bouillon's brand identity.

### Logo Files

* `logo-primary.svg` ➞ Official vector logo (monochrome)
* `logo-primary.png` ➞ Official raster logo (full color)
* `logo-primary-64x64.png` ➞ Favicon and small icon export
* `logo-primary-128x128.png` ➞ Mobile app icon export
* `logo-primary-256x256.png` ➞ Web header and splash screen export
* `logo-primary-512x512.png` ➞ High-resolution splash screen export
* `logo-preview.png` ➞ Quick preview of the logo for documentation and app previews

### Logo Guidelines

* Always use the latest approved version of the logo, as validated by the design lead or designated design approver.
* Do not manually modify the logo files.
* Respect minimum clear space and sizing:

  * Minimum size: 64x64 px
  * Maintain sufficient clear space around the logo equivalent to half of its height.
* Archive outdated logo versions in `/deprecated/` if necessary.

### Usage Contexts

The logo must be used in accordance with these standards across:

* Mobile application
* Website and promotional pages
* Marketing and presentation materials

### Logo Icon & Favicon Guidelines

To ensure visual consistency across platforms, Brasse-Bouillon uses a dedicated square icon derived from its primary logo.

#### Icon Files

* `logo-icon.svg` ➞ Square vector icon, centered on the mascot (without text).
* `logo-icon-16.png` ➞ PNG icon (16×16 px) for minimal UI elements.
* `logo-icon-32.png` ➞ PNG icon (32×32 px) for higher-resolution needs.
* `logo-icon-64.png` ➞ Optional larger PNG icon for specific uses.
* `favicon.ico` ➞ Multi-resolution web favicon containing 16×16 and 32×32 sizes.

#### Usage Guidelines

* The square icon is intended for:

  * Mobile app icons.
  * Toolbar icons and compact UI placements.
  * Favicons for websites and browser tabs.

* Always prefer the SVG version for scalability when supported.

* Do not use the icon as a replacement for the full logo in marketing, branding, or large-scale displays.

#### Technical Notes

* The icon is derived directly from the main logo’s mascot to maintain brand recognition.
* Ensure sufficient contrast and sizing, especially for small displays. Refer to the Color System section for recommended contrast guidelines.

> 📜 Remember: Only the official exported files should be used to avoid distortions or color mismatches.

---

## 8. Color System

The Brasse-Bouillon color system defines the official color palette to ensure a cohesive, accessible, and consistent user experience.

### Core Palette

* **Primary:** `#a06a3a` (Main brand color for key highlights and primary actions)
* **Secondary:** `#8d5832` (Secondary accent color)
* **Background:** `#e0d3aa` (Soft beige for UI backgrounds)

### Semantic Colors

* **Success:** `#6b6b2c` (Indicates positive states and confirmations)
* **Error:** `#573921` (Denotes errors or critical messages)
* **Warning:** `#d9b364` (Highlights cautionary information)
* **Info:** `#e5e5e5` (Used for informational backgrounds and neutral elements)

### Neutral Colors

* **Neutral Light:** `#ffffff` (White for clean backgrounds and high contrast text)
* **Neutral Dark:** `#000000` (Black for text and strong contrasts)
* **Shadow:** `#1e1e1e` (Dark grey for shadows and depth effects)

### Accessibility Compliance

* All colors have been tested against WCAG AA standards for contrast, ensuring compliance with accessibility best practices.
* Adjustments were applied to Primary, Background, Info, and Success colors to improve readability.
* Full testing results and contrast ratios are documented in `docs/design/assets/palette/color-contrast-analysis.md`. Contrast tests should be reviewed after every major palette update or design milestone.

---

## 9. Visual System

This section defines the foundational visual system rules for the Brasse-Bouillon Design System, ensuring layout consistency and harmonious visual rhythm across all screens.

### 1. Grid System

The grid system defines the structural layout framework for Brasse-Bouillon, following a mobile-first approach to ensure accessibility and simplicity.

#### Grid Specifications (Mobile)

* **Number of Columns:** 4
* **Gutter (Spacing Between Columns):** 16px
* **Outer Margins (Horizontal Padding):** 16px on both sides

#### Rationale

This 4-column grid allows flexible and straightforward layouts on small screens while maintaining sufficient breathing space. The 16px gutter and outer margins ensure a balanced and consistent visual rhythm.

#### Note

This grid system can be expanded for larger screens (e.g., tablets, desktops) by increasing the number of columns (e.g., 8 or 12) and adjusting gutters and margins accordingly.

### 2. Spacing Scale

The spacing scale defines standardized spacing increments for margins and paddings, ensuring consistent vertical and horizontal rhythm across the interface.

#### Spacing Tokens

| Token        | Value (px) | Recommended Usage                         |
|--------------|------------|------------------------------------------|
| `spacing-xxs`| 4px        | Minimal gaps (e.g., between icons and text)|
| `spacing-xs` | 8px        | Small gaps for tight spaces               |
| `spacing-sm` | 12px       | Small paddings or margins for compact UI elements |
| `spacing-md` | 16px       | Default spacing for most mobile layouts   |
| `spacing-lg` | 24px       | Section spacing on mobile                 |
| `spacing-xl` | 32px       | Large gaps (e.g., section separators)     |
| `spacing-xxl`| 40px       | Very large gaps, primarily for large screens or feature sections |

#### Note

This scale is designed to support mobile-first layouts but scales effectively for larger screens if needed. All components should adhere to this system to maintain a unified appearance.

### 3. Corner Radii

Corner radii establish the standard levels of border roundness applied to UI components, ensuring visual consistency throughout the Brasse-Bouillon application.

#### Radius Tokens

| Token         | Value (px) | Recommended Usage                                    |
|---------------|------------|------------------------------------------------------|
| `radius-xs`   | 4px        | Small elements such as badges or small icon containers |
| `radius-sm`   | 8px        | Default for buttons, input fields, and modal corners   |
| `radius-md`   | 12px       | Used for cards, larger containers, or main sections    |
| `radius-full` | 9999px     | Fully circular shapes (e.g., avatars, round buttons)   |

#### Note

All UI components should follow these standardized corner radii to maintain a cohesive design language across screens and devices.

### 4. Shadow Styles

Shadow styles define the depth and elevation of UI components, helping to establish visual hierarchy and improve focus on interactive elements.

#### Shadow Tokens

| Token       | CSS Value                                  | Recommended Usage                          |
|-------------|-------------------------------------------|-------------------------------------------|
| `shadow-sm` | 0px 1px 2px rgba(0, 0, 0, 0.1)            | Light shadows for subtle elements like buttons or small containers |
| `shadow-md` | 0px 4px 8px rgba(0, 0, 0, 0.1)            | Medium elevation for cards or floating panels |
| `shadow-lg` | 0px 8px 16px rgba(0, 0, 0, 0.15)          | Large elevation for modals, overlays, or important UI layers |

#### Note

Use these shadow styles consistently to ensure a balanced visual hierarchy across the application. Avoid adding custom shadow styles outside of these defined levels.

---

## 10. UI Styleguide Reference

For detailed component specifications, visual states, and best practices, refer to the dedicated Styleguide document:

* [`styleguide.md`](../../03_styleguide/styleguide.md)

#### Included Sections in Styleguide

* Color Palette & Typography Overview
* Form Inputs (Text, Number, Textarea, Select, Checkbox, Radio)
* Visual States for Inputs
* Best Practices for UI Consistency

#### Cross-Linking

The styleguide complements this Design Charter by offering:

* Visual component breakdowns
* Detailed design tokens references
* Layout and interaction guidelines

All contributors should refer to both documents to ensure alignment between visual identity, UI components, and user experience guidelines.

---

## 11. References & Maintenance

* Figma Design System Link: [Moodboard Brasse-Bouillon](https://www.figma.com/design/oa9YEpt96DTZ8c05fk5hd4/Moodboard-Brasse-Bouillon?node-id=0-1&m=dev&t=DWWAPUMjSG5C33rG-1)
* Update Process: This document is updated regularly as the project evolves.
* Contributors: Designers, developers, and community members.

**Reminder:** All design updates must respect the project's core visual identity and values.

---

*This design charter ensures Brasse-Bouillon remains welcoming, cohesive, and creatively inspiring.*
