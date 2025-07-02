# Brasse-Bouillon – Design Charter

> This document defines the visual and identity foundations of the Brasse-Bouillon project.  
> It provides clear guidelines to ensure visual consistency, reinforce brand identity, and support a unique user experience.

This design charter will evolve continuously throughout the development of Brasse-Bouillon.  
It serves as a collaborative reference for all contributors: developers, designers, and community members.

Key sections include core values, visual identity, tone of communication, logo usage, color palette, typography, and UI principles.

**Updates and improvements are welcome at every stage of the project to reflect Brasse-Bouillon’s spirit of creativity, innovation, and community.**

## 1.1 Core Values

Brasse-Bouillon is built upon a set of core values that shape every aspect of the project and community.  
These values ensure consistency with our mission and guide both product development and user experience.

1. **Community**  
   Empowering users to connect, share, and grow together as passionate homebrewers.

2. **Accessibility**  
   Making brewing knowledge and tools available to everyone, regardless of experience or background.

3. **Quality**  
   Committing to a reliable, enjoyable, and robust experience across all features and interfaces.

4. **Transparency**  
   Operating openly, communicating clearly, and sharing knowledge through open-source principles.

5. **Innovation**  
   Continuously improving and offering new solutions to simplify and enrich the homebrewing journey.

## 1.2 Culture & Spirit

Brasse-Bouillon is more than a tool – it’s a collaborative, creative adventure inspired by the DIY spirit and a love for brewing.

- **DIY Spirit**  
  Fostering hands-on experimentation and empowering every user to brew, learn, and innovate by themselves.

- **Creativity**  
  Encouraging everyone to explore new recipes, personalize their brews, and share unique ideas.

- **Collaboration**  
  Building together – from recipes and advice to events and features – Brasse-Bouillon is a collective journey.

- **Learning & Knowledge Sharing**  
  Promoting continuous learning and open sharing of successes, failures, and tips within the community.

- **Openness**  
  Welcoming all backgrounds, tastes, and skill levels in a spirit of kindness and constructive feedback.

## 1.3 Communication Tone

Brasse-Bouillon communicates with a **friendly, inclusive, and professional** tone, always infused with playful enthusiasm and a strong DIY spirit.  
We aim to make every interaction welcoming and accessible, supporting both beginners and experienced brewers on their journey.

- **Friendly & Supportive:**  
  “No question is too basic—every expert was once a beginner. Ready to brew up something amazing together?”
- **Inclusive:**  
  “Whether you brew in your kitchen or in your garage, you’re part of the Brasse-Bouillon family.”
- **Professional (but never boring):**  
  “Our step-by-step guides make sure you’ll never be lost—if you have a doubt, just ask, and the community will help.”
- **Playful & DIY-Inspired:**  
  “Not happy with the recipe? Twist it! Add a pinch of your personality and share your results. Brewing is an adventure!”

*Celebrate experimentation, share knowledge openly, and value every step of the brewing journey—successes and mistakes alike.*

## 1.4 Purpose & Vision

### User Needs & Project Motivations

Amateur brewers today face several challenges:

- Recipes are scattered between notebooks, spreadsheets, and various apps, leading to confusion and lost information.
- Technical calculations (like IBU or ABV) are complex and error-prone, especially for beginners.
- Brewing knowledge is fragmented across blogs, forums, and PDFs, making it hard to learn or progress.
- There is no dedicated space to connect, share, and learn as a community of homebrewers.

Brasse-Bouillon was born to address these gaps by creating a central, modern, and collaborative mobile app for amateur brewers.
Our goal is to simplify every step of recipe management and brewing, empower users to share and grow together, and lay the foundations for a dynamic ecosystem—from guided brewing to social features and (in the future) local supply integration.

---

### Purpose

**Brasse-Bouillon’s mission is to empower amateur brewers by providing a modern, intuitive, and community-driven platform for recipe management, brewing guidance, and knowledge sharing.
We exist to make homebrewing accessible, enjoyable, and collaborative for everyone—turning each brew into a shared adventure.**

---

### Vision

**Within the next five years, Brasse-Bouillon aims to become the reference hub for homebrewers—first in France, then internationally.
Our vision is to create a thriving ecosystem where amateur brewers of all backgrounds can:**

