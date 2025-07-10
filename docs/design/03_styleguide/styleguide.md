# 📅 Brasse-Bouillon Design System — Styleguide

This document consolidates the design guidelines for the Brasse-Bouillon project, ensuring a consistent visual identity, optimal accessibility, and intuitive usability throughout the application.

All specifications provided here align with:

* The **Figma Design System**
* The project's **global UI design tokens**

---

🎨 The color palette and contrast analysis details are documented in the following files:

* [Color Tokens & Palette](../assets/palette/colors.md)
* [Contrast Analysis Report](../assets/palette/color-contrast-analysis.md)

📝 Typography guidelines and font specifications are available here:

* [Typography Guide](../assets/typography/typography-guide.md)

---

## 🌎 Form Inputs Overview

This section outlines the design specifications for primary form input fields used across the Brasse-Bouillon application. It is intended for both designers and developers.

### Scope of Documentation

The following input types are included:

* **Number** (numeric fields)
* **Textarea** (multi-line text areas)
* **Select** (dropdown menus)
* **Checkbox** (multi-select options)
* **Radio** (single-choice options)

### Cross-Reference

For comprehensive details on basic text inputs and password fields, refer to:

* [`input-styles.md`](../ui/components/inputs/input-styles.md)

This external document includes specifications for:

* Default text inputs
* Password inputs
* Focus, disabled, and error states

### Design Principles

This styleguide ensures that all form inputs:

* Exhibit visual consistency
* Meet WCAG AA accessibility standards
* Are easily implemented using SCSS variables and design tokens

Contributors are encouraged to review this section regularly to ensure its relevance and to incorporate any updates as the design system evolves.

---

## 🌟 Form Inputs Visual States

This section presents detailed visual states for each documented form input type.

Each input type covers the following states:

* **Default**: Standard appearance.
* **Focus**: Active state when selected or focused.
* **Disabled**: Inactive state with a subdued appearance.
* **Error**: State indicating a validation error.

### 🔹 Select Input

| State    | Border Color | Background Color | Radius | Shadow      | Padding | Text Color | Notes                             |
| -------- | ------------ | ---------------- | ------ | ----------- | ------- | ---------- | --------------------------------- |
| Default  | #cccccc      | #ffffff          | 8px    | None        | 12px    | #1e1e1e    | Placeholder visible               |
| Focus    | #a06a3a      | #ffffff          | 8px    | Subtle glow | 12px    | #1e1e1e    | Dropdown icon highlighted         |
| Disabled | #e0e0e0      | #f5f5f5          | 8px    | None        | 12px    | #999999    | Cursor not-allowed                |
| Error    | #c0392b      | #fff0f0          | 8px    | None        | 12px    | #1e1e1e    | Error icon visible, error message |

### 🔹 Checkbox Input

| State    | Border Color | Background Color | Radius | Shadow | Padding | Checkmark Color | Notes                           |
| -------- | ------------ | ---------------- | ------ | ------ | ------- | --------------- | ------------------------------- |
| Default  | #cccccc      | #ffffff          | 4px    | None   | 6px     | None            | Standard box                    |
| Focus    | #a06a3a      | #ffffff          | 4px    | None   | 6px     | None            | Outline visible                 |
| Disabled | #e0e0e0      | #f5f5f5          | 4px    | None   | 6px     | None            | Cursor not-allowed, faded style |
| Error    | #c0392b      | #fff0f0          | 4px    | None   | 6px     | None            | Error border, error message     |

### 🔹 Radio Input

| State    | Border Color | Background Color | Radius | Shadow | Padding | Dot Color | Notes                           |
| -------- | ------------ | ---------------- | ------ | ------ | ------- | --------- | ------------------------------- |
| Default  | #cccccc      | #ffffff          | 50%    | None   | 6px     | None      | Circular button                 |
| Focus    | #a06a3a      | #ffffff          | 50%    | None   | 6px     | None      | Outline visible                 |
| Disabled | #e0e0e0      | #f5f5f5          | 50%    | None   | 6px     | None      | Cursor not-allowed, muted style |
| Error    | #c0392b      | #fff0f0          | 50%    | None   | 6px     | None      | Error border, error message     |

### 🔹 Number Input

| State    | Border Color | Background Color | Radius | Shadow      | Padding | Text Color | Notes                       |
| -------- | ------------ | ---------------- | ------ | ----------- | ------- | ---------- | --------------------------- |
| Default  | #cccccc      | #ffffff          | 8px    | None        | 12px    | #1e1e1e    | Numeric spinner icons shown |
| Focus    | #a06a3a      | #ffffff          | 8px    | Subtle glow | 12px    | #1e1e1e    | Spinner highlighted         |
| Disabled | #e0e0e0      | #f5f5f5          | 8px    | None        | 12px    | #999999    | Cursor not-allowed          |
| Error    | #c0392b      | #fff0f0          | 8px    | None        | 12px    | #1e1e1e    | Error icon, validation note |

### 🔹 Textarea Input

| State    | Border Color | Background Color | Radius | Shadow      | Padding | Text Color | Notes                       |
| -------- | ------------ | ---------------- | ------ | ----------- | ------- | ---------- | --------------------------- |
| Default  | #cccccc      | #ffffff          | 8px    | None        | 12px    | #1e1e1e    | Multi-line, resizable field |
| Focus    | #a06a3a      | #ffffff          | 8px    | Subtle glow | 12px    | #1e1e1e    | Border highlight visible    |
| Disabled | #e0e0e0      | #f5f5f5          | 8px    | None        | 12px    | #999999    | Cursor not-allowed          |
| Error    | #c0392b      | #fff0f0          | 8px    | None        | 12px    | #1e1e1e    | Error border, error message |

---

### 💡 Best Practices

* Maintain a consistent table structure for all input types.
* Include notes or icons to clarify interactions and visual behaviors.
* Ensure design tokens from `global-ui-tokens.md` are consistently applied.
* Reference Figma components or provide relevant screenshots where applicable.
* Update this section whenever input styles are modified or expanded.

These visual references serve as a complete, accessible, and unified design guide for all form inputs within Brasse-Bouillon.

---
