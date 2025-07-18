# ⭐ 07\_favorites – Favorites List

## 🎯 Purpose

This screen allows authenticated users to view and manage their favorite brewing recipes. The design prioritizes clarity, accessibility, and efficient interactions, enabling users to easily navigate to recipe details or remove items from their favorites.

### Goals

* Display a scrollable list of the user’s favorite recipes
* Enable navigation to detailed recipe views
* Allow removal of recipes from the favorites list
* Encourage exploration when the list is empty

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** Back button (←) to return to the dashboard
* **Center:** Title: “My Favorites” (with optional count badge)
* **Right:** None

---

## 📄 Body (Scrollable Vertical Content)

### 📃 Section 1: Favorites List (Cards)

Each favorite recipe is displayed as an individual card featuring:

* Recipe title
* Beer style or category
* Author name (if the recipe is public)
* Icon: Filled star ⭐ or heart ❤️ (toggle to remove from favorites)
* CTA button: `View Recipe`
* (Optional) CTA button: `Start Brewing` (not included in MVP)
* (Optional) Swipe-to-remove gesture support

### 📭 Section 2: Empty State

When no favorite recipes are saved:

* Primary message: “You don’t have any favorites yet.”
* Subtext: “Explore recipes and add your favorites to see them here.”
* CTA button: `Discover Recipes`
* Optional icon or illustration (e.g., outlined beer mug, hop graphic)

---

## ✅ Footer (Optional)

* Not required for MVP
* (Optional) Can display app version or navigation tip (e.g., “Swipe left to remove”)

---

## 📐 Layout Rules

* **Grid:** 4-column structure with 16px gutters
* **Card Radius:** 8px
* **Vertical Spacing:** 24–32px between cards
* **Horizontal Padding:** 16px
* **Typography:**

  * Titles: 20–24px
  * Metadata: 14–16px
* **Button Height:** Minimum of 48px

---

## 🎨 Visual Style Notes

* **Theme:** Light mode
* **Accent Color:** Gold `#FFD700`
* **Icons:** Monochrome or gold, 1.5px stroke weight
* **Card Background:** Light gray with subtle shadow or outline
* **Empty State:** Friendly tone, with optional supportive icon or illustration

---

## 🚫 Not Included in MVP

* Sorting or filtering features
* Search bar functionality
* Launching a brewing session
* Grouping favorites into folders or categories

---

## ✅ Implementation Notes

* The favorites list is dynamically loaded from the user’s profile (e.g., `user.favorites[]`)
* Selecting `View Recipe` navigates to the recipe detail screen
* Tapping the star/heart icon removes the recipe from favorites with visual feedback or confirmation
* If the list becomes empty after updates, display the empty state
* (Optional) Implement pagination or lazy-loading for large collections
