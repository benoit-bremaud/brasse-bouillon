# 📱 Screen 01\_home – Welcome / Home

## 🎯 Purpose

The welcome screen is the user's first contact with the Brasse-Bouillon mobile application. It aims to:

* Introduce the app to new users.
* Present its purpose and key features.
* Provide visual and narrative onboarding.
* Direct the user toward registration or exploration.

This screen is designed exclusively for non-authenticated (guest) users.

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left (top left):** Placeholder rectangle for the Brasse-Bouillon logo.
* **Center (top center):** App name "Brasse-Bouillon" with a placeholder for a tagline underneath (e.g., "to define").
* **Right (top right):** 🌍 Language selection icon (for future multilingual support).

**Notes:** The layout is symmetrical and minimal. No login button appears here—access is handled through the footer for better ergonomics.

### 📄 Body (Scrollable Vertical Content)

The body consists of vertically stacked feature cards, displayed in the natural order of a brewing journey. Cards follow the 4-column grid system and Brasse-Bouillon's visual guidelines.

Each card includes:

* A custom Brasse-Bouillon icon, alternating between **left and right** per card.
* A **title**
* An optional **subtitle**
* A concise **description** of the feature

| Order | Card Title                 | Goal / Description                                               | Layout Type                   |
| ----- | -------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| 1     | Welcome                    | Greet the user, highlight brand tone and tagline                 | Centered illustration + text  |
| 2     | Discover Brasse-Bouillon   | Explain the app's purpose and intended audience                  | Icon left + Title/Sub + Desc  |
| 3     | Create and Edit Recipes    | Present the recipe editor and personal brewing library           | Icon right + Title/Sub + Desc |
| 4     | Ingredients Management     | Manage malts, hops, yeast, water, and other core components      | Icon left + Title/Sub + Desc  |
| 5     | Use the IBU/ABV Calculator | Help users fine-tune recipes with brewing formulas               | Icon right + Title/Sub + Desc |
| 6     | Brew Guide                 | Step-by-step guide to help users brew their beer with confidence | Icon left + Title/Sub + Desc  |
| 7     | Brewing Session Tracking   | Real-time brewing process support and measurements               | Icon right + Title/Sub + Desc |
| 8     | Save Your Favorite Recipes | Bookmark or store preferred recipes for later reference          | Icon left + Title/Sub + Desc  |
| 9     | Join the Community 🍻      | Invite users to register or sign in                              | Icon right + Title/Sub + Desc |

**Layout Rules:**

* Cards span full width with 16px horizontal padding
* 24px vertical spacing between cards
* Icon occupies \~30% width on its side; content fills remaining 70%
* Consistent vertical rhythm and visual alignment throughout

### ⬇️ Footer (Fixed Navigation Bar)

A fixed navigation bar at the bottom of the screen, visible across all public-facing pages. It provides quick access to essential areas.

| Icon | Label   | Route           | Description                                  |
| ---- | ------- | --------------- | -------------------------------------------- |
| 🏠   | Home    | `/home`         | Returns to the welcome screen                |
| 📖   | Recipes | `/recipes`      | Browse public recipes (glossary included)    |
| 🧮   | IBU/ABV | `/calculator`   | Access brewing calculators (IBU & ABV tools) |
| 📘   | Guide   | `/brew-guide`   | Step-by-step guide for brewing beginners     |
| 👤   | Account | `/login-signup` | Entry point for user registration or login   |

**Behavior and Layout Rules:**

* Fixed at the bottom; always visible
* Follows a 5-column structure (1 icon per column)
* Optional text labels under icons depending on screen width
* 48px minimum touch targets for accessibility
* Active screen icon is visually highlighted
* Center-aligned icons with equal spacing

---

## 🎨 Visual Style Notes (from Design Charter)

* **Grid System:** 4 columns
* **Spacing:** 16px horizontal gutter, 24px vertical padding
* **Card Style:** 8px border-radius, 1px solid `#DDDDDD`
* **Typography:** 18–24px headings, 14–16px body text
* **Theme Palette:** Light mode with gold accent `#FFD700`
* **Icons:** Monochrome with 1.5px stroke weight
* **Accessibility:** Contrast ratio ≥ 4.5:1, tap targets ≥ 48px

---

## 📝 Not in MVP

* Language selector is non-interactive
* No dark mode toggle
* No personalized content (informational only)

---

## ✅ Notes

* Screen tone should be welcoming, informative, and easy to navigate
* Prioritize visual storytelling and feature discovery over interactivity
* Fixed header and footer; scrollable content area in between
* Footer serves as the main navigational hub for guest users
