# Beer Label Taxonomy V1 (Sprint 1)

## Purpose

This taxonomy standardizes label style classes for dataset annotation and model training.
It is intentionally compact for a reliable Sprint 1 baseline.

## Target classes (V1)

1. `ipa`
2. `lager`
3. `wheat`
4. `stout`
5. `amber_ale`
6. `sour`
7. `saison`
8. `tripel`
9. `other`
10. `unknown`

## Class usage rules

- Use `unknown` when style is unreadable or absent.
- Use `other` when readable style does not match any V1 class.
- Do not infer style from bottle shape or brand reputation only.

## Normalization mapping (label text -> normalized class)

### `ipa`
- ipa
- india pale ale
- session ipa
- double ipa

### `lager`
- lager
- pils
- pilsner
- helles
- blonde

### `wheat`
- wheat
- witbier
- weiss
- blanche

### `stout`
- stout
- porter
- imperial stout

### `amber_ale`
- amber
- amber ale
- ambrée / ambree
- red ale

### `sour`
- sour
- gose
- lambic
- berliner weisse

### `saison`
- saison
- farmhouse

### `tripel`
- tripel
- triple

## Out-of-scope styles for Sprint 1

The following styles should map to `other` in V1:
- barleywine
- bock / doppelbock
- rauchbier
- fruit beer (unless clearly in sour style)
- mead / cider / non-beer alcoholic products

## Versioning

- Version: `v1`
- Effective from: Sprint 1
- Review target: before Sprint 2 training cycle
