# Class diagram — account — identity, session, preferences, consent

> **Feature**: profile completion #645 #836; RBAC #821; identifier-first #1081.
> **Source**: `features/auth/domain/auth.types.ts`, `core/auth/session.ts`.

## Context

The identity model: User + Session (today), extended with the profile/preferences
and RGPD-consent the completion epics add (#645/#836). Fields beyond today's
`User` are flagged as additions to confirm before migration.

## Diagram

```mermaid
classDiagram
  class User {
    +UUID id
    +string email
    +string username
    +string firstName
    +Role role
  }
  class Session {
    +string accessToken
    +Date expiresAt
  }
  class Profile {
    +UUID userId
    +string avatarUrl
    +UnitSystem units
    +Locale language
  }
  class Consent {
    +UUID userId
    +bool analytics
    +bool marketing
    +Date updatedAt
  }

  User "1" --> "0..1" Session : authenticated
  User "1" --> "1" Profile
  User "1" --> "1" Consent

  class Role {
    <<enumeration>>
    USER
    ADMIN
    CREATOR
  }
  class UnitSystem {
    <<enumeration>>
    metric
    imperial
  }
  class Locale {
    <<enumeration>>
    fr
    en
  }
```

## Notes / suggestions

- **Today** the `User` has `id/email/username/firstName/role` (role is a
  `string`); `Session` has only `accessToken`. Everything else (`Profile`,
  `Consent`, `expiresAt`, the enums) is the **#645/#836 addition** — flagged, not
  assumed.
- **`Role` enum (#821)**: promote the current `string` role to a typed enum with
  CREATOR above ADMIN (single-holder, seeded once). **Suggestion**: capture the
  CREATOR-uniqueness invariant in an ADR — it is a structural rule, not just data.
- **`Locale` ties to the bilingual FR/EN epic** (#512): the language preference
  here is the per-user override of the app default — coordinate with the i18n
  chantier so there is one source of truth for locale.
- **`Consent`** is the RGPD backbone (cookie/analytics/marketing opt-ins). The
  website already gates analytics on consent; **suggestion** — align the mobile
  consent model with the website's so a user's choice is coherent across surfaces.
