# 🍺 04\_recipe-editor – Recipe Editor

## 🎯 Purpose

The recipe editor is a core feature of Brasse-Bouillon, designed for authenticated users to create and manage brewing recipes. It provides a complete CRUD interface within a structured, user-friendly layout. Users can start new recipes, edit existing ones with real-time feedback, and navigate smoothly through clearly separated sections. While the MVP focuses on essential functionality, the interface is designed to accommodate future features such as reusable ingredients and smart suggestions.

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** "← Back" button to return to the dashboard or previous screen
* **Center:** Dynamic title – e.g., "New Recipe" or "Edit Recipe: \[Name]"
* **Right:** Optional icon for help or contextual information

---

### 📄 Body (Scrollable)

Organized into vertically stacked sections, following a 4-column grid.

#### 📌 Section 1: Recipe Info

* Title (text input)
* Beer style (dropdown selector)
* Description / Notes (multiline textarea)
* Estimated brew volume (numeric input with unit selector)

#### 🧂 Section 2: Ingredients

* Add ingredients by category: malt, hops, yeast, adjuncts (optionally grouped)
* Each entry includes:

  * Name (autocomplete input)
  * Amount and unit
  * Optional notes (e.g., addition step or timing)
* Button: `+ Add Ingredient`

#### 🔬 Section 3: Brewing Parameters

* Target ABV (%) – auto-calculated if fermentables are provided
* Target IBU – editable or auto-calculated (placeholder in MVP)
* Boil time (numeric input)
* Fermentation temperature (optional input)

#### 🧪 Section 4: Process Steps (Optional)

* Editable list of brewing steps (one text input per step)
* Button: `+ Add Step`

#### 📎 Section 5: Metadata

* Tags (autocomplete chips)
* Visibility toggle: Private / Public

---

### ✅ Footer Actions (Sticky Bottom Bar)

* Button: `Save Recipe`
* Button: `Delete Recipe` (only visible when editing an existing recipe)
* Real-time feedback messages: Saving, Success, Error

---

## 📄 Layout Rules

* **Grid:** 4 columns with 16px gutter
* **Card Radius:** 8px
* **Input Spacing:** 24px vertical between form elements
* **Padding:** 16px horizontal
* **Minimum Tap Area:** 48×48px
* **Font Sizes:**

  * Headings: 20–24px
  * Labels: 14px
  * Body text: 14–16px

---

## 🎨 Visual Style Notes

* **Theme:** Light mode
* **Accent Color:** Gold `#FFD700`
* **Icons:** Line-style, monochrome, 1.5px stroke
* **Inputs:** Rounded, accessible, high-contrast
* **Feedback States:**

  * ✅ Success: Green
  * ❌ Error: Red (highlighted border and message)
  * ⏳ Loading/Neutral: Gray

---

## 🚫 Not Included in MVP

These features are planned for future releases and are not implemented in the MVP:

* Ingredient library with reuse suggestions
* Full ABV/IBU auto-calculation logic
* Image uploads for recipes
* Integrated step-by-step brewing timers

---

## ✅ Implementation Notes

* Access restricted to authenticated users
* Autosave is not available in the MVP
* All fields must include validation with clear error indicators (e.g., red borders, tooltips)
* Mobile form navigation must support keyboard-friendly behavior and spacing
