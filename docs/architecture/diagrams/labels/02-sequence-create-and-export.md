# Sequence diagram — labels — create from batch & export

> **Feature**: label designer; export pipeline #629.

## Context

The journey-4 flow: from a finished batch, create a label (autofilled), customize
it, then export/print/share (#629). Today the chain stops after save (text-only
share); this models the export pipeline to add.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant Bd as "Mobile — BatchFinishedScreen / Labels"
  participant E as "Mobile — LabelEditorScreen"
  participant UC as "Mobile — labels.use-cases"
  participant EX as "Export (expo-print / pdf-lib)"

  B->>Bd: "Créer l'étiquette" (from finished batch)
  Bd->>UC: createLabelDraftFromBatch(batchId)
  UC-->>E: LabelDraft (autofillFields: beerName/style/abv/volumeLiters/breweryName/brewDateIso)
  B->>E: Pick template / palette / icon, adjust name + subtitle
  E->>E: live preview (legalHint always rendered)
  B->>E: Save draft
  E->>UC: updateLabelDraft(draft)

  rect rgb(245,245,245)
    note over B,EX: Export — PLANNED (#629, not yet implemented)
    B->>E: Tap "Exporter", choose format + quantity
    E->>UC: exportLabel(draftId, format, quantity) (to build)
    UC->>EX: render (PDF A4 N-up + cut marks / PNG / print)
    EX-->>UC: file / print job
    UC-->>B: OS share/print sheet
  end
```

## Notes / suggestions

- **Autofill at creation** binds the label to the batch's real data; later batch
  edits do **not** retro-change a saved label (snapshot) — confirm this is the
  desired behaviour for #629.
- **Export library**: #629 suggests `expo-print` or `pdf-lib`. **Suggestion** —
  PDF A4 packing needs correct physical dimensions per bottle format (33/44/75 cl)
  with bleed + cut marks; spec the mm dimensions before building so labels print
  to size.
- **No network needed** for export (local render) — works offline.
- **Demo mode**: autofill reads the demo batch; export still produces a real file.
