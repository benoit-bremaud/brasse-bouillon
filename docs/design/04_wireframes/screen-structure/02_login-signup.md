# 📲 02\_login-signup – User Authentication

## 🎯 Purpose

This screen enables users to authenticate and access personalized features within the Brasse-Bouillon app. It supports both login and signup flows, depending on whether the user is returning or new. It acts as the main entry point into the private user experience.

* Facilitate account creation and secure login with minimal user friction.
* Guide users through a simple, welcoming authentication flow.
* Maintain consistency with the UI system and ensure accessibility across devices.

---

## 🧱 Structural Zones

### 🔹 Header (Fixed)

* **Logo**: Positioned top-left, 32×32px, using the standard Brasse-Bouillon branding.
* **Screen Title**: Centered text—"Welcome back!" for login or "Join Brasse-Bouillon" for signup.
* **Language Icon**: Top-right, 24×24px globe icon for locale selection.
* **Home Icon**: Optional 16–24px icon, located in the lower-left corner of the header or just above the form, for returning to `01_home`.
* **Height**: \~96px

### 🔸 Body

#### 🔐 Login Form

* **Email Input**: Labeled field with email input type.
* **Password Input**: Labeled field with show/hide toggle.
* **CTA Button**: Primary button labeled "Log In".
* **Forgot Password**: Optional text link beneath the password input.
* **Switch Mode**: Link prompting signup: “Don’t have an account? Sign up.”

#### 📝 Signup Form

* **Name Input**: Labeled text field for full name.
* **Email Input**: Labeled email input.
* **Password Input**: Labeled password input with show/hide toggle.
* **CTA Button**: Primary button labeled "Create Account".
* **Switch Mode**: Link prompting login: “Already registered? Log in.”

#### Divider (Optional)

* Horizontal line with "OR" to separate social login options.

#### Social Login (Optional)

* Icons or buttons for Google / Apple login, styled in monochrome.

### 🔻 Footer (Minimal)

* **Legal Notice**: "By continuing you accept the Terms of Use and Privacy Policy" (links open separate pages).
* Text centered at the bottom, 12px font size, muted color tone.
* Max height: \~72px

---

## 📄 Layout Rules

* **Grid**: 4 columns with 16px gutters (based on a 412px Android Compact frame).
* **Field Width**: Full width, spanning all 4 columns.
* **Field Height**: Minimum 48px.
* **Padding**: 16px horizontal padding.
* **Spacing**: 24px vertical spacing between fields, 32px above the CTA.

---

## 🎨 Visual Style Notes

* **Background**: White or very light gray.
* **Borders**: 1px solid #DDDDDD.
* **Input Radius**: 8px with optional light shadows.
* **Buttons**: Filled with primary gold accent (#FFD700), bold 16px label.
* **Typography**:

  * Title: 24px bold.
  * Labels: 16px regular.
  * Legal: 12px muted.
* **Icons**: Monochrome outline icons, 1.5px stroke, approx. 24px.

---

## 📝 Not in MVP

* Biometric login (Face ID, Touch ID).
* Password strength indicator.
* Multi-step onboarding flow.

---

## ✅ Notes

* All form fields must support appropriate mobile keyboards (e.g., email input type, password masking).
* Home icon provides quick return to `01_home`.
* Header/footer follow the standard layout from `01_home`.
* Successful login redirects to `03_dashboard`.
