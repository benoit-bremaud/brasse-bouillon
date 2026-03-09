# Secret Incident Runbook

This runbook describes the procedure to follow in case of a confirmed or suspected secret compromise (JWT, seed token, DB credentials, etc.).

## 1) Incident Triggers

Trigger this runbook if at least one of these signals is observed:

- A secret was accidentally committed to Git
- A secret was exposed in logs, screenshots, or tickets
- Suspicious activity is detected (abnormal auth, unusual API calls)
- A security alert is raised by GitHub / dependencies / platform

## 2) Immediate Priorities (T0)

1. **Contain**: stop the exposure immediately (remove secret from public places)
2. **Revoke/rotate** the compromised secret
3. **Redeploy** services with the new secret
4. **Trace** the incident (timestamp, scope, actions)

## 3) Operational Procedure

### Step A — Qualification

- Identify the affected secret (`JWT_SECRET`, seed token, etc.)
- Identify impacted environments (`staging`, `production`, or both)
- Assess exposure window (since when? where?)

### Step B — Rotation

- Generate a new strong secret (long, random, unique)
- Update GitHub Environment Secrets for each impacted environment
- Verify that the old secret is invalidated/revoked on the service side

### Step C — Deployment

- Redeploy impacted environments
- Verify application startup (valid config)
- Verify critical endpoints (auth, health, business workflow)

### Step D — Git Cleanup

If a secret was committed:

- Remove the secret from versioned files (hotfix commit)
- Rewrite git history if necessary (team coordination required)
- Revoke the secret even if removed (still considered compromised)

## 4) Post-Incident Checks

- Authentication and access logs reviewed
- No sensitive values left in current repository state
- CI/CD pipelines green after rotation
- Confirmation that only new secrets are active

## 5) Communication

- Inform stakeholders (team + owner)
- Write an incident summary: cause, impact, resolution time
- Add preventive actions to the backlog

## 6) Prevention (Recurring)

- Standard quarterly secret rotation
- Systematic PR review of configuration files
- Keep only `*.example` files in Git
- Prefer runtime injection via platform/CI for staging & production

## 7) Quick Checklist

- [ ] Compromised secret identified
- [ ] New secret generated and injected
- [ ] Old secret revoked
- [ ] Deployment completed
- [ ] Functional checks passed
- [ ] Incident documented
