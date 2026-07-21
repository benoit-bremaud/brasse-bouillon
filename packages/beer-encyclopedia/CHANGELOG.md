# Changelog

## [0.2.5](https://github.com/benoit-bremaud/brasse-bouillon/compare/encyclopedia-v0.2.4...encyclopedia-v0.2.5) (2026-07-20)


### Features

* **encyclopedia:** Beer IBU/SRM as min-max intervals + Style.family (BJCP) ([#1204](https://github.com/benoit-bremaud/brasse-bouillon/issues/1204)) ([00f5d0e](https://github.com/benoit-bremaud/brasse-bouillon/commit/00f5d0e1db3ca6df797976f3bb5df788b29b1379))
* **encyclopedia:** gate the public catalogue on the published status (ADR-0015 D1) ([#1226](https://github.com/benoit-bremaud/brasse-bouillon/issues/1226)) ([d542637](https://github.com/benoit-bremaud/brasse-bouillon/commit/d542637fd5387e834c4aac62289c7ed8861db00d))
* **encyclopedia:** resolve brewery_name / style_name on the beer read & write endpoints ([#1222](https://github.com/benoit-bremaud/brasse-bouillon/issues/1222)) ([1a761e7](https://github.com/benoit-bremaud/brasse-bouillon/commit/1a761e72af9e515b18b77ce25aea9d36cc1cfe28))
* **encyclopedia:** seed curated beer corpus — 39 breweries, 44 beers, styles, ingredients ([#1207](https://github.com/benoit-bremaud/brasse-bouillon/issues/1207)) ([2066740](https://github.com/benoit-bremaud/brasse-bouillon/commit/2066740f4976e5165a530396a9883ff8ce00c435))


### Bug Fixes

* **beer-encyclopedia/ml:** correct ABV parsing, name fallback, and dead IBU weight ([#1287](https://github.com/benoit-bremaud/brasse-bouillon/issues/1287)) ([5a2cada](https://github.com/benoit-bremaud/brasse-bouillon/commit/5a2cadac31a03dee0fc13989bb6b1d395f8fad40))
* **encyclopedia:** assert exposed routes via OpenAPI, not app.routes (FastAPI 0.137) ([#1223](https://github.com/benoit-bremaud/brasse-bouillon/issues/1223)) ([051aa07](https://github.com/benoit-bremaud/brasse-bouillon/commit/051aa077135310ced4947a56794d8535c8ec5587))


### Documentation

* **config:** align Claude config with reality (ADR list, encyclopedia stack, decisions index) ([#1239](https://github.com/benoit-bremaud/brasse-bouillon/issues/1239)) ([ab51f4a](https://github.com/benoit-bremaud/brasse-bouillon/commit/ab51f4aa8f2ecfa15d7d3b4b4b62afa58f4f32cc))
* **mobile-catalog:** UML conception study for the mobile beer catalogue (UC1/2/3) ([#1213](https://github.com/benoit-bremaud/brasse-bouillon/issues/1213)) ([79138b0](https://github.com/benoit-bremaud/brasse-bouillon/commit/79138b0231ef3fce9b243e99f5ec68088952bc18)), closes [#1128](https://github.com/benoit-bremaud/brasse-bouillon/issues/1128)

## [0.2.4](https://github.com/benoit-bremaud/brasse-bouillon/compare/encyclopedia-v0.2.3...encyclopedia-v0.2.4) (2026-06-05)


### Features

* **beer-encyclopedia:** add French legal denomination reference ([#841](https://github.com/benoit-bremaud/brasse-bouillon/issues/841)) ([b39a1dc](https://github.com/benoit-bremaud/brasse-bouillon/commit/b39a1dc7ecdfb752c3cad32e1f4cfa9f2296613a))
* **beer-encyclopedia:** add French legal denomination reference and beer regulatory fields ([ae46426](https://github.com/benoit-bremaud/brasse-bouillon/commit/ae4642686f5ba2b2959e1e4451de82eda414857d))
* **beer-encyclopedia:** add Open Food Facts importer + POST /beers/import-by-ean ([be7c7a3](https://github.com/benoit-bremaud/brasse-bouillon/commit/be7c7a35de83bcb46fc21aa35e4ba37f97a7a723))
* **beer-encyclopedia:** add Open Food Facts importer + POST /beers/import-by-ean ([#847](https://github.com/benoit-bremaud/brasse-bouillon/issues/847)) ([5ad8b92](https://github.com/benoit-bremaud/brasse-bouillon/commit/5ad8b92d5c922190e9e4d89ed0a4ba420ab625ea))
* **encyclopedia:** extract style + description from the OpenFoodFacts response ([#1182](https://github.com/benoit-bremaud/brasse-bouillon/issues/1182)) ([1d8d7bb](https://github.com/benoit-bremaud/brasse-bouillon/commit/1d8d7bb26a43103d4eafed96a861602d9f6a6ff1))
* **scan:** surface brewery + style names on the scanned beer fiche ([#1185](https://github.com/benoit-bremaud/brasse-bouillon/issues/1185)) ([1a312eb](https://github.com/benoit-bremaud/brasse-bouillon/commit/1a312eb212004bef6f967000553d3c6375b753ea))


### Bug Fixes

* **beer-encyclopedia:** address Copilot review on PR [#847](https://github.com/benoit-bremaud/brasse-bouillon/issues/847) ([f4834b2](https://github.com/benoit-bremaud/brasse-bouillon/commit/f4834b2dfb2022339be6ff9b072eb02db3acdbab))
* **beer-encyclopedia:** address Copilot review on PR [#861](https://github.com/benoit-bremaud/brasse-bouillon/issues/861) (docstring clarity + paragraph=False regression tests) ([221c9be](https://github.com/benoit-bremaud/brasse-bouillon/commit/221c9be81fd30dce56339b598405965c8b271bc8))
* **beer-encyclopedia:** DB-first lookup in POST /beers/import-by-ean ([643b473](https://github.com/benoit-bremaud/brasse-bouillon/commit/643b473f7aa3df450f39b2660c07e8e9e7f352be))
* **beer-encyclopedia:** DB-first lookup in POST /beers/import-by-ean ([#848](https://github.com/benoit-bremaud/brasse-bouillon/issues/848)) ([7b14aa6](https://github.com/benoit-bremaud/brasse-bouillon/commit/7b14aa64e4c5de71ded74f2f24ab69f397ba1070))
* **beer-encyclopedia:** reject non-ASCII letters in country_of_origin validator ([1009d73](https://github.com/benoit-bremaud/brasse-bouillon/commit/1009d738b5e8ffe84e52535ec35c67d745f40397))
* **beer-encyclopedia:** reject non-ASCII letters in country_of_origin validator ([#842](https://github.com/benoit-bremaud/brasse-bouillon/issues/842)) ([7113e82](https://github.com/benoit-bremaud/brasse-bouillon/commit/7113e822ac90f7975d0f0f63d0bddcb440aa6f45))
* **beer-encyclopedia:** use paragraph=False in EasyOCR readtext to surface dispersed label text ([258e193](https://github.com/benoit-bremaud/brasse-bouillon/commit/258e1935c6e434d5d3255c7cbc05cb123b3874c8))
* **beer-encyclopedia:** use paragraph=False in EasyOCR readtext to surface dispersed label text ([#861](https://github.com/benoit-bremaud/brasse-bouillon/issues/861)) ([ce78e6f](https://github.com/benoit-bremaud/brasse-bouillon/commit/ce78e6f129e7148d37bbe0a58618f30af0fbaab6))
* **encyclopedia:** import the ML pipeline lazily so the app boots without the ml extra ([#1177](https://github.com/benoit-bremaud/brasse-bouillon/issues/1177)) ([a12e6b7](https://github.com/benoit-bremaud/brasse-bouillon/commit/a12e6b745ee294c8250077a1ba9d8e0c58975786))
* make API and beer-encyclopedia reachable from Expo Go via Tailscale/LAN ([e07479b](https://github.com/benoit-bremaud/brasse-bouillon/commit/e07479bcc7308676fdff77332b19f9a1bb1bdab9))


### Documentation

* **beer-encyclopedia:** align OpenAPI response descriptions with DB-first behaviour ([2024221](https://github.com/benoit-bremaud/brasse-bouillon/commit/20242215f09e519fb99c08a135ef9d64bfaa2f56))
* **beer-encyclopedia:** translate scan-photos README French heading to English ([15a5cce](https://github.com/benoit-bremaud/brasse-bouillon/commit/15a5cce3222b4c89b277377c71c56416486b10be))
* **beer-encyclopedia:** UML conception study + backfill ADRs ([#1146](https://github.com/benoit-bremaud/brasse-bouillon/issues/1146)) ([a5a0296](https://github.com/benoit-bremaud/brasse-bouillon/commit/a5a0296f2f624e7ead4bbb4feda15dc7c21eec50))
* **env:** document the .env workflow in every package README ([b159f29](https://github.com/benoit-bremaud/brasse-bouillon/commit/b159f2921698e85f8a20be59583337baaeb460e4))

## [0.2.3](https://github.com/benoit-bremaud/brasse-bouillon/compare/encyclopedia-v0.2.2...encyclopedia-v0.2.3) (2026-04-28)


### Bug Fixes

* **ci:** sync stale version files (app.json, encyclopedia) + wire release-please ([#756](https://github.com/benoit-bremaud/brasse-bouillon/issues/756)) ([7ae60c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/7ae60c0da47daa4fc4a8cc8f71d917da3745ac0a))
* **ci:** sync stale version files + wire release-please for app.json + encyclopedia/package.json ([0aef8bb](https://github.com/benoit-bremaud/brasse-bouillon/commit/0aef8bbc7e7c0880c142b54312553fe7c1d7b3a7))

## [0.2.2](https://github.com/benoit-bremaud/brasse-bouillon/compare/encyclopedia-v0.2.1...encyclopedia-v0.2.2) (2026-04-24)


### Features

* **encyclopedia:** add provenance fields to Beer model (epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 1/n) ([9d10920](https://github.com/benoit-bremaud/brasse-bouillon/commit/9d10920cc535810dd7a30c7393344f9934f042b6))
* **encyclopedia:** add provenance fields to Beer model (epic [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) part 1/n) ([#706](https://github.com/benoit-bremaud/brasse-bouillon/issues/706)) ([67f46af](https://github.com/benoit-bremaud/brasse-bouillon/commit/67f46afa984512e8efeafbbc7d2d46ce6f11a23d))


### Bug Fixes

* **encyclopedia:** address Copilot + Codex review on PR [#706](https://github.com/benoit-bremaud/brasse-bouillon/issues/706) ([2e4ba2e](https://github.com/benoit-bremaud/brasse-bouillon/commit/2e4ba2ee181891f842b8781a8f9d0ad4cb1831db))

## [0.2.1](https://github.com/benoit-bremaud/brasse-bouillon/compare/encyclopedia-v0.2.0...encyclopedia-v0.2.1) (2026-04-24)


### Features

* **beer-encyclopedia:** add CRUD + search endpoints and dev-env Makefile targets ([#552](https://github.com/benoit-bremaud/brasse-bouillon/issues/552)) ([cb9bcee](https://github.com/benoit-bremaud/brasse-bouillon/commit/cb9bceecdde06311860d1256b6589ce7893b9104)), closes [#546](https://github.com/benoit-bremaud/brasse-bouillon/issues/546)
* **beer-encyclopedia:** add CRUD and fuzzy search endpoints ([a6669c8](https://github.com/benoit-bremaud/brasse-bouillon/commit/a6669c8f16bcbc21136b2e3d60515e8caf4b2752)), closes [#546](https://github.com/benoit-bremaud/brasse-bouillon/issues/546)
* **beer-encyclopedia:** add data models and initial schema migration ([26d3965](https://github.com/benoit-bremaud/brasse-bouillon/commit/26d39654b3ad21b0738d5c37bded41dce73208e7)), closes [#544](https://github.com/benoit-bremaud/brasse-bouillon/issues/544)
* **beer-encyclopedia:** add data models and initial schema migration ([#550](https://github.com/benoit-bremaud/brasse-bouillon/issues/550)) ([6b1fa1a](https://github.com/benoit-bremaud/brasse-bouillon/commit/6b1fa1a3ea416b114d80d542580b51548c34d3c6)), closes [#544](https://github.com/benoit-bremaud/brasse-bouillon/issues/544)
* **beer-encyclopedia:** add PostgreSQL infrastructure ([c090890](https://github.com/benoit-bremaud/brasse-bouillon/commit/c0908902a2f777c6975512a5aeb3372bebd03e0a)), closes [#543](https://github.com/benoit-bremaud/brasse-bouillon/issues/543)
* **beer-encyclopedia:** add PostgreSQL infrastructure ([#549](https://github.com/benoit-bremaud/brasse-bouillon/issues/549)) ([cb8a5aa](https://github.com/benoit-bremaud/brasse-bouillon/commit/cb8a5aa1f3f16644ebbe8a19c1687f058074b479)), closes [#543](https://github.com/benoit-bremaud/brasse-bouillon/issues/543)


### Bug Fixes

* **review:** address PR [#548](https://github.com/benoit-bremaud/brasse-bouillon/issues/548) review comments ([354ebfe](https://github.com/benoit-bremaud/brasse-bouillon/commit/354ebfe5dcba5e5f6fc3959b98152d81774f61da))
* **review:** address PR [#549](https://github.com/benoit-bremaud/brasse-bouillon/issues/549) review comments ([fb44386](https://github.com/benoit-bremaud/brasse-bouillon/commit/fb4438636f2119cbe8e1a8e1bee7d3ef94de9488))
* **review:** address PR [#550](https://github.com/benoit-bremaud/brasse-bouillon/issues/550) review comments ([48dff57](https://github.com/benoit-bremaud/brasse-bouillon/commit/48dff57915012b7384a1041928f3c5e486314e8b))
* **review:** address PR [#551](https://github.com/benoit-bremaud/brasse-bouillon/issues/551) review comments ([46e94e0](https://github.com/benoit-bremaud/brasse-bouillon/commit/46e94e0bbbea89b60c93b922292165d58ed23349))
* **review:** address PR [#552](https://github.com/benoit-bremaud/brasse-bouillon/issues/552) review comments ([b96c586](https://github.com/benoit-bremaud/brasse-bouillon/commit/b96c58630ee402cf4e3ab2eee34884ecad20c678))
* **review:** address PR [#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554) review — version alignment, make setup idempotency, tool-version pinning ([d3f6e31](https://github.com/benoit-bremaud/brasse-bouillon/commit/d3f6e318d08822b18ec52258b3f559c2e7099f38))


### Refactors

* **beer-encyclopedia:** rename package from beer-label-ai ([769d678](https://github.com/benoit-bremaud/brasse-bouillon/commit/769d678bd13d6f299a886abddcccb2b3d9f1e6a3))
* **beer-encyclopedia:** rename package from beer-label-ai ([#548](https://github.com/benoit-bremaud/brasse-bouillon/issues/548)) ([7f281dd](https://github.com/benoit-bremaud/brasse-bouillon/commit/7f281dd93efe1d76865be25110f0b3aea968209e)), closes [#542](https://github.com/benoit-bremaud/brasse-bouillon/issues/542)
* **beer-encyclopedia:** restructure API into routers with lifespan ([6672d60](https://github.com/benoit-bremaud/brasse-bouillon/commit/6672d60a671da94de0402456898f53f092d8d1a1)), closes [#545](https://github.com/benoit-bremaud/brasse-bouillon/issues/545)
* **beer-encyclopedia:** restructure API into routers with lifespan ([#551](https://github.com/benoit-bremaud/brasse-bouillon/issues/551)) ([25ebf3c](https://github.com/benoit-bremaud/brasse-bouillon/commit/25ebf3c56e41e22823a796cbaa9386b8da5b9ff5)), closes [#545](https://github.com/benoit-bremaud/brasse-bouillon/issues/545)


### Documentation

* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([7eff4c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/7eff4c027733680c5bafa8f912c76e02862e9a4f))
* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554)) ([3b3737b](https://github.com/benoit-bremaud/brasse-bouillon/commit/3b3737bdcc871ce2d02e77d5cd81a6b59e3b5fb2))
