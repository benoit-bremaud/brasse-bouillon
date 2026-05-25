# Use-case diagram — labels — design, comply & export

> **Feature**: label designer (shipped to draft); export PDF/Print/Share #629.
> **Journey**: journey 4 "bottle & taste" (ux-refonte flags it as buried today).
> **Personas**: Claire (custom labelled creations), Léa (proud first bottle).

## Context

Who designs a bottle label and to do what, from autofilled draft to a printable
sheet. Today the flow stops at the draft detail (only Modify/Delete); #629 adds
the export/print/share that completes the journey. Grouped by domain. Compliance
(Loi Évin mention) is a constraint surfaced as a use case ("apply the legal
mention"), not an afterthought.

## Diagram

```mermaid
flowchart LR
  Brewer(("Brewer — Claire / Léa"))

  subgraph SYSTEM ["Brasse-Bouillon — Labels"]
    subgraph Design ["Design"]
      UC1(("Create a label from a finished batch (autofill)"))
      UC2(("Customize (template, palette, icon, name, style)"))
      UC3(("Preview the label"))
      UC4(("Apply the mandatory legal mention (Loi Évin)"))
    end
    subgraph Output ["Output (#629)"]
      UC5(("Export as PDF (N per A4 sheet, cut marks)"))
      UC6(("Export as PNG (single)"))
      UC7(("Print via the OS print sheet"))
      UC8(("Share the label"))
      UC9(("Choose the quantity (e.g. 24 bottles → 24 labels)"))
    end
    subgraph Manage ["Manage"]
      UC10(("Browse my labels"))
      UC11(("Delete a label"))
    end
  end

  Brewer --> UC1
  Brewer --> UC2
  Brewer --> UC3
  Brewer --> UC4
  Brewer --> UC5
  Brewer --> UC6
  Brewer --> UC7
  Brewer --> UC8
  Brewer --> UC9
  Brewer --> UC10
  Brewer --> UC11
```

## Notes / suggestions

- **Status**: UC1–UC3 + UC10/UC11 are shipped (design to draft + text-only share);
  **UC5–UC9 (#629)** are the open export pipeline. UC4 is partly shipped (the
  `DEFAULT_LABEL_LEGAL_HINT` constant exists).
- **UC1 autofill** pulls name/style/ABV/volume/brewer/brew-date from the batch +
  recipe — the entry point should be **from the finished batch** (journey 4),
  which the ux-refonte fixes (today it is buried under "Voir plus").
- **UC4 compliance (Loi Évin, art. L.3323-4)**: the sanitary mention is
  mandatory on every alcohol label. **Suggestion** — make it non-removable in the
  editor (render it always), and consider other mandatory mentions (ABV, volume,
  allergens e.g. "contient de l'orge/gluten") — currently only the health mention
  is modelled; allergens are a likely legal gap to confirm.
- **Out of scope**: bulk/varied labels per bottle, NFC/QR on label — v0.2.
