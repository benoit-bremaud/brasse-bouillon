# 🎨 Global UI Design Tokens – Brasse-Bouillon

This document outlines the **global design tokens** for the Brasse-Bouillon project.

Design tokens are standardized variables that ensure visual consistency and simplify future design updates. They also support alignment with external design tools, such as Figma styles, promoting coherence across platforms. These tokens apply to all UI components and form a strong foundation for scalable design.

---

## 1️⃣ Typography Tokens

| Token                 | Description                                               | Value                                  |
| --------------------- | --------------------------------------------------------- | -------------------------------------- |
| `font-family-base`    | Main font family with fallbacks for browser compatibility | 'Inter', sans-serif, Arial, sans-serif |
| `font-size-base`      | Default text size                                         | 16px                                   |
| `font-weight-regular` | Standard text weight                                      | 400                                    |
| `font-weight-bold`    | Bold text weight                                          | 700                                    |

---

## 2️⃣ Border & Radius Tokens

| Token              | Description                                              | Value |
| ------------------ | -------------------------------------------------------- | ----- |
| `border-width`     | Default border thickness                                 | 2px   |
| `border-radius-sm` | Small border radius, typically for inputs                | 6px   |
| `border-radius-md` | Standard border radius, commonly for buttons             | 12px  |
| `border-radius-lg` | Large border radius, used for cards or larger containers | 20px  |

---

## 3️⃣ Shadow Tokens

| Token           | Description                          | Value                         |
| --------------- | ------------------------------------ | ----------------------------- |
| `box-shadow-sm` | Small shadow for light elevation     | 0 1px 2px rgba(0, 0, 0, 0.05) |
| `box-shadow-md` | Medium shadow for standard elevation | 0 4px 8px rgba(0, 0, 0, 0.1)  |

---

## 4️⃣ Spacing Tokens (Padding & Margins)

| Token        | Description                       | Value |
| ------------ | --------------------------------- | ----- |
| `spacing-xs` | Extra small spacing for tiny gaps | 4px   |
| `spacing-sm` | Small spacing                     | 8px   |
| `spacing-md` | Medium spacing                    | 16px  |
| `spacing-lg` | Large spacing                     | 24px  |

---

## 5️⃣ Transition Tokens

| Token                 | Description                                           | Value       |
| --------------------- | ----------------------------------------------------- | ----------- |
| `transition-duration` | Default animation duration for interactive components | 0.25s       |
| `transition-timing`   | Default easing function for transitions               | ease-in-out |

---

*These tokens are intended for use throughout the component styles for buttons, inputs, alerts, tooltips, and other UI elements.*
