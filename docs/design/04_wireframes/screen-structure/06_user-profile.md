# 👤 06\_user-profile – User Profile

## 🎯 Purpose

This screen provides authenticated users with access to their personal account details, basic preferences, and essential actions such as logging out. The MVP version prioritizes a clean, readable layout without editable fields.

### Goals

* Display user profile information (name, email, avatar)
* Offer quick access to language preferences
* Provide a reliable logout mechanism
* Prepare for future features (edit profile, dark mode, GDPR export)

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** Back button (←) to return to the dashboard
* **Center:** Title: "My Profile" with current language displayed as a badge or label (e.g., `FR`)
* **Right:** None

---

## 📄 Body (Scrollable Vertical Content)

### 👤 Section 1: User Info Card

* Profile avatar (user's initial or uploaded image)
* Full name (read-only)
* Email address (read-only)
* Optional: Registration date or last login (displayed in muted text)

### ⚙️ Section 2: Preferences

* Language selection (`FR` / `EN`) via toggle or dropdown
* (Optional) UI theme toggle (disabled in MVP)
* (Optional) Notifications toggle (disabled in MVP)

### 🚪 Section 3: Account Actions

* `Logout` button (prominent CTA), opens confirmation modal
* (Optional) `Change password`
* (Optional) `Delete account` (excluded from MVP)
* Optional: `Back to Dashboard` button (useful if native navigation is unclear or unavailable)

---

## ✅ Footer (Optional / Fixed Bottom)

* App version or build info (e.g., `v1.0.0-beta • Brasse-Bouillon`) — positioned center or right-aligned for clarity

---

## 📐 Layout Rules

* **Grid:** 4-column layout with 16px gutter
* **Card Radius:** 8px
* **Vertical Spacing:** 24–32px between sections
* **Horizontal Padding:** 16px
* **Typography:**

  * Titles: 20–24px
  * Body Text: 14–16px
* **Avatar Size:** 64–80px circular with fallback user initial
* **Button Height:** Minimum 48px

---

## 🎨 Visual Style Notes

* **Theme:** Light mode (default)
* **Accent Color:** Gold `#FFD700`
* **Avatar:** Circular with fallback user initial (e.g., "B")
* **Icons:** Monochrome, line-style, 1.5px stroke (e.g., 🌐 for language, 🚪 for logout)
* **Cards:** Light gray background with subtle shadow or border
* **Muted Text:** Used for timestamps or non-critical details

---

## 🚫 Not Included in MVP

* Editable profile fields
* GDPR-related features (data export, account deletion)
* UI theme and notification toggles

---

## ✅ Implementation Notes

* Store language preference using `AsyncStorage` or a similar method
* Logout action must trigger a confirmation, clear auth tokens, and redirect to `01_home`
* No sensitive user data should be editable in the MVP
* Structure should accommodate future profile-editing functionality
* Ensure language indicator is visible in the header and version info is displayed in the footer
