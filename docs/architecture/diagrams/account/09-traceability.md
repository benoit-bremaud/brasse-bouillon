# Account/Profile traceability matrix

| Use case            | Mobile presentation                           | Application/domain                | Data/API                                         | Tests                                                                | Status                                              |
| ------------------- | --------------------------------------------- | --------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------- |
| View account hub    | `features/profile/presentation/ProfileScreen` | Brewer stats use case             | Existing batch/recipe sources                    | ProfileScreen, brewer-stats tests                                    | Implemented                                         |
| Edit identity       | `EditProfileScreen`                           | AuthProvider mutation             | `PATCH /auth/me`                                 | EditProfile, auth API, API controller/service tests                  | Implemented                                         |
| Change password     | `ChangePasswordScreen`                        | AuthProvider mutation             | `POST /auth/me/change-password`                  | ChangePassword, auth API, backend tests                              | Implemented                                         |
| View brewer level   | Profile stats card                            | `getBrewerLevel`                  | Existing batches/recipes                         | Brewer stats tests                                                   | Implemented                                         |
| Manage Scan privacy | `PrivacyPreferencesScreen`                    | Privacy use cases                 | Canonical append-only consent log                | Screen/use-case/gateway/Scan/consent tests                           | Implemented; history UI available                   |
| Theme preference    | `AccountPreferencesScreen`                    | Account preferences use case      | Local preference adapter                         | Use-case/storage/screen tests                                        | Persisted and applied across Profile/shared UI      |
| Units preference    | `AccountPreferencesScreen`                    | Account preferences use case      | Local preference adapter                         | Use-case/storage/screen/recipe tests                                 | Persisted; applied to representative recipe surface |
| Notification stubs  | `AccountPreferencesScreen`                    | Account preferences use case      | Local preference adapter                         | Use-case/storage/screen tests                                        | Implemented as local stubs                          |
| About/legal         | `AboutScreen`                                 | App-info and legal-link workflow  | Expo metadata + canonical website legal URLs + Ko-fi outbound support link (ADR-0028) | About/app-info/screen tests                                          | Implemented; legal links and support link available |
| Export data         | `ExportDataScreen`                            | `exportPersonalData`              | `GET /auth/me/export` + local file/share adapter | Screen, use-case, API/file adapter, backend service/controller tests | Implemented; versioned JSON export                  |
| Delete account      | `AccountDeletionScreen`                       | AuthProvider schedule/cancel flow | `POST/DELETE /auth/me/deletion` + hourly worker  | Mobile/API/service/controller tests                                  | Implemented; 30-day grace period                    |
| Consent history     | `ConsentHistoryScreen`                        | Consent list use case             | `brasse.consent.log`                             | Screen/use-case/storage tests                                        | Implemented; read-only                              |

## Completion rule

A row is complete only when its presentation behavior, application contract,
data owner, and happy/sad/edge tests exist. A UI-only stub must be labelled as
such in the product copy and must not imply a backend capability that is not
available. The export row now has an authenticated API projection, a local
merge step, a user-owned file adapter, and explicit failure/duplicate-submit
tests.
