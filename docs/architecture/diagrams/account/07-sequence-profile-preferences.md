# Sequence diagram — account — edit profile and manage preferences

## Edit identity

```mermaid
sequenceDiagram
  actor U as Brewer
  participant S as Profile screen
  participant UC as Profile application
  participant A as Auth API adapter
  participant API as AuthController
  participant US as UserService
  participant DB as Users database

  U->>S: Edit name, username, email, or bio
  S->>S: Trim values and validate local format
  S->>UC: updateProfile(input)
  UC->>A: updateCurrentUser(input)
  A->>API: PATCH /auth/me (snake_case DTO)
  API->>US: update(userId, validated input)
  US->>DB: check ownership/uniqueness and save
  DB-->>US: updated User
  US-->>API: safe User response
  API-->>A: UserResponseDto
  A-->>UC: mapped User
  UC-->>S: update session user
  S-->>U: show updated identity and return to Account
```

## Privacy preferences

```mermaid
sequenceDiagram
  actor U as Brewer
  participant S as Privacy screen
  participant UC as Profile application
  participant G as Privacy gateway
  participant SC as Scan consent owner
  participant L as Local consent storage

  S->>UC: loadPrivacySettings()
  UC->>G: getSettings()
  G->>SC: getScanConsentSettings()
  SC->>L: read current settings
  L-->>SC: settings or null
  SC-->>G: mapped Scan settings
  G-->>UC: Profile privacy contract
  UC-->>S: render switches and timestamp

  U->>S: Change a consent switch and save
  S->>UC: savePrivacySettings(input)
  UC->>G: saveSettings(input)
  G->>SC: giveScanConsent(mapped input)
  SC->>L: persist settings and append decision record
  L-->>SC: persisted
  SC-->>G: timestamped settings
  G-->>UC: saved contract
  UC-->>S: show saved state
```

## Failure rules

- Local validation prevents an invalid identity request from reaching the API.
- A uniqueness or validation error is displayed without losing form state.
- A privacy-storage failure leaves the current switches visible and does not
  navigate away.
- Each screen disables its save action while its request is pending.
