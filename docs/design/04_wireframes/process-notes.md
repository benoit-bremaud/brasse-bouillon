# 📋 Brasse-Bouillon – Wireframes Design Process Notes

## 📚 Table of Contents

1. [🌟 Document Purpose](#-document-purpose)
2. [📂 Core Screens (MVP)](#-core-screens-minimum-viable-product---mvp)

   * [MVP Screen List](#mvp-screen-list)
   * [MVP Rationale](#mvp-rationale)
3. [📂 Secondary and Support Screens](#-secondary-and-support-screens)

   * [Support Screen List](#support-screen-list)
   * [Support Rationale](#support-rationale)
4. [🔢 User Journey Mapping](#-user-journey-mapping)

   * [Grouped by User Flow](#grouped-by-user-flow)
   * [Why This Matters](#why-this-matters)
5. [📊 Screen Specifications](#-screen-specifications)

   * [🔧 Visual Design Rules](#-visual-design-rules-from-design-charter)
6. [🧱 Core Screen Specifications](#-core-screen-specifications)

   * [`01_home` – Welcome / Home](#01_home--welcome--home)
   * [`02_login-signup` – Authentication Screen](#02_login-signup--authentication-screen)
   * [`03_dashboard` – Dashboard](#)  
   * [`04_recipe-editor` – Recipe Editor (CRUD)](#)  
   * [`05_brewing-session-tracker` – Brewing Session Tracker](#)  
   * [`06_user-profile` – User Profile](#)  
   * [`07_favorites` – Favorites (Favorite Recipes)](#)  
   * [`08_ibu-abv-calculator` – IBU/ABV Calculator](#)
7. [📘 Support Screen Specifications](#-support-screen-specifications)
8. [📆 Timeline](#-timeline)
9. [🗂️ Related Files](#-related-files)

---

This document outlines the strategic thinking, structure, and visual logic used throughout the CG4 – Wireframes milestone of the Brasse-Bouillon project.

---

## 🌟 Document Purpose

This document is a comprehensive guide to the wireframing phase. It captures:

* Strategic decisions on screen structure
* Design priorities centered on the user journey
* Tools, processes, and deliverables
* Challenges encountered and key takeaways

It provides a single point of truth for the design team and supports future iterations and enhancements.

---

## 📂 Core Screens (Minimum Viable Product - MVP)

### MVP Screen List & Rationale

These screens form the core functionality of the MVP and directly support the primary use cases of Brasse-Bouillon:

1. **Welcome / Home** – Public introduction and feature teaser
2. **Login / Signup** – Secure user authentication
3. **Dashboard** – Central access to brewing features
4. **Recipe Editor (CRUD)** – Manage user-generated brewing recipes
5. **Brewing Session Tracker** – Log real-time brewing sessions
6. **User Profile** – Handle preferences and personal information
7. **Favorites (Favorite Recipes)** – Quick access to saved recipes
8. **IBU/ABV Calculator** – Essential brewing metric calculator

---

## 📂 Secondary and Support Screens

### Support Screen List & Rationale

These screens provide secondary functionality that enhances the user's overall experience, supporting platform usability, accessibility, and long-term maintainability:

1. **Settings** – Customizes user preferences such as language, units of measure, notifications, and account options.
2. **Help / FAQ** – Provides brewing guidance, onboarding assistance, and answers to common user questions.
3. **Notifications** – Displays system alerts, brewing reminders, and community updates.
4. **Error Pages (404 / 500)** – Handles unavailable resources with consistent and user-friendly fallback views.
5. **About / Legal Information** – Communicates terms of service, privacy policies, open-source licenses, and app versioning.
6. **Feedback / Contact Support** – Offers a feedback form and support contact to report bugs or make suggestions.
7. **Changelog / Updates Log** – Tracks the evolution of the app with visible release notes and improvements.

These screens are not essential for the MVP, but are critical for building user trust, offering transparency, and enabling continuous product development.

### Support Screen List

These screens provide complementary value and platform scalability:

1. **Settings** – Allows users to customize their experience, including language, measurement units, notifications, and privacy preferences.
2. **Help / FAQ** – Offers support resources such as brewing tips, troubleshooting help, and frequently asked questions tailored to beginner and experienced brewers.
3. **Notifications** – Displays relevant user alerts including brewing reminders, new recipe suggestions, and event updates.
4. **Error Pages (404 / 500)** – Provides custom fallback pages to ensure a consistent and user-friendly experience when encountering missing or broken content.
5. **About / Legal Information** – Presents transparency elements such as terms of service, privacy policy, app version, and credits.
6. **Feedback / Contact Support** – Enables users to send feedback, report bugs, or reach out for support via a dedicated channel.
7. **Changelog / Updates Log** – Chronicles feature changes, bug fixes, and enhancements across application versions.

### Support Rationale

These screens enhance the overall UX by:

* Supporting user autonomy and troubleshooting
* Managing unexpected navigation states gracefully
* Ensuring compliance and clear communication
* Encouraging community feedback and transparency

While not required for MVP delivery, they are foundational for long-term trust and scalability.

---

## 🔢 User Journey Mapping

This section outlines how screens are organized around the user's interaction with the app. It helps align features with real-world workflows, ensuring usability and clarity. Each phase corresponds to a key moment in the user's lifecycle within Brasse-Bouillon.

### Grouped by User Flow

The screens are grouped across key stages of the user journey:

#### 1. **Onboarding & Access**

* Welcome / Home
* Login / Signup

#### 2. **Core Usage**

* Dashboard
* Recipe Editor (CRUD)
* Brewing Session Tracker
* IBU/ABV Calculator
* Favorites

#### 3. **Account & Support**

* User Profile
* Settings
* Help / FAQ
* Notifications
* Error Pages (404 / 500)
* Feedback / Contact Support
* About / Legal Information
* Changelog / Updates Log

### Why This Matters

User-centered grouping supports:

* Smooth, logical flows
* Better feature prioritization
* Coherent navigation experience

---

## 📊 Screen Specifications

This section defines the detailed architecture of each screen and user flow, with clear differentiation between authenticated and public states.

Each screen spec includes:

* Purpose and interaction goals
* Layout and content blocks
* Expected user behaviors
* UI constraints derived from the design charter

This structured documentation acts as the master reference for creating wireframes in Figma.

### 🔧 Visual Design Rules (from Design Charter)

**Grid & Layout**

* 4-column grid system
* Column gutter: 16px
* Vertical spacing between modules: 24px

**Sizing & Spacing**

* Button height: 48px minimum
* Icon dimensions: 24×24px
* Cards: 1px border (`#DDDDDD`), 8px radius

**Typography**

* Headings: 18–24px bold
* Body text: 14–16px regular

**Theme & Iconography**

* Default: Light theme
* Accent: Gold (`#FFD700`)
* Icons: Line-style, monochrome, 1.5px stroke

These visual constraints ensure consistency, clarity, and a pleasant mobile-first experience.

---

## 🧱 Core Screen Specifications

This section documents each core screen of the Brasse-Bouillon MVP, covering user state, interface components, and logic.

### `01_home` – Welcome / Home

**User Access:** Public (unauthenticated)

**Functional Goals:**

* Present Brasse-Bouillon and its mission
* Allow access to public content (recipes, glossary, brewing tools)
* Encourage registration or login

**Layout Overview:**

* Header (fixed): Logo (left), app name + tagline (center), language selector (right)
* Body (scrollable): Series of informational cards introducing key features in brewing order
* Footer (fixed): Navigation bar with 5 quick links (Home, Recipes, IBU/ABV, Guide, Account)

**Notable Behaviors:**

* Cards are scrollable and informative
* Click on links opens static read-only views or redirects to sign-up
* Guest access limited to public data

**Visual Constraints:**

* Grid: 4 columns with 16px horizontal padding
* Cards: 8px radius, 1px solid `#DDDDDD`, alternating icon alignment
* Typography: 18–24px headings, 14–16px body
* Icons: monochrome, 1.5px stroke

📄 [See full wireframe spec → `01_home.md`](./screen-structure/01_home.md)

### `02_login-signup` – Authentication Screen

**User Access:** Public (unauthenticated)

**Functional Goals:**

* Allow new users to create an account (signup)
* Allow returning users to authenticate securely (login)
* Provide social auth options (Google/Apple) if scoped in future

**Layout Overview:**

* Header (fixed): App name or back navigation (depending on context)
* Form area (tabbed): Login ↔ Signup
* Fields: Email, Password (and Confirm Password on signup)
* Call-to-action buttons: Submit / Switch Tab / Forgot Password
* Footer: Link back to home screen, optional legal disclaimer

**Notable Behaviors:**

* Validation with inline error messages
* Redirects to Dashboard on success
* Link to reset password (non-MVP)

**Visual Constraints:**

* Form fields aligned on grid with 24px vertical rhythm
* Buttons: Full-width, 48px height, outlined or filled variant
* Typography and spacing based on design charter

📄 Wireframe spec to be added: `02_login-signup.md`


---

## 📘 Support Screen Specifications

This section defines the structure and functional intent of the secondary screens, offering tools for configuration, support, and transparency.

---

## 📆 Timeline

| Date       | Milestone                               |
| ---------- | --------------------------------------- |
| 2025-07-11 | Core screen list finalized (Issue #245) |
| 2025-07-11 | Support screen list validated           |
| 2025-07-11 | User journey mapping completed          |

---

## 🗂️ Related Files

* Wireframes Directory: `docs/design/04_wireframes/`
* Design Charter: `docs/design/design-charter.md`

> This document is versioned and maintained actively. Each screen should be checked off once its wireframe is finalized.
