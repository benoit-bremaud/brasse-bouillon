# Tag Protection — Brasse-Bouillon

This repository enforces tag-protection on release tags to prevent
accidental rewrites or deletions. Applied via a GitHub repository
ruleset scoped to every tag pattern used by release-please.

## Tag patterns protected

Per the hybrid monorepo release strategy (see [CONTRIBUTING.md](../CONTRIBUTING.md#release-workflow)):

- `mobile-app-v*` — lockstep with `api-v*` (group "app")
- `api-v*` — lockstep with `mobile-app-v*`
- `website-v*` — independent
- `encyclopedia-v*` — independent
- `v*` — reserved for repo-wide anchors (audit snapshots, milestones)

## Ruleset policy (current, active)

- Rules: **`update`**, **`deletion`** — blocked
- Rules: `creation` — **not blocked** (intentional, see below)
- Enforcement: `active`
- Bypass: `RepositoryRole: Admin` (`actor_id: 5`), mode `always`
- Ruleset id: `15481614`

### Why `creation` is not blocked

release-please runs inside GitHub Actions as `github-actions[bot]` and
uses the default `GITHUB_TOKEN`. That token is **not** an admin and
cannot bypass an admin-only creation rule. Blocking creation while
still wanting automated release tags creates a deadlock.

Two possible resolutions were considered:

1. **Allow creation for everyone** (chosen for v0) — creation rule
   removed from the ruleset. Tags become immutable once created
   (`update` + `deletion` still blocked), which preserves the audit
   integrity goal. The small risk of rogue tag creation is
   acceptable for a private solo-dev repo.
2. **Use a PAT with Integration bypass** (future option) — generate
   a PAT with `contents: write` + `workflows: write`, store as
   `secrets.RELEASE_PLEASE_TOKEN`, pass to the release-please action
   via `token:`. Add the PAT owner as a bypass actor. More secure
   but adds setup complexity. Track as tech-debt if the repo goes
   public.

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
