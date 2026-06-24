/**
 * Brew-preparation readiness domain types.
 *
 * Realises the brew-prep class diagram (PR #1248,
 * docs/architecture/diagrams/brew-prep/04-class.md): `ChecklistItem`,
 * `ReadinessChecklist` and the `Kind` enum. These are TYPES ONLY — per the
 * app's Clean Architecture, the domain layer carries no logic, so the
 * diagram's `ReadinessChecklist.isComplete()` method is realised as a pure
 * function in the application layer (`isChecklistComplete`,
 * brew-readiness.use-cases.ts), not as a method here.
 *
 * Scope: A2 only ever produces an `"ingredient"` checklist; the `"equipment"`
 * kind and the `BrewReadiness` launch gate (UC6) are later build slices
 * (A3 / A4) and are intentionally not modelled yet (YAGNI).
 */

/** The brew-prep `Kind` enum — which readiness list this is. */
export type ChecklistKind = "ingredient" | "equipment";

/**
 * One line of a readiness checklist. Mirrors the UML `ChecklistItem`
 * (`name`, `qty`, `required`, `have`).
 *
 * `id` is an addition not on the diagram: a stable key for React rendering
 * and the toggle handler. It is needed because `ingredientId` is not unique
 * within a recipe — the same ingredient can appear at two timings (e.g. a hop
 * added at 60 min and at flameout) — so the id is composited from the
 * ingredient + its timing + index.
 */
export interface ChecklistItem {
  id: string;
  name: string;
  /** Display string (e.g. "5 kg", "900 g") — matches the UML `qty: string`. */
  qty: string;
  required: boolean;
  have: boolean;
}

/** A readiness checklist of a single kind — the UML `ReadinessChecklist`. */
export interface ReadinessChecklist {
  kind: ChecklistKind;
  items: readonly ChecklistItem[];
}