- **Share and refine their recipes, techniques, and brewing stories in a vibrant, supportive community.**
- **Access intelligent tools and resources to automate technical tasks, learn new skills, and experiment with confidence.**
- **Benefit from a transparent, open-source platform that evolves through collective feedback and contribution.**
- **Connect with local suppliers, discover events, and unlock new opportunities—making homebrewing both social and sustainable.**

Brasse-Bouillon will continuously expand its features—from advanced analytics and guided brewing to integrated marketplaces and IoT connectivity—always placing user empowerment, collaboration, and the joy of brewing at the heart of the project.

---

*To turn homebrewing into a truly collective, accessible, and ever-evolving adventure—where everyone can brew better, together.*

## Technical Constraints

### Multi-Platform Compatibility

To ensure a consistent experience across web, Android, and iOS platforms, the following technical constraints apply:

| UI Element / Asset       | Web (PWA/Desktop)                          | Android                                     | iOS                                         |
|--------------------------|-------------------------------------------|---------------------------------------------|----------------------------------------------|
| **Icons**                | `favicon.ico`, `manifest.json`            | Adaptive icons (`192x192`, `512x512`)       | `apple-touch-icon`, `startup-image`          |
| **Splash screen**        | Not required                              | Handled via `manifest.json`                 | Requires specific meta tags and images       |
| **Safe zones**           | Standard CSS margins                      | Status bar, notch, gesture zone awareness   | Additional top margin for notch/time bar     |
| **Back navigation**      | Handled by browser                        | Hardware/software back button               | Must be implemented in UI manually           |
| **Installability**       | `manifest.json` + Service Worker          | Supported natively (Chrome, Edge)           | Limited support (Safari)                     |
| **Resolution targets**   | Fluid breakpoints from 360px to 1920px+   | 360–480px (phones), ≥600px (tablets)        | Same, with attention to legacy devices       |
| **Touch gestures**       | Not applicable                            | May conflict with scroll/swipe              | Same, careful with left/right swipe          |
| **Storage constraints**  | IndexedDB, LocalStorage (limited)         | Persistent but sandboxed                    | Very limited; prone to system cleanup        |

**Recommendations:**

- Use `responsive`, **mobile-first** layouts with fluid grids and clear breakpoints.
- Provide **SVG icons** or raster sets at 1x, 2x, 3x resolutions.
- Avoid relying solely on `:hover` effects.
- All UI elements must scale properly with native zoom levels.

---

### Legal & Compliance Constraints

#### GDPR Consent & Privacy

- **Explicit opt-in required**: consent must be voluntarily given, specifically, informed, and unambiguous; no pre‑checked boxes, per Article 7 and recital 32 GDPR.
- **Separate consent choices** for different processing purposes (cookies, newsletter, analytics, etc.).
- **Easy revocation**: user must be able to withdraw consent as easily as granting it.
- **Clear privacy policy link**, explaining controller identity, data types, purposes, data retention, third‑parties.

#### Data Retention

- **Explicit mention** of retention duration for each data type in UI copy.
- **User‑initiated deletion/export feature** available in profile or settings.

#### Age Verification & Parental Consent

- **Age verification required** for restricted content (e.g. alcohol community). 
- For sites aimed at minors (<15 yo), **parental consent is mandatory**, obtained from at least one guardian.
- **Systems should respect privacy principles**: proportionality, data minimization, robustness, independence (e.g. via trusted third party).
- **Double‑blind architecture** advised for sensitive content (e.g. pornographic).

---

#### UX Copy Checklist (Legal)

- [ ] Cookie banner with explicit opt-in and separate consent options
- [ ] Prominent link to Privacy Settings
- [ ] Clear mention of retention duration for each data type
- [ ] Age gate with verification before accessing sensitive content
- [ ] Parental consent flow for users < 15 yo (one guardian minimum)

---

### Accessibility Constraints (WCAG 2.2 AA + RGAA v4)

#### Standards & References

