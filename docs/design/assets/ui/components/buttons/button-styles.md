# 🎨 Button Styles – Brasse-Bouillon

This document defines the design specifications for the **Button UI components** in the Brasse-Bouillon project.

It details the visual styles, usage guidelines, and design tokens for the four primary button types used across the application. These styles are designed to ensure a consistent appearance and behavior on both web and mobile platforms.

---

## 📋 Overview of Button Types

| Button Type | Description                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Primary     | Main action button, used for the most important actions and key calls-to-action.                     |
| Secondary   | Secondary action button, designed for less prominent actions that support primary tasks.             |
| Ghost       | Minimal, transparent button recommended for low-emphasis actions or in secondary interface sections. |
| Disabled    | Non-interactive button state, used to indicate unavailable or inactive actions.                      |

---

## 🎨 Design Specifications

### 1️⃣ Primary Button

* **Background Color:** Primary brand color (`#a06a3a`)
* **Text Color:** White (`#ffffff`)
* **Border:** None
* **Border Radius:** `12px` (`border-radius-md` token)
* **Padding:** `12px 24px`
* **Font:** `font-family-base` token, bold (`font-weight-bold`), `16px`
* **Hover State:** Darker shade of primary color (`#8c5728`)
* **Focus State:** Outline with subtle primary color shadow
* **Disabled State:** Reduced opacity (50%)

### 2️⃣ Secondary Button

* **Background Color:** Secondary brand color (`#8d5832`)
* **Text Color:** White (`#ffffff`)
* **Border:** None
* **Border Radius:** `12px`
* **Padding:** `12px 24px`
* **Font:** Same as primary button
* **Hover State:** Slightly darker secondary color (`#774a2b`)
* **Focus State:** Outline with subtle secondary color shadow
* **Disabled State:** Reduced opacity (50%)

### 3️⃣ Ghost Button

* **Background Color:** Transparent
* **Text Color:** Primary brand color (`#a06a3a`)
* **Border:** 2px solid primary brand color
* **Border Radius:** `12px`
* **Padding:** `12px 24px`
* **Font:** Same as primary button
* **Hover State:** Lightly tinted background with subtle primary shade (`#f5e8dd`)
* **Focus State:** Dashed primary border outline
* **Disabled State:** Reduced opacity (50%) and lighter border color

### 4️⃣ Disabled Button

* Disabled state styling applies universally:

  * Reduced opacity (50%)
  * No hover or active interactions
  * Cursor set to `not-allowed`

---

## 📋 Design Tokens Used

| Token Name                 | Usage                                          |
| -------------------------- | ---------------------------------------------- |
| `font-family-base`         | Font used for button text                      |
| `font-size-base`           | Base text size for buttons                     |
| `font-weight-bold`         | Bold text weight for button labels             |
| `border-radius-md`         | Standard border radius applied to buttons      |
| `spacing-sm`, `spacing-md` | Spacing values for button padding              |
| `transition-duration`      | Duration for hover and focus state transitions |

---

## 💡 Best Practices

* Select the button type based on the relative importance of the action.
* Restrict primary buttons to a single instance per view to maintain focus.
* Use ghost buttons for subtle, secondary interactions within less prominent interface areas.
* Ensure all buttons meet proper color contrast and readability in compliance with [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).
* Guarantee full accessibility for keyboard navigation and screen readers.

> **Note:** All button colors and typography are based on the globally validated design tokens, which have already been tested and verified for WCAG AA compliance. No additional accessibility testing is required at the component level unless new colors or styles are introduced.

---

*These button styles are integral to Brasse-Bouillon's design system and should remain consistent across all product interfaces.*
