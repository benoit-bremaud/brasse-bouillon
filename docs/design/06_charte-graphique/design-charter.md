# 📘 Brasse-Bouillon – Design Charter

> This document defines the visual, identity, and communication foundations of the Brasse-Bouillon project.
> It provides clear guidelines to maintain visual coherence, strengthen brand identity, and deliver a unique user experience.

The design charter evolves continuously throughout Brasse-Bouillon's development and should be reviewed at least once per major design milestone or every six months to ensure alignment with evolving project needs. It serves as a collaborative reference for all contributors: developers, designers, and community members.

---

## 📋 Table of Contents

1. Introduction & Scope
2. Core Values
3. Culture & Spirit
4. Communication Tone
5. Purpose & Vision
6. Iconography & Illustration
7. Logo Usage Guidelines
8. Color System
9. Visual System
10. References & Maintenance

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

The grid system provides a flexible and consistent structure for arranging UI components across all views.

> 📝 To be detailed: Define the number of columns (e.g., 12-column grid), gutter sizes (spacing between columns), and outer margins (padding from screen edges).

### 2. Spacing Scale

The spacing scale establishes standardized values for margins and padding throughout the design system.

> 📝 To be detailed: Define the spacing increments (e.g., 4px, 8px, 16px, 24px, 32px, 40px) with corresponding usage recommendations.

### 3. Corner Radii

Corner radii define the standard border roundness applied to UI components such as buttons, cards, and inputs.

> 📝 To be detailed: List the main corner radius values (e.g., 4px, 8px, 12px) and specify which components use each value.

### 4. Shadow Styles

Shadow styles (or elevation levels) define the depth effect of UI components, contributing to the visual hierarchy.

> 📝 To be detailed: List shadow presets (with RGBA values, offsets, and blurs) and describe the typical usage of each.

> 📝 Note: These sections are placeholders and will be completed in upcoming iterations.

---

## 10. References & Maintenance

* Figma Design System Link: [Moodboard Brasse-Bouillon](https://www.figma.com/design/oa9YEpt96DTZ8c05fk5hd4/Moodboard-Brasse-Bouillon?node-id=0-1&m=dev&t=DWWAPUMjSG5C33rG-1)
* Update Process: This document evolves with the project.
* Contributors: Designers, developers, and community members.

**Reminder:** All design updates must respect the project's core visual identity and values.

---

*This design charter ensures Brasse-Bouillon remains welcoming, cohesive, and creatively inspiring.*
