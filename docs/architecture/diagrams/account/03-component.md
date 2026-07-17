# Component diagram — account — Clean Architecture boundaries

> **Feature**: Account/Profile MVP. The diagram shows ownership and allowed
> dependencies, not navigation details.

```mermaid
flowchart LR
  User((Brewer))

  subgraph Mobile["Mobile app"]
    Routes["Expo Router account routes"]
    Screens["Profile presentation screens"]
    App["Profile application use cases"]
    Ports["Domain ports and contracts"]
    Auth["AuthProvider / auth application boundary"]
    AuthApi["Auth API adapter"]
    Privacy["Privacy gateway adapter"]
    Preferences["Account preferences storage adapter"]
    ExportApi["Personal-data export API adapter"]
    ExportFile["Personal-data file/share adapter"]
    ScanApp["Scan consent use cases"]
    Session["Secure session storage"]
  end

  subgraph Backend["Backend"]
    AuthController["AuthController"]
    UserService["UserService"]
    RightsService["Account data-rights service"]
    UserRepo["User repository"]
    ProductRepo["Owned-content repositories"]
    Database[("Product database")]
  end

  User --> Routes
  Routes --> Screens
  Screens --> App
  Screens --> Auth
  App --> Ports
  App --> ExportApi
  App --> ExportFile
  Auth --> AuthApi
  Auth --> Session
  App --> Privacy
  App --> Preferences
  Privacy --> ScanApp
  AuthApi --> AuthController
  AuthController --> UserService
  AuthController --> RightsService
  UserService --> UserRepo
  RightsService --> UserRepo
  RightsService --> ProductRepo
  UserRepo --> Database
  ProductRepo --> Database
```

## Dependency rules

- Presentation imports application contracts and UI primitives, never HTTP,
  storage, or backend DTOs.
- Application use cases depend on domain ports. They orchestrate workflows but
  do not know AsyncStorage, Expo Router, or TypeORM.
- Data adapters translate wire/storage formats into domain contracts.
- `PrivacyPreferencesGateway` delegates to Scan's consent owner; it must not
  reimplement consent persistence.
- `AuthProvider` owns session state and auth mutations. Profile screens call
  its public actions and do not duplicate token management.
- Backend controllers validate transport input and delegate business rules to
  services. Account deletion belongs to a dedicated data-rights service so the
  User CRUD service does not own anonymization policy.
- Dependencies point inward toward domain/application contracts. UI and HTTP
  details remain replaceable.
