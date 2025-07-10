# 🎨 Input Field Styles – Brasse-Bouillon

This document presents the design specifications for the **Input Field UI components** used throughout the Brasse-Bouillon project.

It details the visual styles, usage guidelines, and associated design tokens for the four main input field states. These styles are designed to maintain consistency, usability, and accessibility across both web and mobile platforms, ensuring responsiveness and mobile-friendly behavior.

---

## 📋 Overview of Input Field States

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

* **Background Color:** White (`#ffffff`)
* **Border Color:** Primary brand color (`#a06a3a`)
* **Text Color:** Dark neutral (`#1e1e1e`)
* **Placeholder Color:** Medium neutral gray (`#999999`)
* **Border Radius:** Same as default
* **Padding:** Same as default
* **Font:** Same as default
* **Focus Effect:** Subtle box shadow using primary color (`0 0 0 2px rgba(160, 106, 58, 0.2)`) to enhance visibility

### 3️⃣ Error State

* **Background Color:** White (`#ffffff`)
* **Border Color:** Error color (`#573921`)
* **Text Color:** Dark neutral (`#1e1e1e`)
* **Placeholder Color:** Medium neutral gray (`#999999`)
* **Border Radius:** Same as default
* **Padding:** Same as default
* **Font:** Same as default
* **Error Indicator:** Optional error message displayed below the input field in red text (`#c0392b`)

### 4️⃣ Disabled State

* **Background Color:** Light neutral gray (`#f5f5f5`)
* **Border Color:** Neutral light gray (`#cccccc`)
* **Text Color:** Medium neutral gray (`#999999`)
* **Placeholder Color:** Same as text color
* **Border Radius:** Same as default
* **Padding:** Same as default
* **Font:** Same as default
* **Interaction:** Non-interactive; cursor set to `not-allowed`

---

## 📋 Design Tokens Used

| Token Name                 | Usage                                          |
| -------------------------- | ---------------------------------------------- |
| `font-family-base`         | Font used for input text                       |
| `font-size-base`           | Base text size for inputs                      |
| `border-radius-md`         | Standard border radius applied to input fields |
| `spacing-sm`, `spacing-md` | Spacing values for input padding               |
| `transition-duration`      | Transition duration for focus effects          |

---

## 💡 Best Practices

* Ensure that the focus state remains clearly visible to support keyboard navigation and accessibility.
* Provide clear and concise placeholder text, such as "Enter your email" or "Type your message".
* Apply error states consistently for validation feedback to guide users in correcting mistakes.
* Maintain sufficient color contrast between text, borders, and backgrounds to comply with [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).
* Keep input sizes and spacing consistent throughout the interface for a cohesive design.

---

*This document serves as an official design deliverable. These input field styles form a fundamental part of Brasse-Bouillon's design system and must remain consistent across all interfaces.*