- Conform with **WCAG 2.2 Level AA** (global) and **RGAA v4** (French national). RGAA v4 is legally binding under Loi 2005‑102 / Article 47 and implements WCAG 2.1 AA + extension v4 criteria.
- WCAG 2.2 adds **9 new success criteria**, including:
  - **2.4.11 Focus Not Obscured – Minimum (AA)**: focused elements must remain at least partially visible despite overlays.
  - **2.5.7 Dragging Movements (AA)**: provide alternative to drag gestures.
  - **2.5.8 Target Size (AA)**: minimum interactive area of 24x24 px.
  - **3.3.8 Accessible Authentication (AA)**: support non-visual, memory-free methods.

#### Key Success Criteria to Implement

- **Contrast**: text-to-background ≥ 4.5:1; large text ≥ 3:1.
- **Semantic HTML**, ARIA roles, landmarks.
- **Keyboard navigation**: all interactive items reachable and focus visible.
- **Focus Not Obscured**: avoid sticky/static overlays hiding focused elements (criterion 2.4.11).
- **Tap targets ≥ 24x24 px** (preferably ≥ 48x48 px).
- **Alternatives for dragging UI** (e.g. buttons) for touch/motor users.
- **Accessible forms**: labels, error messages, duplicate entries avoided (3.3.7).
- **Accessible login**: alternatives to visual-only authentication like password entry (3.3.8).
- **Help must be findable** (sc. 3.2.6).
- **Images require alt-text**, complex images have descriptions.
- **Live region and focus management** for dynamic content.

#### RGAA v4 Specifics

- Publish an **accessibility statement** (Déclaration d’accessibilité).
- Provide contrast/semantic testing as per RGAA guides.
- Ensure accessibility extends beyond web to downloadable documents.

---

#### ✅ Accessibilité - Checklist

- [ ] Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] Focus outline visible, not obscured by overlays
- [ ] Interactive targets ≥ 24x24 px
- [ ] Alternative controls for drag features
- [ ] Forms: labels, ARIA roles, no duplicate entry
- [ ] Accessible authentication (e.g. passkey, email)
- [ ] Help/support visible throughout UX
- [ ] Alt-text on all images; description for complex visuals
- [ ] Accessibility statement published

---

### Design Checklist (derived from Technical Constraints)

Use this checklist to verify that every design respects the technical, legal, and accessibility constraints:

#### Assets & Responsive Layout

- [ ] Icons provided in SVG or raster at **1× / 2× / 3×** resolutions, in platform-specific formats.
- [ ] Grid system mobile-first, with breakpoints at **360px (sm), 600px (md), 1024px (lg)**.
- [ ] Avoid hover-only interactions; mobile-friendly touch alternatives are implemented.

#### Contrast & Typography

- [ ] Text-to-background contrast ≥ 4.5:1 (normal) or ≥ 3:1 (large).
- [ ] Non-text UI elements (buttons, icons) contrast ≥ 3:1.
- [ ] Font size ≥ 14 px (body), adjustable up to 200% without layout breakage.

#### Touch Targets & Gestures

- [ ] Interactive elements tap target ≥ 24×24 px (preferably ≥ 48×48 px) with adequate spacing.
- [ ] Provide alternatives for drag or gesture actions (2.5.7) via single-tap controls.

#### Keyboard & Focus Management

- [ ] All interactive elements reachable via keyboard; logical tab order maintained (2.1.1, 2.4.3).
- [ ] Visible focus outline that remains at least partially visible (2.4.7, 2.4.11).

#### Forms & Authentication

- [ ] Inputs have proper `<label>` or accessible name associations (1.3.1).
- [ ] Errors are clearly identified and suggestions provided (3.3.1–3.3.3).
- [ ] Authentication supports non-visual, memory-free alternatives (3.3.8).

#### Media & Dynamic Content

- [ ] Captions (pre‑recorded/live) and transcripts for audio/video.
- [ ] Pause/stop/hide mechanism for dynamic content > 5 s (2.2.2).
- [ ] Live status messages use ARIA `role="alert"` to ensure screen reader visibility.

#### Semantic Structure & Alt Text

- [ ] Semantic HTML used: headings, landmarks, navigation tags (1.1.1, 1.3.1).
- [ ] Alt text provided for all meaningful images; long description for complex visuals.

#### Help & Session Controls

- [ ] Help options (links, support) visible and consistent (3.2.6).
- [ ] Session timeouts warned and user can adjust or extend (2.2.1).
