# Use-case diagram — account — auth, profile hub & RGPD

> **Feature**: identifier-first sign-in #1081; profile completion #645 #836;
> settings merge #644; RBAC CREATOR role #821.
> **Personas**: all (every user has an account); Léa (first sign-up must be easy).

## Context

Who interacts with account/identity and to do what: authenticate, manage the
profile hub, control privacy (RGPD). The profile becomes a hub (ux-refonte) so
secondary destinations (equipment, shop, stats, settings) are reached from here.
Grouped by domain; Mobile/API split in the component view; PII flows in
`06-data-flow.md`.

## Diagram

```mermaid
flowchart LR
  User(("User — all personas"))
  Admin(("Administrator / Creator"))

  subgraph SYSTEM ["Brasse-Bouillon — Account"]
    subgraph Auth ["Authenticate"]
      UC1(("Sign in (identifier-first: email → continue)"))
      UC2(("Create an account"))
      UC3(("Reset a forgotten password"))
      UC4(("Sign out"))
    end
    subgraph Profile ["Manage my profile"]
      UC5(("Edit identity (name, username, avatar)"))
      UC6(("Change my password"))
      UC7(("Set preferences (units, language)"))
      UC8(("Open my equipment / shop / statistics"))
    end
    subgraph Privacy ["Privacy (RGPD)"]
      UC9(("Export my data"))
      UC10(("Delete my account"))
    end
    subgraph Admin_ ["Administration"]
      UC11(("Assign roles (RBAC)"))
    end
  end

  User --> UC1
  User --> UC2
  User --> UC3
  User --> UC4
  User --> UC5
  User --> UC6
  User --> UC7
  User --> UC8
  User --> UC9
  User --> UC10
  Admin --> UC11
```

## Notes

- **UC1 identifier-first (#1081)**: the user enters email, taps "Continuer", and
  the app routes to password (account exists) or create-password (new). Removes
  the Connexion/Inscription tabs. The "exists?" check must be **enumeration-safe**
  (see `02-sequence`).
- **Profile hub (UC8)**: equipment / shop / statistics are reached *from* the
  profile (ux-refonte target); they are separate domains, linked here.
- **RGPD (UC9/UC10)**: data export + account deletion are first-class user
  rights (#645) — see the data-flow diagram for the PII involved.
- **RBAC (UC11)**: roles are USER / ADMIN / CREATOR (#821, CREATOR single-holder
  above ADMIN). Role assignment is an admin goal, distinct from self-service.
- **Demo mode**: typing the reserved demo credentials on UC1 enters demo mode
  (existing `isDemoTriggerCredentials`), not a real auth — a separate path.
