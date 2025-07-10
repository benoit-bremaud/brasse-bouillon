# 📝 Tooltip Styles Documentation – Brasse-Bouillon

This document outlines the design specifications for the **Tooltip UI components** within the Brasse-Bouillon project.

It provides detailed guidelines on visual styles, interaction behaviors, and related design tokens. The objective is to promote consistency, clarity, and accessibility across web and mobile platforms.

---

## 📄 Tooltip Variants Overview

| Variant    | Description                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default    | Standard tooltip for brief, contextual information.                                                                                                             |
| Delayed    | Tooltip with a slight appearance delay to improve user experience in specific contexts.                                                                         |
| Persistent | Tooltip that remains visible until explicitly dismissed or until focus is lost (via keyboard blur or other interactions), typically for accessibility purposes. |

---

## 🎨 Design Specifications

### 1️⃣ Default Tooltip

* **Background Color:** Dark neutral (`#1e1e1e`)
* **Text Color:** White (`#ffffff`)
* **Border:** None
* **Border Radius:** `8px` (`border-radius-sm` token)
* **Padding:** `8px 12px`
* **Font:** `font-family-base` token, regular weight, `14px`
* **Shadow:** `0 2px 4px rgba(0, 0, 0, 0.1)` for subtle elevation
* **Arrow Indicator:** Small triangle pointing to the triggering element

### 2️⃣ Delayed Tooltip

Shares the same visual style as the Default Tooltip with the following additional behavior:

* **Appearance Delay:** 300ms before appearing on hover or focus

### 3️⃣ Persistent Tooltip

Uses the same visual style as the Default Tooltip, with added features:

* **Dismissal:** Requires explicit user action (click outside or press a dismiss button) or loss of focus
* **Accessibility:** Fully keyboard-navigable and compatible with screen readers

---

## 📋 Design Tokens Reference

| Token Name         | Purpose                                 |
| ------------------ | --------------------------------------- |
| `font-family-base` | Font used for tooltip text              |
| `font-size-sm`     | Base text size for tooltips             |
| `border-radius-sm` | Standard border radius for tooltips     |
| `spacing-xs`       | Padding for tooltip content             |
| `transition-delay` | Delay applied before tooltip appearance |

---

## 💡 Best Practices

* Keep tooltip content short, clear, and informative.
* Avoid using tooltips in mobile-only contexts unless supported by long-press gestures or dedicated UI components.
* Ensure tooltips are triggered by common interactions: hover, focus, or tap.
* Provide accessible methods to dismiss persistent tooltips.
* Ensure sufficient color contrast for readability and compliance with [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).
* Synchronize tooltip designs with updates made in the Brasse-Bouillon design system (e.g., Figma revisions).

---

*These tooltip styles are an integral part of the Brasse-Bouillon design system and must remain consistent across all interfaces to support usability, accessibility, and cohesive design.*
