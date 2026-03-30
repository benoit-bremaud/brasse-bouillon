# Security Policy

## Supported Versions

| Version    | Supported |
| ---------- | --------- |
| main (HEAD) | Yes       |
| < main      | No        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue.**
2. Email the project lead at **bbd.concept@gmail.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. You will receive an acknowledgment within **48 hours**.
4. A fix will be prioritized based on severity.

## Security Practices

- Dependencies are monitored via GitHub Dependabot alerts.
- JWT secrets are never committed (enforced via `.gitignore` and `.env.example` patterns).
- SQL injection is mitigated by TypeORM parameterized queries.
- XSS protection follows React Native's default output escaping.
- All API endpoints require JWT authentication (except public routes).

Thank you for helping keep Brasse-Bouillon secure.
