# ADR-0014 — Website hosting on Cloudflare Pages, DNS authority on Cloudflare

**Status**  Accepted
**Date**    2026-05-29
**Owners**  @benoit-bremaud

> Supersedes the implicit "GitHub Pages on the custom domain" hosting
> assumption for `packages/website` (and the hosting half of the
> machine-local `website-pages-deploy` runbook). The site content and the
> public-asset staging logic are unchanged — only the host and the DNS
> authority move.

---

## Context

- `packages/website` is the marketing site: plain static HTML/CSS/JS, no
  build step, served at the **root** of `brasse-bouillon.com`. Asset
  references are relative; the canonical URL is the **naked apex**
  (`https://brasse-bouillon.com/`, asserted by every `<link rel="canonical">`).
- It was published via **GitHub Pages** on the custom domain. When the repo
  `benoit-bremaud/brasse-bouillon` turned **private** on a GitHub **Free**
  plan, Pages stopped serving (Free serves Pages from public repos only) and
  the apex began returning **404**.
- DNS for `brasse-bouillon.com` was hosted at **Namecheap (BasicDNS)**:
  apex `A` records → GitHub Pages IPs `185.199.108-111.153`, `CNAME www →
  benoit-bremaud.github.io`, one `TXT google-site-verification` (Search
  Console), and a stale `A backend → 109.18.26.95` (a residential SFR IP — a
  self-hosted NestJS API from the Ydays/Klouders era, no longer used; the
  real API is `brasse-bouillon-api.fly.dev`). No MX, no DNSSEC.
- A **Cloudflare account already exists** and hosts other web properties
  (the needs-study site `brasse-bouillon-marketing.pages.dev`, the feedback
  Worker). Repo Actions secrets `CLOUDFLARE_API_TOKEN` (scoped Pages:Edit)
  and `CLOUDFLARE_ACCOUNT_ID` are already provisioned.

## Decision

**Host `packages/website` on Cloudflare Pages and move DNS authority for
`brasse-bouillon.com` to Cloudflare.** Namecheap remains the **registrar
only**.

1. **Hosting** — a dedicated Cloudflare Pages project
   **`brasse-bouillon-website`** (distinct from `brasse-bouillon-marketing`).
2. **Deploy** — GitHub Actions **Direct Upload** via `wrangler pages deploy`
   on push to `main` (and `workflow_dispatch`). The target branch is derived
   from `github.ref_name`: `main` is the production branch, any other branch
   produces a Cloudflare **preview** deployment. Project bootstrap tolerates
   only the "already exists" case. (PR #1144.)
3. **DNS authority** — delegate `brasse-bouillon.com` nameservers from
   Namecheap BasicDNS to **Cloudflare**. Choosing Cloudflare DNS is what makes
   the **apex** resolve to Pages cleanly (CNAME flattening), which Namecheap
   BasicDNS cannot do for a naked apex.
4. **Clean-slate target zone** — the Cloudflare zone holds **only**:

   | Type  | Name        | Content                             | Proxy     | Origin |
   |-------|-------------|-------------------------------------|-----------|--------|
   | TXT   | `@`         | `google-site-verification=J2oPuRCC1KJ5z-…` | DNS only | kept (Search Console) |
   | CNAME | `@` (apex)  | `brasse-bouillon-website.pages.dev` | Proxied   | auto-created by the Pages custom domain |
   | CNAME | `www`       | `brasse-bouillon-website.pages.dev` | Proxied   | auto-created by the Pages custom domain |

   Explicitly **removed**: the 4 GitHub Pages apex `A` records, the old
   `CNAME www`, and the legacy `A backend`.
5. **Registrar hygiene (Namecheap)** — Auto-Renew ON, Registrar Lock ON,
   Domain Privacy ON. Switching to Custom DNS auto-deactivates the old
   BasicDNS host records (no manual deletion needed there).

**Ruled out**
- *Keep GitHub Pages* — incompatible with a private repo on the Free plan.
- *Keep DNS at Namecheap with a `www` CNAME only* — Namecheap BasicDNS has no
  proper apex CNAME/ALIAS, and the apex is the canonical URL.

## Consequences

**Positive**
- The site is served again on the canonical apex, with automatic TLS + CDN.
- One Cloudflare account fronts every web property; consistent tooling.
- Per-branch preview deployments come for free with the ref-derived branch.
- The DNS zone is minimal and documented (this ADR is the source of truth).

**Negative / accepted**
- DNS resolution now depends on Cloudflare; the nameserver migration carries
  a propagation delay (minutes–hours).
- The in-repo `packages/website/CNAME` file is now **vestigial**
  (GitHub-Pages-specific) and must be removed in a follow-up, along with its
  entry in the workflow staging step.

## Roadmap

- [x] PR #1144 — deploy workflow → Cloudflare Pages; live on
  `brasse-bouillon-website.pages.dev`.
- [ ] Delegate NS Namecheap → Cloudflare; apply the clean-slate zone; add the
  Pages custom domains (`brasse-bouillon.com`, `www`).
- [ ] Remove the vestigial `packages/website/CNAME` from the repo + staging.
- [ ] (Optional) Enable DNSSEC via Cloudflare (DS record added at Namecheap).

## References

- PR #1144 — `ci(website): deploy to Cloudflare Pages instead of GitHub Pages`.
- [ADR-0001](0001-build-for-today-design-for-tomorrow.md) — build for today.
- Machine-local runbook `website-pages-deploy` (hosting half now superseded).
