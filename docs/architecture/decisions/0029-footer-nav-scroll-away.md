# ADR-0029 — Bottom navigation: flush edge-to-edge scroll-away bar, centralized bottom clearance

**Status**  Proposed
**Date**    2026-07-16 (audit + decisions D1/D2 taken 2026-07-15, branch `claude/mobile-footer-audit-fef293`)
**Owners**  @benoit-bremaud

---

## Context

The mobile app's bottom navigation is a **floating pill**: a `position: absolute` bar inset
24 px from each side and lifted ~24–42 px off the bottom edge, mounted once in
`app/(app)/_layout.tsx` **over** the screen content, while the real expo-router `Tabs` bar is
hidden (`tabBarStyle: { display: "none" }`) — two navigation systems, one of which only exists
to be suppressed.

A full audit (2026-07-15) traced the founder's two standing complaints — *"the bar is not at
the very bottom"* and *"it hides buttons"* — to structural causes, not styling nits:

- **B1 — the pill is out of the layout flow.** Being absolute, it overlays content.
  Non-occlusion relies on a **manual opt-in repeated in 37 screens** (38 consumers of the
  offset hook in total, the 38th being the app-level `Snackbar`): each calls
  `useNavigationFooterOffset()` and wires the value as `paddingBottom` on the right container.
  Any missed screen, wrong container, or bottom-anchored control outside the ScrollView is
  silently covered by the pill.
- **B2 — zero-gap geometry.** The offset the hook returns (`insets.bottom + 8 + 48 + 16`)
  lands exactly on the pill's top edge — the hook reserves **no breathing margin of its own**.
  Screens that visually clear the pill at list end do so through ad-hoc trailing margins added
  per screen (e.g. the recipes list's discover section carries its own
  `paddingBottom: spacing.lg`) — one more instance of the manual compensation this ADR removes;
  screens without such margins end flush under the pill's drop shadow (verified on emulator,
  2026-07-16).
- **M1 — bottom clearance is not centralized**, although the *top* clearance is (the `Screen`
  primitive applies `brandHeader.contentClearance` and its `SafeAreaView` deliberately excludes
  the bottom edge). The bottom was left to 38 call sites.
- **M2/M3 — magic numbers.** The offset hook re-adds the item height (`48`) and a spacing token
  by hand instead of deriving from a shared bar-height constant; `RecipeDetailsScreen`
  additionally hardcodes `+96` for the sticky-CTA height although a token-derived
  `STICKY_CTA_BAR_HEIGHT` exists.
- **M4 — dual navigation system** (hidden native bar + custom pill navigating via
  `router.replace`).

The founder's target, first captured 2026-07-03 and re-confirmed 2026-07-15, is a bar that is
(1) **flush at the very bottom, edge-to-edge**, and (2) **Revolut-style scroll-away** — hides
on scroll-down, reappears on scroll-up. The conception study lives in
`docs/architecture/diagrams/footer-nav-redesign/` (component, state, sequence).

## Decision

1. **Flush edge-to-edge bar (D1).** The floating pill is replaced by a bar anchored to the very
   bottom of the screen, full width, absorbing the bottom safe-area inset inside itself.
2. **Scroll-away behaviour (D1).** The bar hides on sustained scroll-down and reveals on
   scroll-up, per the state machine in `02-state-footer-visibility`. Reveal is forced at list
   top/end, on pull-to-refresh, and on programmatic events (navigation change, keyboard).
3. **Space model (D2) — translate-only.** "Recover space when hidden" is realized by
   **translating the bar off-screen** (`translateY: 0 → +(NAV_BAR_HEIGHT + insets.bottom)`)
   while the content's bottom clearance stays **constant**. Animating the padding itself
   (reclaiming the residual end-of-list gap) is **rejected**: it reflows content on every
   toggle (jank) and reintroduces a dynamic offset (bug surface).
4. **Centralized bottom clearance.** The `Screen` primitive reserves the bar's footprint,
   exactly as it already owns the top clearance. `useNavigationFooterOffset` and the
   **37 per-screen `paddingBottom` call sites are deleted**. `NAV_BAR_HEIGHT`
   (`core/theme/layout.ts`) is the bar's base **visual** height; the effective footprint is
   computed at runtime as `NAV_BAR_HEIGHT + insets.bottom` and shared by `Screen` (reserved
   clearance), the bar (hide translate distance) and its followers — a bare constant cannot
   serve devices with a non-zero bottom safe-area inset.
5. **Single visibility source.** One shared `useScrollDirection` hook (anti-flicker threshold +
   near-top guard, defined once) feeds a `FooterVisibilityContext`. The bar, the app-level
   `Snackbar`, and sticky CTAs all follow that one boolean — they can no longer desync.
6. **Correctness invariant.** In the *Revealed* (at-rest) state, content always clears the bar,
   because the reserved clearance is constant and state-independent. A bottom control can never
   be hidden when the user stops scrolling — occlusion-correctness does not depend on the
   animation.
7. **Accessibility.** With `prefers-reduced-motion`, hide/reveal toggles instantly (no spring).
8. **Non-scrolling screens** never emit scroll events; the bar stays pinned visible.
9. **The custom bar is kept** (the native `Tabs` bar has no scroll-away and would drop the
   animated active indicator); the hidden-`Tabs` mount remains as today. Unifying M4 is out of
   scope for this ADR.

