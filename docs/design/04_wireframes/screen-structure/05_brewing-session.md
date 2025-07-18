# 🧪 05\_brewing-session – Brewing Session Tracker

## 🎯 Purpose

This screen allows authenticated users to track an active brewing session based on a selected recipe. It emphasizes real-time step progression, note-taking, and basic data entry, with a lightweight, mobile-first design aligned with MVP constraints.

### Goals

* Interactively follow the brewing steps defined in the recipe
* Mark each step as completed, with automatic timestamps
* Record temperature, gravity, and session notes
* Finalize the session and archive it to the user's history

---

## 🧱 Structural Zones

### 🔼 Header (Fixed)

* **Left:** Back button (←) to return to the dashboard
* **Center:** Title “Brewing Session” with optional subtitle (recipe name)
* **Right:** (Optional) Session status badge — `Active`, `Paused`, or `Ended`

---

## 📄 Body (Scrollable Vertical Content)

### 🔢 Section 1: Brewing Steps – Interactive Checklist

* Each brewing step appears as a vertical card:

  * Step number and title
  * Optional description text
  * Action: `✅ Mark as done` (adds timestamp)
  * Optional: `📝 Add comment`
* Completed steps are visually dimmed or marked with a success icon

### 🌡️ Section 2: Measurements – Optional Data Fields

* Editable fields for live session data:

  * Temperature (°C)
  * Gravity (OG/FG)
  * Duration (in minutes)
* Values are updatable during the session if this module is enabled

### 🗒️ Section 3: Session Notes

* Free-text input area (multiline)
* Each note is saved with an automatic timestamp
* Scrollable history of prior entries (optional)
* Floating `+ Add Note` button (bottom-right)

---

## ✅ Footer Actions – Sticky Bottom Bar

* `End Session`: Archives and finalizes the session
* `Return to Recipe`: Opens the linked recipe in read-only mode
* Optional: Feedback banner showing recent actions (e.g., “Note saved”)

---

## 📐 Layout Rules

* **Grid:** 4-column structure with 16px gutters
* **Card Radius:** 8px corners
* **Vertical Spacing:** 32px between sections
* **Horizontal Padding:** 16px on screen edges
* **Typography:**

  * Titles: 20–24px
  * Labels and body text: 14–16px
* **Buttons:** Full-width if needed; minimum height: 48px

---

## 🎨 Visual Style Notes

* **Theme:** Light mode (high readability)
* **Accent Color:** Gold `#FFD700`
* **Icons:** Monochrome line style (1.5px stroke)
* **Completed Steps:** Faded or highlighted with a lighter background
* **Notes Area:** Optional paper-like UI styling
* **Floating Buttons:** Rounded with drop shadow, positioned bottom-right

---

## 🚫 Not Included in MVP

* Step-specific countdown timers
* Pause/resume state toggles
* Sensor or IoT data integrations
* Multi-user collaboration features

---

## ✅ Implementation Notes

* Each action (e.g., completing a step) should autosave session state
* Archived sessions are stored in the user’s brewing history
* Design must be fully responsive and touch-optimized
* Provide instant feedback for key interactions (e.g., checkmark animations, toast messages)
* Consider implementing a session data retention policy (e.g., retain for 30/90 days, or until manually deleted)
