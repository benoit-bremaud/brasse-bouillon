# 📊 03\_dashboard – User Dashboard

## 🎯 Purpose

The Dashboard is the main interface for authenticated users. It acts as a control center, providing direct access to core brewing features and key personal data.

* Quick access to the user’s personal recipes and brewing sessions.
* Shortcut to technical tools (IBU/ABV calculator).
* Entry point to the profile screen and logout mechanism.
* Visual placeholders for future features (ingredients, equipment, assistant...).

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** Brasse-Bouillon Logo (32×32px)
* **Center:** Title "My Dashboard"
* **Right:** 👤 Profile icon (opens a contextual menu):

  * `View Profile`
  * `Log Out`
  * (Future) `Settings` *(grayed out)*

---

### 📊 Body (Scrollable Content)

Structured into vertical blocks with a 4-column layout.

#### 🔹 Quick Actions (Button Grid)

* ➕ **Create Recipe** → `/recipe-editor`
* 🔥 **Start Brewing Session** → `/brewing-session`
* 🧮 **IBU/ABV Calculator** → `/calculator`
* (Grayed) 📚 **Glossary** *(planned)*
* (Grayed) 🧂 **Ingredients** *(planned)*
* (Grayed) 🛠️ **My Equipment** *(planned)*

> Displayed as touchable cards (icon + label), 2 or 3 per row depending on screen size.

---

#### 📋 My Recipes (Preview List)

* Shows last 2–3 recipes:

  * Title
  * Style (e.g. IPA)
  * ABV / IBU if available
  * Edit/View button
* ➡️ CTA button: "View All Recipes" → `/recipes`

---

#### 🧪 Next Brewing Session

* If session scheduled:

  * Title / date / recipe / duration
  * CTA: "Open Session"
* If none:

  * Message: “You have no upcoming brew”
  * CTA: "Plan a New Session"

---

#### 🧱 Future Features (Grayed Placeholders)

* 🧂 **My Ingredients** *(Not available yet)*
* 🛠️ **My Equipment** *(Not available yet)*
* 🤖 **Brewing Assistant** *(Coming soon)*
* 📖 **Glossary** *(Available in read-only from Home)*

> These sections are styled in light gray with a lock icon or faded text, non-interactive.

---

### 🔻 Footer (Optional or Hidden)

* For MVP: footer is hidden to avoid redundancy with `01_home`.
* Navigation occurs via internal CTAs or via menu (profile).

---

## 📄 Layout Rules

* **Grid**: 4 columns, 16px gutter
* **Padding**: 16px horizontal, 24px vertical between sections
* **Card Radius**: 8px
* **Touch targets**: ≥48px
* **Font Sizes**:

  * Title: 24px bold
  * Labels: 14–16px
  * Descriptions: 14px regular

---

## 🎨 Visual Style Notes

* **Theme**: Light mode
* **Accent Color**: Gold `#FFD700`
* **Icons**: Monochrome, line-style, 1.5px stroke
* **Grayed Features**: `#AAAAAA` or 40% opacity, disabled interactions

---

## 📝 Not in MVP

* Brewing statistics overview
* Notification center
* Inventory management
* User badges or gamification
* Assistant / chatbot
* Equipment editor

---

## ✅ Notes

* Dashboard is accessible **only after login**.
* All buttons must handle redirection and API state (e.g. missing recipes).
* Empty states should display helpful and encouraging messages.
* All future modules must be grayed out or hidden to prevent confusion.
