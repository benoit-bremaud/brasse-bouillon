# Data-flow diagram — website-i18n — bilingual content pipeline (authoring → deploy)

> **Feature**: website i18n epic (bilingual FR+EN marketing site)
> **Related ADRs**: ADR-0027 (D1 — hybrid strategy; D2 — URL scheme), ADR-0014
> **Decisions captured**: D1 clauses 1–5, D2 clause 2

## Context

Where bilingual content comes from and how it reaches production. Contingent on
ADR-0027 acceptance (hybrid: generated EN home, guarded legal twins). Also flags
the only two visitor-side data flows (form submissions, language preference) so
the privacy review cannot be skipped.

## Diagram

```mermaid
flowchart LR
  M((Maintainer))
  subgraph Authoring ["Authoring (git, packages/website)"]
    FR["index.html<br/>(FR source, data-i18n annotated)"]
    CAT["i18n/home.en.json<br/>(EN catalog)"]
    GEN["scripts/build_i18n.py<br/>(stdlib only)"]
    EN["en.html<br/>(GENERATED, committed)"]
    LFR["legal twins FR<br/>(hand-edited)"]
    LEN["legal twins EN<br/>(hand-edited + i18n-src stamp)"]
  end
  subgraph CI ["CI (PR gate)"]
    QG["quality_gate.py<br/>+ regen diff + key parity<br/>+ stamp freshness"]
  end
  subgraph Deploy ["Deploy (main)"]
    SITE["_site/ staging<br/>(website-deploy.yml)"]
    CF["Cloudflare Pages<br/>brasse-bouillon.com"]
  end
  V(("Visitors FR/EN"))
  FS(["Formspree (US, CCT)"])
  LS[("localStorage<br/>bb-lang")]

  M -->|"edits FR copy"| FR
  M -->|"translates flagged keys"| CAT
  FR --> GEN
  CAT --> GEN
  GEN -->|"generates"| EN
  M -->|"edits + re-reviews twin"| LFR
  M --> LEN
  FR --> QG
  EN --> QG
  CAT --> QG
  LFR --> QG
  LEN --> QG
  QG -->|"merge when green"| SITE
  SITE --> CF
  CF -->|"/ and /en (301 from /index-en)"| V
  V -->|"PII: email, contact, answers (form POST, lang=fr/en)"| FS
  V -->|"language preference (no PII, client-only)"| LS
```

## Notes

- The generator runs at **authoring time**, never at deploy time — `en.html` is
  committed, so `website-deploy.yml` stays a dumb copy (`_redirects` added to its
  fail-loud copy list, ADR-0027 D2 clause 2).
- CI is the drift guard: stale `en.html`, missing/orphaned catalog keys, or a
  stale legal stamp all fail the PR (D1 clause 4–5).
- **PII edges**: only the existing Formspree submissions carry PII (email,
  contact field, questionnaire answers) — unchanged by this epic, EN adds
  `lang=en` only. `bb-lang` is a non-PII functional preference that never leaves
  the browser; it must be disclosed on the cookies pages (D4 clause 4).
- Legal twins deliberately bypass the generator: stable, jurisdiction-specific
  prose (guarded by stamp, not templated).
