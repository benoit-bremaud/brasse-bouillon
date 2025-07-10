# 🎨 Alerts & Notifications Styles – Brasse-Bouillon

This document outlines the design specifications for the **Alerts & Notifications UI components** of the Brasse-Bouillon project.

It details visual styles, usage guidelines, and design tokens for the four primary alert and notification types. These styles are designed to ensure a consistent appearance, clear communication, and accessibility across both web and mobile platforms.

---

## 📋 Overview of Alert Types

| Type    | Description                                                                       |
| ------- | --------------------------------------------------------------------------------- |
| Success | Communicates the successful completion of an action.                              |
| Warning | Highlights cautionary information or potential issues requiring user attention.   |
| Error   | Indicates critical problems or failed actions that need immediate attention.      |
| Info    | Provides neutral, informational messages or system updates for general awareness. |

---

## 🎨 Design Specifications

### 1️⃣ Success Alert

* **Background Color:** Success color (`#6b6b2c`)
* **Text Color:** White (`#ffffff`)
* **Border:** None or subtle accent border if needed for emphasis
* **Border Radius:** `12px` (`border-radius-md` token)
* **Padding:** `16px`
* **Font:** `font-family-base` token, regular weight, `16px`
* **Icon (Optional):** Checkmark or a similar success icon from the project’s icon set

### 2️⃣ Warning Alert

* **Background Color:** Warning color (`#d9b364`)
* **Text Color:** Dark neutral (`#1e1e1e`)
* **Border:** None or subtle accent border if needed for emphasis
* **Border Radius:** Same as Success
* **Padding:** Same as Success
* **Font:** Same as Success
* **Icon (Optional):** Warning triangle or similar caution icon from the icon set

### 3️⃣ Error Alert

* **Background Color:** Error color (`#573921`)
* **Text Color:** White (`#ffffff`)
* **Border:** None or subtle accent border if needed for emphasis
* **Border Radius:** Same as Success
* **Padding:** Same as Success
* **Font:** Same as Success
* **Icon (Optional):** Error symbol or exclamation icon from the icon set

### 4️⃣ Info Alert

* **Background Color:** Light neutral (`#e5e5e5`)
* **Text Color:** Dark neutral (`#1e1e1e`)
* **Border:** None or subtle accent border if needed for emphasis
* **Border Radius:** Same as Success
* **Padding:** Same as Success
* **Font:** Same as Success
* **Icon (Optional):** Info icon or speech bubble icon from the icon set

---

## 📋 Design Tokens Used

| Token Name         | Usage                                    |
| ------------------ | ---------------------------------------- |
| `font-family-base` | Font used for alert text                 |
| `font-size-base`   | Base text size for alerts                |
| `border-radius-md` | Standard border radius applied to alerts |
| `spacing-md`       | Padding value for alerts                 |

---

## 💡 Best Practices

* Write clear, concise, and actionable alert messages.
* Always include a visual indicator (icon) to reinforce the message type, using icons from the project’s design library.
* Position alerts where they are easily visible, such as at the top of the page or directly above the related content or forms.
* Allow dismissibility for non-critical alerts to prevent overwhelming users.
* Ensure sufficient color contrast and readability, fully adhering to [WCAG AA accessibility standards](https://www.w3.org/WAI/WCAG2AA-Conformance).

---

*These alert and notification styles are an essential component of Brasse-Bouillon's design system and must remain consistent across all user interfaces to ensure a cohesive and accessible user experience.*
