# 📈 Input Field Styles Reference – Brasse-Bouillon

This document defines the design specifications for the **Input Field UI components** used throughout the Brasse-Bouillon project.

It provides detailed visual styles, usage guidelines, and related design tokens for the four main input field states. The objective is to maintain consistency, usability, and accessibility across web and mobile platforms, ensuring responsiveness and mobile-friendly behavior.

All input field styles must remain synchronized with the Brasse-Bouillon design system (e.g., Figma) and the global UI design tokens.

---

## 📄 Input Field States Overview

| State    | Description                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| Default  | Normal, ready-to-use state with no active interaction.                            |
| Focus    | Active state when the user clicks or navigates into the input field.              |
| Error    | Error state indicating invalid input or validation issues.                        |
| Disabled | Inactive, non-editable state indicating that the field cannot be interacted with. |

---

## 🎨 Design Specifications

### 1️⃣ Default State

* **Background Color:** White (`#ffffff`)
* **Border Color:** Neutral light gray (`#cccccc`)
* **Text Color:** Dark neutral (`#1e1e1e`)
* **Placeholder Color:** Medium neutral gray (`#999999`)
* **Border Radius:** `12px` (`border-radius-md` token)
* **Padding:** `12px 16px`
* **Font:** `font-family-base` token, regular weight, `16px`

### 2️⃣ Focus State

Same visual style as Default State with added focus effect:

* **Border Color:** Primary brand color (`#a06a3a`)
* **Focus Effect:** Subtle box shadow using primary color (`0 0 0 2px rgba(160, 106, 58, 0.2)`) to enhance visibility

### 3️⃣ Error State

Same visual style as Default State with error indicators:

* **Border Color:** Error color (`#573921`)
* **Error Indicator:** Optional error message displayed below the input field in red text (`#c0392b`)

### 4️⃣ Disabled State

Visual style adapted for inactive use:

* **Background Color:** Light neutral gray (`#f5f5f5`)
* **Text Color & Placeholder:** Medium neutral gray (`#999999`)
* **Interaction:** Non-interactive; cursor set to `not-allowed`

---

## 📄 Design Tokens Reference

| Token Name                 | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `font-family-base`         | Font used for input text                       |
| `font-size-base`           | Base text size for inputs                      |
| `border-radius-md`         | Standard border radius applied to input fields |
| `spacing-sm`, `spacing-md` | Padding values for input content               |
| `transition-duration`      | Duration for focus effect transitions          |

---

## 💡 Best Practices

* Ensure the focus state remains clearly visible to support keyboard navigation and accessibility.
* Provide clear and concise placeholder text (e.g., "Enter your email").
* Apply error states consistently for validation feedback.
* Maintain sufficient color contrast between text, borders, and backgrounds, fully complying with [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).
* Keep input field designs aligned with the Brasse-Bouillon design system and global UI tokens.

---

*These input field styles are a fundamental part of the Brasse-Bouillon design system and must remain consistent across all interfaces to ensure usability, accessibility, and cohesive design.*
