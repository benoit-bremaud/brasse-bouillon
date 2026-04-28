# Changelog

## [0.1.9-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.8-alpha1...api-v0.1.9-alpha1) (2026-04-28)


### Chores

* **api:** Synchronize app versions

## [0.1.8-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.7-alpha1...api-v0.1.8-alpha1) (2026-04-28)


### Features

* **scan:** add La Goudale as a 4th demo bottle (real local bottle) ([8449ac1](https://github.com/benoit-bremaud/brasse-bouillon/commit/8449ac1314749abb6ec91822eeb80ef49d88e4f3))
* **scan:** add La Goudale as a 4th demo bottle for live testing ([#754](https://github.com/benoit-bremaud/brasse-bouillon/issues/754)) ([ae00270](https://github.com/benoit-bremaud/brasse-bouillon/commit/ae0027093d22ee913df3413c691fa85a0ede8015))


### Bug Fixes

* **scan:** update seed test assertions + prettier format for La Goudale (7 beers) ([a8fda37](https://github.com/benoit-bremaud/brasse-bouillon/commit/a8fda370caa5ee188d892b60a947ac4b53bbb6a0))

## [0.1.7-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.6-alpha1...api-v0.1.7-alpha1) (2026-04-28)


### Bug Fixes

* **scan:** correct invalid EAN-13 check digits in demo catalog (printed labels not recognized) ([#750](https://github.com/benoit-bremaud/brasse-bouillon/issues/750)) ([9c6e4fb](https://github.com/benoit-bremaud/brasse-bouillon/commit/9c6e4fb255be0890a16410be477782eac3cde70a))
* **scan:** correct invalid EAN-13 check digits in demo catalog + scan_catalog seed ([148a2b9](https://github.com/benoit-bremaud/brasse-bouillon/commit/148a2b99eb45b61f74018c7465b5c0af34415d09))
* **scan:** correct Rochefort 10 EAN check digit (115 not 112) ([1e85fb4](https://github.com/benoit-bremaud/brasse-bouillon/commit/1e85fb47b9e255b56bd88ebd6e7cd82a75bc6263))

## [0.1.6-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.5-alpha1...api-v0.1.6-alpha1) (2026-04-27)


### Features

* **api:** close Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) with 501 stubs + seed skeleton (parts 4/5 + 5/5) ([6e17eaa](https://github.com/benoit-bremaud/brasse-bouillon/commit/6e17eaa73002e2cf3c37e5a6fdc2c4f4209fe9bb))
* **api:** close Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) with 501 stubs + seed skeleton (parts 4/5 + 5/5) ([#725](https://github.com/benoit-bremaud/brasse-bouillon/issues/725)) ([b60b07b](https://github.com/benoit-bremaud/brasse-bouillon/commit/b60b07b1b954befa0421a37b2f166ec27b6ab5aa))
* **auth:** add forgot-password + reset-password endpoints ([#603](https://github.com/benoit-bremaud/brasse-bouillon/issues/603)a) ([5bb9445](https://github.com/benoit-bremaud/brasse-bouillon/commit/5bb94452f2d79d6ce4135076f93b93d983d8ab71))
* **auth:** add forgot-password + reset-password endpoints ([#603](https://github.com/benoit-bremaud/brasse-bouillon/issues/603)a) ([#727](https://github.com/benoit-bremaud/brasse-bouillon/issues/727)) ([cd40c4c](https://github.com/benoit-bremaud/brasse-bouillon/commit/cd40c4c00a29d6cfe8be0cab36e8cdea38974099))
* **recipes:** import-from-community endpoint with provenance (Issue [#601](https://github.com/benoit-bremaud/brasse-bouillon/issues/601)) ([4171cab](https://github.com/benoit-bremaud/brasse-bouillon/commit/4171cab6d40dc8731459d2c16c21c42705954ecb)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)
* **recipes:** import-from-community endpoint with provenance (Issue [#601](https://github.com/benoit-bremaud/brasse-bouillon/issues/601)) ([#742](https://github.com/benoit-bremaud/brasse-bouillon/issues/742)) ([ee8a601](https://github.com/benoit-bremaud/brasse-bouillon/commit/ee8a601f0f95615f2fe89e64e206a62498199c27)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)
* **scan:** add scan_catalog bridge fields for OFF cache (Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 3/5) ([c7ce800](https://github.com/benoit-bremaud/brasse-bouillon/commit/c7ce800a60be9563418cfb2e54cb1d22fe33d2d7))
* **scan:** add scan_catalog bridge fields for OFF cache (Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 3/5) ([#724](https://github.com/benoit-bremaud/brasse-bouillon/issues/724)) ([349e978](https://github.com/benoit-bremaud/brasse-bouillon/commit/349e978bf20dce448a65beb0bbe54c09337195c6))
* **scan:** OpenFoodFacts proxy + 1h cache (Issue [#696](https://github.com/benoit-bremaud/brasse-bouillon/issues/696)) ([d4dcc4a](https://github.com/benoit-bremaud/brasse-bouillon/commit/d4dcc4abede9c76bdd0d7c60fece5f1e66e789fb))
* **scan:** OpenFoodFacts proxy + 1h cache (Issue [#696](https://github.com/benoit-bremaud/brasse-bouillon/issues/696)) ([#729](https://github.com/benoit-bremaud/brasse-bouillon/issues/729)) ([dfaa2d6](https://github.com/benoit-bremaud/brasse-bouillon/commit/dfaa2d6283e87052369988ab20d3b530555e5170))


### Bug Fixes

* **auth:** address Codex P1 + Copilot review on PR [#727](https://github.com/benoit-bremaud/brasse-bouillon/issues/727) ([3c4b07f](https://github.com/benoit-bremaud/brasse-bouillon/commit/3c4b07fb8cb6163279a25dec4eb3198981776575))
* **beer-contribution:** mark barcode @ApiPropertyOptional in stub DTO ([280df70](https://github.com/benoit-bremaud/brasse-bouillon/commit/280df70dfada741635335bbf50bc95036e1685b2))
* **recipes:** add FK constraint on imported_from_recipe_id (Codex P2) ([8b210fd](https://github.com/benoit-bremaud/brasse-bouillon/commit/8b210fd365553522ad56b0b832a55dfa93af515e))
* **scan:** address Codex P1/P2 + Copilot review on PR [#729](https://github.com/benoit-bremaud/brasse-bouillon/issues/729) ([31580c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/31580c0e12f42aa18962d81dc18a08cdd93c6f4c))
* **scan:** address Copilot + Codex review on Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 3/5 ([6d5ac17](https://github.com/benoit-bremaud/brasse-bouillon/commit/6d5ac174f60e4605f51cc58da6a5b1c2ba1a1dfa))
* **security:** exclude password_reset fields from UserResponseDto ([a532bee](https://github.com/benoit-bremaud/brasse-bouillon/commit/a532bee3f75f94f9d6c129e766a43135de62bd91))
* **security:** exclude password_reset fields from UserResponseDto ([#728](https://github.com/benoit-bremaud/brasse-bouillon/issues/728)) ([e06d491](https://github.com/benoit-bremaud/brasse-bouillon/commit/e06d491b502c091b6b09b8ccbbe2b323c4f6d944))

## [0.1.5-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.4-alpha1...api-v0.1.5-alpha1) (2026-04-24)


### Features

* **recipe:** add quality fields for scan matching (Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 2/5) ([386e8b9](https://github.com/benoit-bremaud/brasse-bouillon/commit/386e8b957608d6dfd3332808cb6c94b360173c71))
* **recipe:** add quality fields for scan matching (Epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 2/5) ([#721](https://github.com/benoit-bremaud/brasse-bouillon/issues/721)) ([97729bf](https://github.com/benoit-bremaud/brasse-bouillon/commit/97729bf8d4eac5159023010c4437faf29c9b9f44))


### Bug Fixes

* **ci:** unblock SonarCloud + align @Index metadata on RecipeOrmEntity ([ea7c871](https://github.com/benoit-bremaud/brasse-bouillon/commit/ea7c871f9495dd7d9a5ad08f7f7919ff36ac3002))

## [0.1.4-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.3-alpha1...api-v0.1.4-alpha1) (2026-04-24)


### Chores

* **api:** Synchronize app versions

## [0.1.3-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.2-alpha1...api-v0.1.3-alpha1) (2026-04-24)


### Chores

* **api:** Synchronize app versions

## [0.1.2-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.1-alpha1...api-v0.1.2-alpha1) (2026-04-24)


### Chores

* **api:** Synchronize app versions

## [0.1.1-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.0.1...api-v0.1.1-alpha1) (2026-04-24)


### Bug Fixes

* **review:** address PR [#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554) review — version alignment, make setup idempotency, tool-version pinning ([d3f6e31](https://github.com/benoit-bremaud/brasse-bouillon/commit/d3f6e318d08822b18ec52258b3f559c2e7099f38))


### Refactors

* **monorepo:** rename packages — frontend to mobile-app, backend to api ([#502](https://github.com/benoit-bremaud/brasse-bouillon/issues/502)) ([4c4fb75](https://github.com/benoit-bremaud/brasse-bouillon/commit/4c4fb759669e104ee0a5aa3092eed4874fbe41cc)), closes [#501](https://github.com/benoit-bremaud/brasse-bouillon/issues/501)
* **monorepo:** rename packages/frontend to mobile-app and packages/backend to api ([88379e0](https://github.com/benoit-bremaud/brasse-bouillon/commit/88379e0cbd998c2e0c395e3037317530a91b1c62)), closes [#501](https://github.com/benoit-bremaud/brasse-bouillon/issues/501)


### Documentation

* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([7eff4c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/7eff4c027733680c5bafa8f912c76e02862e9a4f))
* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554)) ([3b3737b](https://github.com/benoit-bremaud/brasse-bouillon/commit/3b3737bdcc871ce2d02e77d5cd81a6b59e3b5fb2))
