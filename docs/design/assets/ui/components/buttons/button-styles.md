# 📈 Button Styles Reference – Brasse-Bouillon

This document defines the design specifications for the **Button UI components** used in the Brasse-Bouillon project.

It provides detailed visual styles, usage guidelines, and related design tokens for the four primary button types across the application. The objective is to maintain consistent appearance and behavior across web and mobile platforms.

All button styles must remain synchronized with the Brasse-Bouillon design system (e.g., Figma) and the global UI design tokens.

---

## 📄 Button Types Overview

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

Same base as Primary Button with adjustments:

* **Background Color:** Secondary brand color (`#8d5832`)
* **Hover State:** Slightly darker secondary color (`#774a2b`)
* **Focus State:** Outline with subtle secondary color shadow

### 3️⃣ Ghost Button

Minimalistic style:

* **Background Color:** Transparent
* **Text Color:** Primary brand color (`#a06a3a`)
* **Border:** 2px solid primary brand color
* **Hover State:** Lightly tinted background with subtle primary shade (`#f5e8dd`)
* **Focus State:** Dashed primary border outline
* **Disabled State:** Reduced opacity (50%) and lighter border color

### 4️⃣ Disabled Button

Universal disabled styling:

* Reduced opacity (50%)
* No hover or active interactions
* Cursor set to `not-allowed`

---

## 📄 Design Tokens Reference

| Token Name                 | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `font-family-base`         | Font used for button text                      |
| `font-size-base`           | Base text size for buttons                     |
| `font-weight-bold`         | Bold text weight for button labels             |
| `border-radius-md`         | Standard border radius for buttons             |
| `spacing-sm`, `spacing-md` | Padding values for button content              |
| `transition-duration`      | Duration for hover and focus state transitions |

---

## 💡 Best Practices

* Select the button type according to the importance of the action.
* Limit primary buttons to one per view to maintain focus and hierarchy.
* Use ghost buttons for subtle, secondary actions.
* Ensure sufficient color contrast and readability to comply with [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).
* Guarantee full keyboard navigation and screen reader accessibility.
* Keep button designs aligned with the Brasse-Bouillon design system and global UI tokens.

---

*These button styles are integral to the Brasse-Bouillon design system and must remain consistent across all interfaces to support usability, accessibility, and cohesive design.*
