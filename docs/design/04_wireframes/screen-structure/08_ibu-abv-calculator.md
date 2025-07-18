# 🧮 08\_ibu-abv-calculator – IBU / ABV Calculator

## 🎯 Purpose

This screen enables users to calculate the estimated bitterness (IBU) and alcohol by volume (ABV) of a brewing recipe. Designed for both authenticated and anonymous users, it offers quick, intuitive inputs and fast feedback without requiring a login. Authenticated users may optionally link results to a recipe.

### Goals

* Deliver a lightweight and efficient brewing calculator
* Provide accessible input fields for IBU and ABV estimation
* Present results in a clear, responsive layout

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** Back button (←) to return to the previous screen
* **Center:** Title: "IBU / ABV Calculator"
* **Right:** (Optional) Info icon (❓) with tooltip or modal for formula explanations

---

## 📄 Body (Scrollable Vertical Content)

### 🔢 Section 1: IBU Calculator

**Input Fields:**

* Volume (liters)
* Alpha acid content (%)
* Hop weight (grams)
* Boil time (minutes)

> *Note: This section assumes a single hop addition. Multi-hop support is excluded from the MVP.*

**Action:**

* Button: `Calculate IBU`

**Result Display:**

* Estimated IBU value
* (Optional) Bitterness description (e.g., Low / Medium / High)

---

### 🍺 Section 2: ABV Calculator

**Input Fields:**

* Original Gravity (OG)
* Final Gravity (FG)

**Action:**

* Button: `Calculate ABV`

**Result Display:**

* Estimated ABV percentage
* (Optional) Alcohol profile description (e.g., Light / Standard / Strong)

---

### 🧭 Section 3: Additional Actions

* Button: `Reset all fields`
* (Optional) `Save result` — available for authenticated users only
* (Optional) `Apply to recipe` — opens a prefilled recipe editor or modal

---

## 📐 Layout Guidelines

* **Grid System:** 4-column mobile layout
* **Section Spacing:** 24px vertical gap
* **Padding:** 16px horizontal
* **Input Fields:** Full-width, stacked vertically
* **Buttons:** Minimum height of 48px

---

## 🎨 Visual Style

* **Theme:** Light mode (default)
* **Accent Color:** Gold `#FFD700`
* **Form Elements:** Rounded input borders, clean field alignment
* **Result Display:** Boxed or highlighted output area
* **Icons:** Optional — ❓ (help), 📊 (results/statistics)

---

## 🚫 Excluded from MVP

* Support for multiple hop additions (multi-hop IBU)
* Advanced ABV adjustments (e.g., temperature, attenuation corrections)
* History or data saving for anonymous users
* Graphical sliders or charts

---

## ✅ Implementation Notes

* Use standard brewing formulas to compute IBU and ABV
* Ensure numeric input validation with inline error messages
* Display results only after user clicks `Calculate`
* For authenticated users, provide the option to save results to their profile (e.g., as draft data or linked to a recipe)
