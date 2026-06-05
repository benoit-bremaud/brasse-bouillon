# Changelog

## [0.1.13-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.12-alpha1...api-v0.1.13-alpha1) (2026-06-05)


### Features

* **api/batches:** Alert entity + table ([#605](https://github.com/benoit-bremaud/brasse-bouillon/issues/605) slice 3) ([#1115](https://github.com/benoit-bremaud/brasse-bouillon/issues/1115)) ([82648d9](https://github.com/benoit-bremaud/brasse-bouillon/commit/82648d9b0af987c10993d9a069ed46dd05f3d78e))
* **api/batches:** Measurement entity + table ([#605](https://github.com/benoit-bremaud/brasse-bouillon/issues/605) slice 1) ([#1112](https://github.com/benoit-bremaud/brasse-bouillon/issues/1112)) ([9d3da1a](https://github.com/benoit-bremaud/brasse-bouillon/commit/9d3da1a41f2116b103c5d91d18f7d8b535691947))
* **api/batches:** measurement entry + list endpoints ([#607](https://github.com/benoit-bremaud/brasse-bouillon/issues/607) slice A) ([#1116](https://github.com/benoit-bremaud/brasse-bouillon/issues/1116)) ([859c105](https://github.com/benoit-bremaud/brasse-bouillon/commit/859c10557842c2fdadecfb7f3adb82e996d7c8d1))
* **api/batches:** Observation entity + table ([#605](https://github.com/benoit-bremaud/brasse-bouillon/issues/605) slice 2) ([#1113](https://github.com/benoit-bremaud/brasse-bouillon/issues/1113)) ([5637b69](https://github.com/benoit-bremaud/brasse-bouillon/commit/5637b69a5e626a32309d920c0ba61e6f085baacf))
* **api/batches:** observation entry + list endpoints ([#607](https://github.com/benoit-bremaud/brasse-bouillon/issues/607) slice B) ([#1118](https://github.com/benoit-bremaud/brasse-bouillon/issues/1118)) ([697e17b](https://github.com/benoit-bremaud/brasse-bouillon/commit/697e17beffa96b68ba199c99fab1fc03c59dfcc2))
* **api/seeds:** seed ingredients + steps for scan-reachable public recipes ([#1170](https://github.com/benoit-bremaud/brasse-bouillon/issues/1170)) ([a3f4d8b](https://github.com/benoit-bremaud/brasse-bouillon/commit/a3f4d8b2dba9270b8c3b4e4dc02b25c82f62b1da))
* **api:** add migration 1794 for scan_count + last_scanned_at columns ([b470d60](https://github.com/benoit-bremaud/brasse-bouillon/commit/b470d60868b97ef5c75db820bedd382e6390a9cb)), closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929)
* **api:** add scan_count + last_scanned_at columns to ScanCatalogItem entity ([74ba57e](https://github.com/benoit-bremaud/brasse-bouillon/commit/74ba57ee8775105ce9260232e592b87c51d615b2)), closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929)
* **api:** feedback ingestion endpoint ([#1047](https://github.com/benoit-bremaud/brasse-bouillon/issues/1047)) ([fbf7470](https://github.com/benoit-bremaud/brasse-bouillon/commit/fbf7470bb3503710e3ae2a6df38ffcb24b4e031f))
* **api:** increment scan_count on every successful lookupByBarcode ([5d754d3](https://github.com/benoit-bremaud/brasse-bouillon/commit/5d754d37ebfd278e58124505a92685b9b26699bc)), closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929)
* **api:** track scan count per catalog item ([#958](https://github.com/benoit-bremaud/brasse-bouillon/issues/958)) ([093b2f8](https://github.com/benoit-bremaud/brasse-bouillon/commit/093b2f81c2257439a8b1a21cc3253ff2ab63b7c3)), closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929)
* **auth:** simplify signup form to email + password + bigger mascot + KISS auth screen (Issue [#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) ([096f7fa](https://github.com/benoit-bremaud/brasse-bouillon/commit/096f7fa9d7dbc5341cc1128ee057385554f8d8fc))
* **auth:** Sprint A polish — simplified signup ([#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) + Google cosmetic button ([#765](https://github.com/benoit-bremaud/brasse-bouillon/issues/765)) + bigger mascot ([#790](https://github.com/benoit-bremaud/brasse-bouillon/issues/790)) ([c64805f](https://github.com/benoit-bremaud/brasse-bouillon/commit/c64805f71db8a1e262949b09a299ab1c1273fcde))
* **catalog/distributor:** add distributors + 5 M:N junctions per catalogue ([0014c5c](https://github.com/benoit-bremaud/brasse-bouillon/commit/0014c5c207b9dd2d082292da3bc34b9693ce569e))
* **catalog/distributor:** add distributors + 5 M:N junctions per catalogue ([#901](https://github.com/benoit-bremaud/brasse-bouillon/issues/901)) ([#908](https://github.com/benoit-bremaud/brasse-bouillon/issues/908)) ([ef0494f](https://github.com/benoit-bremaud/brasse-bouillon/commit/ef0494f63b888bc6fa55f3cb94d236e42918d5e3))
* **catalog/equipment:** add equipment templates reference catalogue ([4917b3c](https://github.com/benoit-bremaud/brasse-bouillon/commit/4917b3c13452d14eaaedfab652b8482b180a2089))
* **catalog/equipment:** add equipment templates reference catalogue ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#898](https://github.com/benoit-bremaud/brasse-bouillon/issues/898)) ([8934ade](https://github.com/benoit-bremaud/brasse-bouillon/commit/8934ade707b262e5432c61585d97b4c0335276ad))
* **catalog/fermentable:** add fermentables reference catalogue table ([cce52c9](https://github.com/benoit-bremaud/brasse-bouillon/commit/cce52c9ac542d5b79e1cb84534e871a9c6462fba))
* **catalog/fermentable:** add fermentables reference catalogue table ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#889](https://github.com/benoit-bremaud/brasse-bouillon/issues/889)) ([f137030](https://github.com/benoit-bremaud/brasse-bouillon/commit/f137030132ef8db22f648f3a7019205a2dc43ec5))
* **catalog/hop:** add hops reference catalogue table ([cb48745](https://github.com/benoit-bremaud/brasse-bouillon/commit/cb48745cc7d8e9f4eab9072ce2d23116ab3c6ebd))
* **catalog/hop:** add hops reference catalogue table ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#888](https://github.com/benoit-bremaud/brasse-bouillon/issues/888)) ([6c70eb3](https://github.com/benoit-bremaud/brasse-bouillon/commit/6c70eb39985fb89766880617439c519a47ce33b6))
* **catalog/mash:** add mash profiles + steps reference catalogue (1:N) ([e9a1979](https://github.com/benoit-bremaud/brasse-bouillon/commit/e9a1979cc247f6a5b53a1e7ea418f5055fa58d51))
* **catalog/mash:** add mash profiles + steps reference catalogue (1:N) — completes Phase 2 ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#893](https://github.com/benoit-bremaud/brasse-bouillon/issues/893)) ([cf3b1c9](https://github.com/benoit-bremaud/brasse-bouillon/commit/cf3b1c9f785fd869afa3cc2a91e1baec26ff5cdf))
* **catalog/misc:** add miscellaneous ingredients reference catalogue ([3a9a563](https://github.com/benoit-bremaud/brasse-bouillon/commit/3a9a5634663cb8132da627cd85822d5fd0d9b287))
* **catalog/misc:** add miscellaneous ingredients reference catalogue ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#899](https://github.com/benoit-bremaud/brasse-bouillon/issues/899)) ([37f993f](https://github.com/benoit-bremaud/brasse-bouillon/commit/37f993f3dd8d789f2e135cf8fe15712c3d767d5f)), closes [#869](https://github.com/benoit-bremaud/brasse-bouillon/issues/869)
* **catalog/producer:** add producers reference table + producer_id FK on 5 catalogues ([f74220a](https://github.com/benoit-bremaud/brasse-bouillon/commit/f74220a5cb83c3cabcd3c389999f0122b7ae6efd))
* **catalog/producer:** add producers reference table + producer_id FK on 5 catalogues ([#900](https://github.com/benoit-bremaud/brasse-bouillon/issues/900)) ([#902](https://github.com/benoit-bremaud/brasse-bouillon/issues/902)) ([977610c](https://github.com/benoit-bremaud/brasse-bouillon/commit/977610c9e1bdd20202f9fab37e853c0a95264d9c))
* **catalog/style:** add BJCP styles reference catalogue table ([a45d446](https://github.com/benoit-bremaud/brasse-bouillon/commit/a45d446da9cef103b2c0c9d45177c426b537019a))
* **catalog/style:** add BJCP styles reference catalogue table — opens Phase 2 ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#891](https://github.com/benoit-bremaud/brasse-bouillon/issues/891)) ([b9b034f](https://github.com/benoit-bremaud/brasse-bouillon/commit/b9b034f7cb172e997ddcbf4a6ce9fbd4438a19c1))
* **catalog/water:** add brewing water profiles reference catalogue ([8022168](https://github.com/benoit-bremaud/brasse-bouillon/commit/8022168ad7085ce2c4f1d3c156b11739d1a9c796))
* **catalog/water:** add brewing water profiles reference catalogue ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#894](https://github.com/benoit-bremaud/brasse-bouillon/issues/894)) ([5fe171b](https://github.com/benoit-bremaud/brasse-bouillon/commit/5fe171ba9d4732fcbfbe033fbaa03f2ea137ef12))
* **catalog/yeast:** add yeasts reference catalogue table ([5fba680](https://github.com/benoit-bremaud/brasse-bouillon/commit/5fba680a7539182669c14c5b60c72e697a5162ea))
* **catalog/yeast:** add yeasts reference catalogue table — completes Phase 1 ([#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708)) ([#890](https://github.com/benoit-bremaud/brasse-bouillon/issues/890)) ([e9e8d5c](https://github.com/benoit-bremaud/brasse-bouillon/commit/e9e8d5c86abdcd40f428eac548a94e79ca68f67b))
* **catalog:** Recipe Catalog mini — KISS scope (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([9e3ed02](https://github.com/benoit-bremaud/brasse-bouillon/commit/9e3ed024ce0196168905d9e415ac3788fdd1d417))
* **catalog:** Recipe Catalog mini — KISS scope (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845)) ([3d8dbff](https://github.com/benoit-bremaud/brasse-bouillon/commit/3d8dbff26280e2a4946d931317265a4efae73e75))
* **recipes/api:** allow reading ingredients of public recipes ([#1167](https://github.com/benoit-bremaud/brasse-bouillon/issues/1167)) ([f0cb399](https://github.com/benoit-bremaud/brasse-bouillon/commit/f0cb39987e455e11d28fa5de78bef7cd5aa15944))
* **recipes:** match recipes by characteristics, not a scan-catalog id ([#1190](https://github.com/benoit-bremaud/brasse-bouillon/issues/1190)) ([e1d1764](https://github.com/benoit-bremaud/brasse-bouillon/commit/e1d1764580573e1a1df4de001db823db6a3fa7d4))
* **scan:** complete demo seed to 9 beers — Heineken + Cervoise Lancelot (Topic B) ([#791](https://github.com/benoit-bremaud/brasse-bouillon/issues/791)) ([cf8f688](https://github.com/benoit-bremaud/brasse-bouillon/commit/cf8f68886a1be08f50368943f2a41e32a389ca23))
* **scan:** complete demo seed to 9 beers (Heineken + Cervoise Lancelot) ([8379f37](https://github.com/benoit-bremaud/brasse-bouillon/commit/8379f37b71972191a2fa2c762ed0cb687d79e0cc))
* **scan:** full matching algorithm — bitterness + color + brew_count + recency + low_confidence ([#699](https://github.com/benoit-bremaud/brasse-bouillon/issues/699)) ([#792](https://github.com/benoit-bremaud/brasse-bouillon/issues/792)) ([ab99d1f](https://github.com/benoit-bremaud/brasse-bouillon/commit/ab99d1f21f8ca489af30f4945774d6e5650ca40a))
* **scan:** full matching algorithm — bitterness + color + brew_count + recency + low_confidence (Issue [#699](https://github.com/benoit-bremaud/brasse-bouillon/issues/699)) ([0a4c278](https://github.com/benoit-bremaud/brasse-bouillon/commit/0a4c278208be299c04ed96620e145c6ad2bf8645))
* **scan:** not-a-beer detection — filter OFF by category + dedicated UI (Issue [#798](https://github.com/benoit-bremaud/brasse-bouillon/issues/798)) ([c8cb456](https://github.com/benoit-bremaud/brasse-bouillon/commit/c8cb456cb306b269d7be7708e14bb3e7786f2c29))
* **scan:** not-a-beer detection — filter OFF by category + dedicated UI (Issue [#798](https://github.com/benoit-bremaud/brasse-bouillon/issues/798)) ([#800](https://github.com/benoit-bremaud/brasse-bouillon/issues/800)) ([8cacaf0](https://github.com/benoit-bremaud/brasse-bouillon/commit/8cacaf0841c4a570168db78b421af40d01716801))
* **scan:** score-based recipe matching MVP — style + ABV + avg_rating (Issue [#699](https://github.com/benoit-bremaud/brasse-bouillon/issues/699)) ([0ed561a](https://github.com/benoit-bremaud/brasse-bouillon/commit/0ed561af0dc3186283c0fb9aa483b387ac65d8e0))
* **scan:** score-based recipe matching MVP — style + ABV + avg_rating (Issue [#699](https://github.com/benoit-bremaud/brasse-bouillon/issues/699)) ([#773](https://github.com/benoit-bremaud/brasse-bouillon/issues/773)) ([5c572de](https://github.com/benoit-bremaud/brasse-bouillon/commit/5c572de656e37eb275daef093a1192f0962c4c4e))
* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([86f6dc0](https://github.com/benoit-bremaud/brasse-bouillon/commit/86f6dc0460c209854f816e3f3f0f40dda4615285))
* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([#768](https://github.com/benoit-bremaud/brasse-bouillon/issues/768)) ([f2890cc](https://github.com/benoit-bremaud/brasse-bouillon/commit/f2890cc1aa8eca0451411f07eb0f1bc45854a0ba))
* **seed:** add BrewDog DIY Dog as official recipe for Punk IPA ([#911](https://github.com/benoit-bremaud/brasse-bouillon/issues/911)) ([#912](https://github.com/benoit-bremaud/brasse-bouillon/issues/912)) ([5313a9f](https://github.com/benoit-bremaud/brasse-bouillon/commit/5313a9f68a1bafe2371191cbb5775e559c528de5))
* **seed:** add BrewDog DIY Dog as official recipe for Punk IPA (Issue [#911](https://github.com/benoit-bremaud/brasse-bouillon/issues/911)) ([2c647b4](https://github.com/benoit-bremaud/brasse-bouillon/commit/2c647b4c53b60b19a3ab6646bfb9b8a1bfbf74e4))
* **seed:** add BrewDog DIY Dog batch 2 — Hop Rocker, Trashy Blonde, Storm, Edge, The Physics (6/25) ([f0741da](https://github.com/benoit-bremaud/brasse-bouillon/commit/f0741da1ad151e5c43d1cc4fa2375226560aeff1))
* **seed:** BrewDog DIY Dog batch 2 — Hop Rocker, Trashy Blonde, Storm, Edge, The Physics (6/25) ([#922](https://github.com/benoit-bremaud/brasse-bouillon/issues/922)) ([3e8faea](https://github.com/benoit-bremaud/brasse-bouillon/commit/3e8faea69056e9b90cfa4fc840ccfa6591bcf206))
* **seed:** pre-seed Punk IPA brassin demo + 7 brewing-day steps (Issue [#782](https://github.com/benoit-bremaud/brasse-bouillon/issues/782) minimal+) ([034cde4](https://github.com/benoit-bremaud/brasse-bouillon/commit/034cde4972d13440389337810854a0f64892677e))
* **seed:** pre-seed Punk IPA brassin demo + 7 brewing-day steps (Issue [#782](https://github.com/benoit-bremaud/brasse-bouillon/issues/782) minimal+) ([#815](https://github.com/benoit-bremaud/brasse-bouillon/issues/815)) ([0a5af5d](https://github.com/benoit-bremaud/brasse-bouillon/commit/0a5af5dd032311f1d6a6212d7c45e35a205c4120))
* **seed:** scaffold BrewDog DIY Dog public-recipes seed + Punk IPA 2007-2010 (1/25) ([02e5007](https://github.com/benoit-bremaud/brasse-bouillon/commit/02e50076ba42e42fe94d1be6bc35e31e7534aed6))
* **seed:** scaffold BrewDog DIY Dog seed + Punk IPA 2007-2010 (1/25) ([#921](https://github.com/benoit-bremaud/brasse-bouillon/issues/921)) ([34c054f](https://github.com/benoit-bremaud/brasse-bouillon/commit/34c054f0f260505818de74ecf080c389f1e87bb0))


### Bug Fixes

* **api:** address Copilot review on PR [#933](https://github.com/benoit-bremaud/brasse-bouillon/issues/933) ([ead8c17](https://github.com/benoit-bremaud/brasse-bouillon/commit/ead8c17a0d295710fa8db5213e9193e40661fb13))
* **api:** address review comments on Docker setup ([d4da220](https://github.com/benoit-bremaud/brasse-bouillon/commit/d4da22057e42f3576e9617c88c7522439350b6b1))
* **api:** decouple host and container port in docker-compose ([90db2d7](https://github.com/benoit-bremaud/brasse-bouillon/commit/90db2d78004404a1e0fdf2724f4a6fabb3ec9c22))
* **api:** guard system-user seed against email/username collisions ([0bdf058](https://github.com/benoit-bremaud/brasse-bouillon/commit/0bdf058c4e2d697adf451116100b1efbdac774ca))
* **api:** make scan_count increment best-effort in lookupByBarcode ([0e20698](https://github.com/benoit-bremaud/brasse-bouillon/commit/0e20698b8fbf30080eea4990d2f6930265c68d9f)), closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929)
* **api:** preserve structured fields through HttpExceptionFilter (Codex P1 [#800](https://github.com/benoit-bremaud/brasse-bouillon/issues/800)) ([8058902](https://github.com/benoit-bremaud/brasse-bouillon/commit/80589020b6155616ce314d027aa2c712350db1ff))
* **api:** use monorepo root as Docker build context ([f9ba106](https://github.com/benoit-bremaud/brasse-bouillon/commit/f9ba1067c49e32237f9fc53920061e66433e0986))
* **auth:** preserve fallback entropy when base is long (Codex P2 PR [#790](https://github.com/benoit-bremaud/brasse-bouillon/issues/790)) ([9e1176a](https://github.com/benoit-bremaud/brasse-bouillon/commit/9e1176a6e2ff0820dd628e744a9f3646cf72f884))
* **auth:** recheck uniqueness on username fallback path (Codex P2 PR [#790](https://github.com/benoit-bremaud/brasse-bouillon/issues/790)) ([bc3206f](https://github.com/benoit-bremaud/brasse-bouillon/commit/bc3206fac74ad4eed35db5849d26fcea2a4f98a2))
* **catalog/hop:** address PR [#888](https://github.com/benoit-bremaud/brasse-bouillon/issues/888) review (boot crash + validation gaps) ([784c941](https://github.com/benoit-bremaud/brasse-bouillon/commit/784c94127bf15f14013f2071dcfeeccec04c9933))
* **catalog/hop:** prettier formatting on getRepositoryToken call (CI lint) ([dcc4d34](https://github.com/benoit-bremaud/brasse-bouillon/commit/dcc4d343d59dbad53b6487a902e264360577f6d7))
* **catalog/mash:** address PR [#893](https://github.com/benoit-bremaud/brasse-bouillon/issues/893) review (summary DTO + indexed unique + numeric sort) ([35c23c6](https://github.com/benoit-bremaud/brasse-bouillon/commit/35c23c6506ba98a2e4f3f6004978c9bd1b76bb5f))
* **catalog/misc:** address Copilot review on PR [#899](https://github.com/benoit-bremaud/brasse-bouillon/issues/899) ([0553a7c](https://github.com/benoit-bremaud/brasse-bouillon/commit/0553a7c7dc3c6dd66ad63bfd27fc0429e86895bf))
* **catalog/producer:** address Copilot review on PR [#902](https://github.com/benoit-bremaud/brasse-bouillon/issues/902) (15 comments) ([2d42349](https://github.com/benoit-bremaud/brasse-bouillon/commit/2d42349847920baa2944c281fed7ccd0bddd6cad))
* **catalog/producer:** drop producer_id columns in down() to avoid dangling FK ([9df4541](https://github.com/benoit-bremaud/brasse-bouillon/commit/9df4541446ba7b608356e1c4adcc97bf4b0e77b0))
* **catalog/style:** address PR [#891](https://github.com/benoit-bremaud/brasse-bouillon/issues/891) review (composite UNIQUE + American Wheat + style_guide enum) ([2ef616d](https://github.com/benoit-bremaud/brasse-bouillon/commit/2ef616d63f416d34d7b4df39aa50be7db5e4b711))
* **catalog/water:** address PR [#894](https://github.com/benoit-bremaud/brasse-bouillon/issues/894) review (entity unique + class rename + error message) ([9ad653f](https://github.com/benoit-bremaud/brasse-bouillon/commit/9ad653f19183d94d361bd2162050cc287b96b814))
* **catalog/yeast:** address PR [#890](https://github.com/benoit-bremaud/brasse-bouillon/issues/890) review (Witbier classification + form index) ([fe1bf21](https://github.com/benoit-bremaud/brasse-bouillon/commit/fe1bf21712e1168e1ddde1df126427b69a6c5820))
* **catalog/yeast:** make migration 1792 self-sufficient (Codex P1 catch) ([9ac135c](https://github.com/benoit-bremaud/brasse-bouillon/commit/9ac135c57b899c116df39bfdcc07992f743654af))
* **catalog/yeast:** make seed self-bootstrap producers (Copilot catch) ([66233f0](https://github.com/benoit-bremaud/brasse-bouillon/commit/66233f011e97b8c38a553d1006333d7178639efc))
* **catalog:** address Codex P1 + Sonar QG (coverage + duplication) on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([b594567](https://github.com/benoit-bremaud/brasse-bouillon/commit/b5945671abe98ef463206b79fe5183782a58b738))
* **catalog:** address Copilot review on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) — stats mapping bug + privacy guard + route-ordering e2e + entry-point tests (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([6b4d7e7](https://github.com/benoit-bremaud/brasse-bouillon/commit/6b4d7e72e6804e1b90251a50244e7b72461075ee))
* **catalog:** address Copilot round-3 + lint + Sonar QG on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([4342d35](https://github.com/benoit-bremaud/brasse-bouillon/commit/4342d35c4393d67e9e73b071a3152acd8358839d))
* make API and beer-encyclopedia reachable from Expo Go via Tailscale/LAN ([e07479b](https://github.com/benoit-bremaud/brasse-bouillon/commit/e07479bcc7308676fdff77332b19f9a1bb1bdab9))
* **recipes:** style-gate the official-recipe shortcut (Leffe Blonde → Punk IPA) ([#1194](https://github.com/benoit-bremaud/brasse-bouillon/issues/1194)) ([1844815](https://github.com/benoit-bremaud/brasse-bouillon/commit/184481578fda0ae75557b8199fa92e4c402ca7d5))
* **scan:** address SonarCloud Quality Gate failures on PR [#768](https://github.com/benoit-bremaud/brasse-bouillon/issues/768) ([47c4025](https://github.com/benoit-bremaud/brasse-bouillon/commit/47c402599a44b011521b705d49638244f3183612))
* **scan:** clear legacy is_official + add deterministic ranking tie-breaker (Codex P1+P2 [#773](https://github.com/benoit-bremaud/brasse-bouillon/issues/773)) ([064c447](https://github.com/benoit-bremaud/brasse-bouillon/commit/064c447057fe2423e6c3aa39c6b5787f7e0805c8))
* **scan:** correct Cervoise Lancelot EAN-13 check digit (Codex P1 PR [#791](https://github.com/benoit-bremaud/brasse-bouillon/issues/791)) ([e610317](https://github.com/benoit-bremaud/brasse-bouillon/commit/e610317b96566bd9b0acda416fd315de4de932c6))
* **scan:** correct invalid EAN-13 checksums for Karmeliet, Westmalle, Duvel ([4690ceb](https://github.com/benoit-bremaud/brasse-bouillon/commit/4690cebc15be5538740de957f057c26674c9544b)), closes [#807](https://github.com/benoit-bremaud/brasse-bouillon/issues/807)
* **scan:** correct invalid EAN-13 checksums for Karmeliet, Westmalle, Duvel ([#920](https://github.com/benoit-bremaud/brasse-bouillon/issues/920)) ([f746bdd](https://github.com/benoit-bremaud/brasse-bouillon/commit/f746bdde632562b7a5c460fe7bba9be1f6172ac3)), closes [#807](https://github.com/benoit-bremaud/brasse-bouillon/issues/807)
* **scan:** drop is_official tag from public-recipes seed (Codex P1 [#773](https://github.com/benoit-bremaud/brasse-bouillon/issues/773)) ([e9cde9f](https://github.com/benoit-bremaud/brasse-bouillon/commit/e9cde9f4b2f8131205c80cd7abdf3a47000fa5dd))
* **scan:** low_confidence ignores official shortcut for honest threshold (Codex P1 PR [#792](https://github.com/benoit-bremaud/brasse-bouillon/issues/792)) ([455f3fd](https://github.com/benoit-bremaud/brasse-bouillon/commit/455f3fd1d64f77b673c1f70dec57c02c730309ed))
* **seed:** address PR [#921](https://github.com/benoit-bremaud/brasse-bouillon/issues/921) review — brew_count default + per-recipe source URL in provenance + dedupe via shared upsert helper ([258ceec](https://github.com/benoit-bremaud/brasse-bouillon/commit/258ceec78e018afccacb0bd792415fa4c07768d0))
* **seed:** address PR [#922](https://github.com/benoit-bremaud/brasse-bouillon/issues/922) review — late-boil hop timings + Sonar duplication via builder helpers ([1acd0f9](https://github.com/benoit-bremaud/brasse-bouillon/commit/1acd0f9df89f958a5f5d33c99bb89531038565e7))
* **seed:** scope DIY Dog official flag to mobile demo + add DE 0,33L EAN alias ([2e540ea](https://github.com/benoit-bremaud/brasse-bouillon/commit/2e540ea1690fa37e91496917c8c7ded46a07cfd7))
* **seeds:** widen batch window so all seeded steps fit inside (Codex P1 [#815](https://github.com/benoit-bremaud/brasse-bouillon/issues/815)) ([879a703](https://github.com/benoit-bremaud/brasse-bouillon/commit/879a7031a59dbcc15775ce1a1aa080064b56525e))


### Refactors

* **api:** extract RECIPE_ORM_ENTITIES + buildRecipeTestingTypeOrm to dedupe spec setup (PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) / Sonar QG) ([28a1427](https://github.com/benoit-bremaud/brasse-bouillon/commit/28a1427372fc045f6a21996ba9c66690b1a8516d))
* **catalog/yeast:** drop legacy laboratory + rename product_id to product_code ([a02ead7](https://github.com/benoit-bremaud/brasse-bouillon/commit/a02ead7287ffc0cf4676d07f5935a52c782938a9))
* **catalog/yeast:** drop legacy laboratory + rename product_id to product_code ([#904](https://github.com/benoit-bremaud/brasse-bouillon/issues/904)) ([#905](https://github.com/benoit-bremaud/brasse-bouillon/issues/905)) ([2aec87b](https://github.com/benoit-bremaud/brasse-bouillon/commit/2aec87bfeef6ee4aefbff501c26677700ce8d80d))
* **migration:** collapse 7 ALTER TABLE statements into iteration over COLUMNS array (SonarCloud [#815](https://github.com/benoit-bremaud/brasse-bouillon/issues/815)) ([a291b86](https://github.com/benoit-bremaud/brasse-bouillon/commit/a291b86fd643fe6cd7569ef31ba75dc970f8a1ed))
* **seed-test-utils:** extract shared catalogue-seeder behaviours helper ([c89a3ea](https://github.com/benoit-bremaud/brasse-bouillon/commit/c89a3eac4e5554cf2a892fb16c2bfc4a156eddab))
* **seeds:** collapse runSeed helper in demo-batch spec to eliminate cast triplet duplication ([4e00a2f](https://github.com/benoit-bremaud/brasse-bouillon/commit/4e00a2f371b63afe4bc37749cb68889ead9e7f90))
* **seeds:** extract idempotentUpsertById helper to fully eliminate duplication (SonarCloud [#815](https://github.com/benoit-bremaud/brasse-bouillon/issues/815)) ([85cd539](https://github.com/benoit-bremaud/brasse-bouillon/commit/85cd53928ef7cd7ff140fbf588bba5de07fdef11))
* **seeds:** extract shared RepoMock helper to eliminate duplication (SonarCloud [#815](https://github.com/benoit-bremaud/brasse-bouillon/issues/815)) ([e0e4302](https://github.com/benoit-bremaud/brasse-bouillon/commit/e0e4302be2579851c92d9aa533c4b547d1f69324))


### Documentation

* **catalog/style:** explain what 'BJCP' stands for (Beer Judge Certification Program) ([d662119](https://github.com/benoit-bremaud/brasse-bouillon/commit/d662119fec882f5e8344a831fbd365098fa2feaa))
* **deploy:** address Copilot round-1 review on PR [#959](https://github.com/benoit-bremaud/brasse-bouillon/issues/959) ([090bf3e](https://github.com/benoit-bremaud/brasse-bouillon/commit/090bf3e3eab4062b0faf7fce656c69eb888ac837))
* **deploy:** record API first production deploy on Fly.io ([#959](https://github.com/benoit-bremaud/brasse-bouillon/issues/959)) ([2b27967](https://github.com/benoit-bremaud/brasse-bouillon/commit/2b279675d7245a9329ff22c9937cf1e6bcbf9604))
* **deploy:** record API first production deploy on Fly.io (2026-05-07) ([fe24868](https://github.com/benoit-bremaud/brasse-bouillon/commit/fe24868831ad354b251be40fc68e0f70c8dfc5dc))
* **env:** document the .env workflow in every package README ([b159f29](https://github.com/benoit-bremaud/brasse-bouillon/commit/b159f2921698e85f8a20be59583337baaeb460e4))
* **equipment-catalog:** address Copilot review on PR [#898](https://github.com/benoit-bremaud/brasse-bouillon/issues/898) ([2b42d02](https://github.com/benoit-bremaud/brasse-bouillon/commit/2b42d02e42f3994b2c71e7eca8e5d9b40737b9e9))
* **ydays:** prepare 27 mai soutenance — VitePress site + content (replaces [#578](https://github.com/benoit-bremaud/brasse-bouillon/issues/578)) ([#957](https://github.com/benoit-bremaud/brasse-bouillon/issues/957)) ([577861d](https://github.com/benoit-bremaud/brasse-bouillon/commit/577861dfc47a04d2f0af3a198ecb948ddcdacc9a))
* **ydays:** prepare 27 mai soutenance — VitePress site + content + supporting updates ([7015904](https://github.com/benoit-bremaud/brasse-bouillon/commit/7015904c6482b9979570d1dd9b6a7f71d9715a1d))

## [0.1.12-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.11-alpha1...api-v0.1.12-alpha1) (2026-04-28)


### Features

* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([86f6dc0](https://github.com/benoit-bremaud/brasse-bouillon/commit/86f6dc0460c209854f816e3f3f0f40dda4615285))
* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([#768](https://github.com/benoit-bremaud/brasse-bouillon/issues/768)) ([f2890cc](https://github.com/benoit-bremaud/brasse-bouillon/commit/f2890cc1aa8eca0451411f07eb0f1bc45854a0ba))


### Bug Fixes

* **api:** guard system-user seed against email/username collisions ([0bdf058](https://github.com/benoit-bremaud/brasse-bouillon/commit/0bdf058c4e2d697adf451116100b1efbdac774ca))
* **scan:** address SonarCloud Quality Gate failures on PR [#768](https://github.com/benoit-bremaud/brasse-bouillon/issues/768) ([47c4025](https://github.com/benoit-bremaud/brasse-bouillon/commit/47c402599a44b011521b705d49638244f3183612))

## [0.1.11-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.10-alpha1...api-v0.1.11-alpha1) (2026-04-28)


### Chores

* **api:** Synchronize app versions

## [0.1.10-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/api-v0.1.9-alpha1...api-v0.1.10-alpha1) (2026-04-28)


### Chores

* **api:** Synchronize app versions

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