### Bar behaviour (weighted decision matrix)

Weights reflect the founder's stated priorities: fix the occlusion defect for good, honour the
explicit flush-to-bottom ask, and follow the product's UX direction (Revolut benchmark, stated
2026-07-03 and re-confirmed 2026-07-15).

| Criterion (weight) | A. Keep pill, fix margins | B. Static flush bar | **C. Flush + scroll-away** |
| --- | --- | --- | --- |
| Fixes the hidden-buttons root cause (25%) | 2 | 5 | **4** |
| Flush edge-to-edge (explicit ask) (20%) | 1 | 5 | **5** |
| Content real-estate while scrolling (15%) | 2 | 2 | **5** |
| Build cost / regression risk (20%) | 5 | 4 | **2** |
| Matches stated product UX direction (20%) | 2 | 2 | **5** |
| **Weighted score** | **2.40** | **3.75** | **4.15** |

**Chosen: C (flush + scroll-away).** Honest caveat: under a pure-engineering weighting (drop
the UX-direction criterion and redistribute), **B edges C** — B is the simplest correct design
and was the reviewer's recommendation. C is chosen because the UX direction is an explicit,
twice-confirmed founder decision, and clause 6 (constant clearance invariant) neutralizes C's
main correctness risk, leaving animation tuning as its real cost. **B remains the documented
fallback**: if scroll-away tuning proves janky in practice, freezing the bar visible degrades C
into B with no structural rework. **A** is rejected outright — it satisfies neither complaint
and keeps the 38-site coupling.

### Space model when hidden (weighted decision matrix)

| Criterion (weight) | A. Space always reserved | **B1. Translate-only recover** | B2. Animate padding to 0 |
| --- | --- | --- | --- |
| Occlusion-correctness risk (35%) | 5 | **5** | 2 |
| Full-screen feel when hidden (25%) | 2 | **4** | 5 |
| Jank risk (re-layout on toggle) (25%) | 5 | **5** | 2 |
| Build cost (15%) | 5 | **4** | 2 |
| **Weighted score** | **4.25** | **4.60** | **2.75** |

**Chosen: B1.** The full-screen feel comes from the bar's translation, not from re-laying-out
content; the only residue is a bar-height gap visible at the absolute end of a list. **B2**
buys back only that end-of-list gap at the price of reflow jank and a dynamic offset — the very
failure mode this redesign eliminates.

## Consequences

### Positive

- The root cause of "hidden buttons" is removed structurally: clearance is owned by `Screen`,
  37 manual paddings and the offset hook disappear, and clause 6 makes occlusion impossible at
  rest by construction.
- One `NAV_BAR_HEIGHT` source of truth ends the magic-number drift (M2/M3).
- Snackbar and sticky CTAs follow the same visibility boolean as the bar — the current
  hand-synced clearance stack shrinks.
- Content gains the full screen height while scrolling (the product's stated UX direction).

### Negative

- **Migration surface: 37 screens** (plus the Snackbar and sticky CTAs) must swap their manual
  padding for the `Screen`-owned clearance and wire `onScroll` into the shared hook.
- Scroll-away needs real tuning (threshold value, spring feel) and new plumbing
  (`useScrollDirection`, `FooterVisibilityContext`) that a static bar would not.
- The dual-nav mount (M4) is consciously kept.

### Mitigations

- The build PR enumerates all 37 screens as a tracked checklist; the invariant (clause 6) keeps
  every intermediate state safe during migration.
- Threshold and guards live in **one** hook — tuning is a one-file change.
- Fallback path documented: pin `visible = true` and C degrades to the static bar B.

## Alternatives considered

- **A — keep the floating pill, fix margins/gap only.** Cheapest, but fails the explicit
  flush-to-bottom requirement and preserves the 38-site manual coupling that produced the bug.
- **B — static flush bar.** The engineering-optimal fix (see caveat above); rejected as the
  end-state by founder decision, retained as the degrade-gracefully fallback.
- **B2 — reclaim the reserved space by animating padding.** Rejected: reflow jank + dynamic
  offset (see second matrix).
- **Native `Tabs` bar instead of the custom bar.** No scroll-away support, loses the animated
  active indicator; would resolve M4 but at the cost of the two requirements this ADR exists to
  deliver.

## Verification

- `pr-pre-reviewer` checklist additions: no `useNavigationFooterOffset` references remain (the
  hook is deleted); no screen-level `paddingBottom` derived from nav-bar arithmetic; the bar
  height is read from `NAV_BAR_HEIGHT` only (grep for `48` / hardcoded `96` around the footer
  and sticky CTAs).
- Tests pin the state machine (threshold, near-top guard, forced reveals), `Screen`'s reserved
  clearance, and that Snackbar/sticky-CTA track `FooterVisibilityContext`.
- The existing `NavigationFooter.test.tsx` contract (six items, longest-prefix active match)
  must survive the redesign unchanged.

## Relation to other ADRs

- **ADR-0001 (build for today, design for tomorrow)** — this ADR's clauses 4–5 apply
  ADR-0001's clause 1 (minimal implementation for the immediate need): they centralize today's
  real need (one clearance, one visibility source) without speculative abstraction; M4
  unification is deliberately deferred until it hurts.
- Conception: `docs/architecture/diagrams/footer-nav-redesign/` (component, state, sequence)
  realizes this decision; the diagrams cite this ADR.
