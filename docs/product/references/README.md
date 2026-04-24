# External Reference Material

This folder hosts **external reference PDFs and assets** consulted during
product, encyclopedia, and scan feature work. **None of these files are
versioned in git** — they are copyright of their original publishers and
kept only as local working copies.

The `.gitignore` at the repo root has an explicit rule excluding
`docs/product/references/*.pdf` from version control. This `README.md`
is the only file tracked in this folder.

## Current local references

| File | Source | Purpose |
|---|---|---|
| `diy-dog-brewdog-2019-v8.pdf` | [BrewDog — DIY DOG](https://www.brewdog.com/uk/community/culture/diy-dog) | Open-source recipe book from BrewDog. ~27 MB. Used as a reference for (a) the Scan Tranche 2 demo (Punk IPA official recipe matching), (b) the beer encyclopedia seed data, and (c) product decisions about how to present official vs community recipes (pharmacy metaphor, ADR-0001 roadmap). |

## How to add a new reference

1. Drop the PDF (or other binary) in this folder. Name it with the
   pattern `<source>-<topic>-<year>-<version>.<ext>` for clarity:
   - `brewdog-diy-dog-2019-v8.pdf`
   - `saveurbiere-catalogue-2024.pdf`
   - `microbrasseur-rapport-2023.pdf`
2. Verify `.gitignore` still protects it: `git check-ignore <path>`
   should print the file path.
3. Add one row in the **Current local references** table above with:
   - The filename.
   - A public URL to the source (if any).
   - A one-line purpose.
4. Commit the README update (the binary itself stays local).

## Policy — why we don't commit these

- **Copyright** — we do not own these documents; versioning them in a
  repo (even private) would make redistribution easier, which is not
  our right.
- **Size** — most references are tens of MB (DIY DOG is 27 MB).
  Committing them would bloat the repo history permanently and slow
  `git clone` for every contributor.
- **Stability** — references change over time (annual editions, new
  versions). We pin in the table above the version we consulted for
  each piece of work, without carrying the binary.

## If you need to share a reference

Send the original public URL to the recipient. If the document is no
longer publicly available, archive.org is usually the right channel —
do not re-upload to GitHub / Slack / etc.
