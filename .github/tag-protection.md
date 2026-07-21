# Tag Protection — Brasse-Bouillon

This repository enforces tag-protection on release tags to prevent
accidental rewrites or deletions. Applied via a GitHub repository
ruleset scoped to every tag pattern used by release-please.

## Tag patterns protected

Every package versions independently (see [CONTRIBUTING.md](../CONTRIBUTING.md#release-workflow)):

- `mobile-app-v*` — independent
- `api-v*` — independent
- `website-v*` — independent
- `encyclopedia-v*` — independent
- `v*` — reserved for repo-wide anchors (audit snapshots, milestones)

`mobile-app-v*` and `api-v*` were kept in lockstep until 2026-07-20, when the
`linked-versions` group was removed because it prevented release-please from
tagging app releases at all. The protected patterns themselves are unchanged.

## Ruleset policy (current, active)

- Rules: **`update`**, **`deletion`** — blocked
- Rules: `creation` — **not blocked** (intentional, see below)
- Enforcement: `active`
- Bypass: `RepositoryRole: Admin` (`actor_id: 5`), mode `always`
- Ruleset id: `15481614`

### Why `creation` is not blocked

As of 2026-04-24, release-please authenticates with a **fine-grained
Personal Access Token** stored as the `RELEASE_PLEASE_TOKEN` secret
(see `CONTRIBUTING.md` §Release Workflow → Authentication). The PRs
and tags it creates are therefore attributed to the **PAT owner**
(`@benoit-bremaud`, an admin), not to `github-actions[bot]`.

The PAT owner is an admin with `always` bypass on this ruleset, so
they could cross an admin-only creation rule. We still keep `creation`
unblocked to preserve two properties:

1. **Determinism** — tags always appear promptly without any admin
   bypass step at release time.
2. **No infrastructure deadlock** — should the PAT ever be swapped for
   a GitHub App (e.g. if the repo goes public and we want automation
   that does not depend on a personal credential), the creation rule
   would already be compatible.

Tags remain **immutable once created** (`update` + `deletion` still
blocked with admin-only bypass), which preserves the audit integrity
goal. The small risk of rogue tag creation is acceptable for a
private solo-dev repo.

### Historical note

The previous setup (before 2026-04-24) used the default `GITHUB_TOKEN`
with release-please running as `github-actions[bot]`. That setup
worked for tags, but had a separate side-effect: CI workflows did not
trigger on release-please PRs (GitHub refuses to trigger
`pull_request` workflows from events created by its own internal
token, to prevent infinite loops). The PAT switch fixes both concerns
in one change.

## Apply (one-time, by owner)

```bash
gh api repos/benoit-bremaud/brasse-bouillon/rulesets \
  --method POST \
  --input - <<'EOF'
{
  "name": "Protect release tags",
  "target": "tag",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/tags/v*",
        "refs/tags/mobile-app-v*",
        "refs/tags/api-v*",
        "refs/tags/website-v*",
        "refs/tags/encyclopedia-v*"
      ],
      "exclude": []
    }
  },
  "rules": [
    { "type": "update" },
    { "type": "deletion" }
  ],
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ]
}
EOF
```

## Verify

```bash
gh api repos/benoit-bremaud/brasse-bouillon/rulesets \
  --jq '.[] | select(.target=="tag") | {id, name, enforcement}'
```

Expected output:

```json
{
  "id": <some-id>,
  "name": "Protect release tags",
  "enforcement": "active"
}
```

## Remove (emergency only)

```bash
# First get the ruleset ID
RULESET_ID=$(gh api repos/benoit-bremaud/brasse-bouillon/rulesets \
  --jq '.[] | select(.name=="Protect release tags") | .id')

gh api repos/benoit-bremaud/brasse-bouillon/rulesets/$RULESET_ID \
  --method DELETE
```

## Signing

Tag signing is currently **optional** (private repo). Becomes
**mandatory** before any public release:

1. Configure a GPG or SSH signing key locally: `git config --global user.signingkey <KEY_ID>`
2. Set `git config --global tag.gpgsign true`
3. release-please does not currently sign tags — this requires a
   workflow extension when the repo goes public.

See the global CLAUDE.md § Tag Conventions for the full signing
policy when transitioning to public.
