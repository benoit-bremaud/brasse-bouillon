# 📄 09\_recipe-detail – Recipe Detail View

## 🎯 Purpose

This screen allows users to view all relevant information about a brewing recipe, whether it’s their own (private) or a shared/public one. It serves as a comprehensive and scrollable summary, with contextual actions based on ownership. This view is strictly read-only; any editing actions redirect to a separate editor screen.

### Goals

* Provide a complete and readable layout for brewing recipes
* Offer interactive features: favorites, launch brewing, edit (if owner)
* Support public/private recipe distinctions

---

## 🧱 Structural Zones

### 🔼 Header (Fixed or Sticky Top)

* **Left:** Back button (←)
* **Center:** Recipe Title
* **Right:**

  * `Edit` button (if recipe belongs to the user) — can be an icon or labeled button
  * `Share` / `Export` (optional, icon or text-based)

---

## 📄 Body (Scrollable Vertical Content)

### 🧾 Section 1: Recipe Metadata

* Title
* Author (name or avatar)
* Style of beer
* Target volume (L)
* Estimated duration (brew time)
* Creation date

### 🍺 Section 2: Key Stats

* IBU value
* ABV %
* (Optional) Color (EBC)
* (Optional) Visual chart or icon (e.g., bar or dial chart) — may be shown by default or toggled

### 🌾 Section 3: Ingredients List

* Malts
* Hops
* Yeasts
* Additives (optional)
* Each item with quantity, unit, and notes (e.g., hop addition time)
* Ingredients may be grouped by type or stage for readability

### 🔥 Section 4: Brewing Steps

* Chronological steps or block instructions
* May include times and temperatures
* Styled as a checklist or readable block layout

### 📝 Section 5: Notes

* User notes / observations / tips
* Displayed in a collapsible or bordered block

---

## ⭐ Section 6: User Actions

Based on context (user is owner or not):

* `❤️ Add to Favorites` (toggle)
* `🧪 Launch Brewing` → opens tracker prefilled
* `📝 Edit Recipe` (if owner)
* `📎 Clone Recipe` → creates a duplicate and redirects to `04_recipe-editor`, with a confirmation message
* `🗑 Delete Recipe` (owner only)

---

## 📐 Layout Guidelines

* **Grid:** 4-column mobile layout
* **Spacing:** 24px between sections
* **Card Radius:** 8px
* **Icons:** Accompany each major label (optional)
* **Sticky Footer (optional):** floating action buttons

---

## 🎨 Visual Style

* Theme: Light mode
* Accent: Gold `#FFD700`
* Cards or section dividers
* Headers for each content block
* Use of small icons for clarity (e.g., 🍺, 🌿, ⏱)

---

## 🚫 Not Included in MVP

* Comments or social features
* Public reviews or ratings
* Editing from within this view (redirects to editor)

---

## ✅ Implementation Notes

* Data fetched dynamically (read-only mode)
* Actions should check user ownership before display
* Launch Brewing links to `05_brewing-session-tracker` with prefilled data
* If cloned, redirect to `04_recipe-editor` with copied data and confirmation
