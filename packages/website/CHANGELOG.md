# Changelog

## [0.1.4](https://github.com/benoit-bremaud/brasse-bouillon/compare/website-v0.1.3...website-v0.1.4) (2026-07-24)


### Bug Fixes

* **website:** tighten homepage SEO metadata ([#1520](https://github.com/benoit-bremaud/brasse-bouillon/issues/1520)) ([2594ed7](https://github.com/benoit-bremaud/brasse-bouillon/commit/2594ed79b10c035e61995b77c095381da897eec4))

## [0.1.3](https://github.com/benoit-bremaud/brasse-bouillon/compare/website-v0.1.2...website-v0.1.3) (2026-07-20)


### Features

* **faq-bot:** public FAQ chatbot — API (Mistral + ALTCHA) + website widget ([#1293](https://github.com/benoit-bremaud/brasse-bouillon/issues/1293)) ([28a1535](https://github.com/benoit-bremaud/brasse-bouillon/commit/28a15359f9dcf7137b613a8f2747f6b4ef8fa515))
* **website:** add "buy me a beer" Ko-fi donation link (ADR-0028) ([#1423](https://github.com/benoit-bremaud/brasse-bouillon/issues/1423)) ([c813529](https://github.com/benoit-bremaud/brasse-bouillon/commit/c8135290b5f4e31b473276ec474736d0dec40341))
* **website:** add Académie brassicole feature section (FR) ([#1388](https://github.com/benoit-bremaud/brasse-bouillon/issues/1388)) ([98430bf](https://github.com/benoit-bremaud/brasse-bouillon/commit/98430bf417d9f1bc1d596bf321c856cd93fbe53d))
* **website:** add security response headers via Cloudflare Pages _headers ([#1370](https://github.com/benoit-bremaud/brasse-bouillon/issues/1370)) ([dbb704e](https://github.com/benoit-bremaud/brasse-bouillon/commit/dbb704e7eaa9bd141e1c7bc88fb5e0c4d2b7a625))
* **website:** flip the i18n S2 SEO switch — EN pages indexable (ADR-0027 D5) ([#1428](https://github.com/benoit-bremaud/brasse-bouillon/issues/1428)) ([1cfe565](https://github.com/benoit-bremaud/brasse-bouillon/commit/1cfe5657346c3d664ccede78e7559876e1fefbb4))
* **website:** legal-twin freshness stamps — close i18n S4 (ADR-0027 D1.5) ([#1439](https://github.com/benoit-bremaud/brasse-bouillon/issues/1439)) ([0300653](https://github.com/benoit-bremaud/brasse-bouillon/commit/03006533ec6712a21800d3f9efda3a7ffacea4d1))
* **website:** put the FAQ chatbot live on production (ADR-0022 go-live) ([#1420](https://github.com/benoit-bremaud/brasse-bouillon/issues/1420)) ([ff97409](https://github.com/benoit-bremaud/brasse-bouillon/commit/ff9740955e97cb82ffdd8108c7de2f7d8561e8dd))
* **website:** real English home at /en (i18n epic S1) ([#1394](https://github.com/benoit-bremaud/brasse-bouillon/issues/1394)) ([801049c](https://github.com/benoit-bremaud/brasse-bouillon/commit/801049c1690b672197b1fe6f8119d4daad37a6f6))
* **website:** real mascot og-image (1200×630) + dimension gate ([#1413](https://github.com/benoit-bremaud/brasse-bouillon/issues/1413)) ([0833968](https://github.com/benoit-bremaud/brasse-bouillon/commit/0833968c181e18ce0073d5274d8bfc2d904bf2f8))
* **website:** self-host Inter & Fraunces fonts (drop Google Fonts CDN) ([#1378](https://github.com/benoit-bremaud/brasse-bouillon/issues/1378)) ([c003d8e](https://github.com/benoit-bremaud/brasse-bouillon/commit/c003d8ec0f4d9f3905a1ed458ee992b44300d2f9))
* **website:** SEO/GEO optimization (keyword-first titles, WebSite schema, llms.txt, pages.dev noindex) ([#1464](https://github.com/benoit-bremaud/brasse-bouillon/issues/1464)) ([89aeb25](https://github.com/benoit-bremaud/brasse-bouillon/commit/89aeb25429968b27555d9cde4f31e8bba4cc1030))


### Bug Fixes

* **faq-bot:** turn the [CONTACT] placeholder into a real sign-up link ([1e2f143](https://github.com/benoit-bremaud/brasse-bouillon/commit/1e2f143a5363ef8bf7a76997bfecb43b88fdedf7))
* **website:** close the head-level blind spot in the i18n srcHash drift guard ([#1467](https://github.com/benoit-bremaud/brasse-bouillon/issues/1467)) ([eac81af](https://github.com/benoit-bremaud/brasse-bouillon/commit/eac81afd46b053bd048e49e9d46c84e2dca066c9))
* **website:** disclose the FR-interface screenshots on the EN home ([#1417](https://github.com/benoit-bremaud/brasse-bouillon/issues/1417)) ([691166c](https://github.com/benoit-bremaud/brasse-bouillon/commit/691166cadd90191ad2723939b3e1bd2c2886fd72))
* **website:** faq-bot widget 400-vs-503 UX ([#1314](https://github.com/benoit-bremaud/brasse-bouillon/issues/1314)) + wire live API origin ([#1381](https://github.com/benoit-bremaud/brasse-bouillon/issues/1381)) ([f738b2b](https://github.com/benoit-bremaud/brasse-bouillon/commit/f738b2bc1c66ccc7442e43490e3df2db3a6a7188))
* **website:** legal pages compliance — real host, drop false claims (LCEN/RGPD) ([#1379](https://github.com/benoit-bremaud/brasse-bouillon/issues/1379)) ([e59303e](https://github.com/benoit-bremaud/brasse-bouillon/commit/e59303ea835eeb9e65527cbf5ed551eea83ed5c3))
* **website:** newsletter honeypot, badge contrast (AA), honest widget comment (Lot 6) ([#1389](https://github.com/benoit-bremaud/brasse-bouillon/issues/1389)) ([b0b43f2](https://github.com/benoit-bremaud/brasse-bouillon/commit/b0b43f20419b246e0c553e8bc3e14a39c552acbe))
* **website:** point canonical/hreflang/links at clean URLs; noindex EN legal ([#1373](https://github.com/benoit-bremaud/brasse-bouillon/issues/1373)) ([79dda0c](https://github.com/benoit-bremaud/brasse-bouillon/commit/79dda0c711ec10f895a220f421f3f5d93df56e74))
* **website:** serve a real 404 page for unknown routes ([#1367](https://github.com/benoit-bremaud/brasse-bouillon/issues/1367)) ([a8b9e28](https://github.com/benoit-bremaud/brasse-bouillon/commit/a8b9e28d4e3741bc180aa87441a9aa6e8576e156))
* **website:** sitemap legal pages, social meta, drop 197KB SVG favicon (Lot 5) ([#1384](https://github.com/benoit-bremaud/brasse-bouillon/issues/1384)) ([803693a](https://github.com/benoit-bremaud/brasse-bouillon/commit/803693a93078e70fca1628cc3d4065b3344b4672))


### Performance

* **website:** cut sustained animation load (fewer bubbles + pause off-screen loops) ([2721525](https://github.com/benoit-bremaud/brasse-bouillon/commit/2721525649233758341235974adcc50b0d301664))


### Refactors

* **website:** drop the redundant footer language switcher ([#1419](https://github.com/benoit-bremaud/brasse-bouillon/issues/1419)) ([40b73c7](https://github.com/benoit-bremaud/brasse-bouillon/commit/40b73c70b932e33d485a6cbbde1f90858d21ddc1))
* **website:** exact-set sitemap policy + O(n) duplicate check ([#1393](https://github.com/benoit-bremaud/brasse-bouillon/issues/1393)) ([152b470](https://github.com/benoit-bremaud/brasse-bouillon/commit/152b4707dfd6583dc9616fc3736a9b21cc06dab1))


### Documentation

* **website/architecture:** website i18n epic conception (ADR-0027, UML, EN launch playbook) ([#1383](https://github.com/benoit-bremaud/brasse-bouillon/issues/1383)) ([2184856](https://github.com/benoit-bremaud/brasse-bouillon/commit/21848567b1936eef5950f7d9e3309773598885ce))
* **website:** freeze the r/Homebrewing launch post + account runway plan ([#1431](https://github.com/benoit-bremaud/brasse-bouillon/issues/1431)) ([205dc3e](https://github.com/benoit-bremaud/brasse-bouillon/commit/205dc3ef965e778942325a90f6eeb489a434943b))

## [0.1.2](https://github.com/benoit-bremaud/brasse-bouillon/compare/website-v0.1.1...website-v0.1.2) (2026-06-05)


### Features

* **auth:** Sprint A polish — simplified signup ([#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) + Google cosmetic button ([#765](https://github.com/benoit-bremaud/brasse-bouillon/issues/765)) + bigger mascot ([#790](https://github.com/benoit-bremaud/brasse-bouillon/issues/790)) ([c64805f](https://github.com/benoit-bremaud/brasse-bouillon/commit/c64805f71db8a1e262949b09a299ab1c1273fcde))
* **brassins:** brewing assistant — step countdown timer + pedagogical tips ([#1107](https://github.com/benoit-bremaud/brasse-bouillon/issues/1107)) ([4e2e9d6](https://github.com/benoit-bremaud/brasse-bouillon/commit/4e2e9d6453b52e14bc7549c0ef0f9fc07ef35315))
* **scan:** mobile matching view — official + equivalents sections (Issue [#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([3ee1796](https://github.com/benoit-bremaud/brasse-bouillon/commit/3ee1796a9f2d42d18da97cf2aec7b6786c799447))
* **scan:** mobile matching view — official section + equivalents + low_confidence (Issue [#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([#793](https://github.com/benoit-bremaud/brasse-bouillon/issues/793)) ([7266559](https://github.com/benoit-bremaud/brasse-bouillon/commit/72665596a793c0cd7fbd5fa9541d87ff8a58888a))
* **ui:** compact brand header + beer-gradient background + refreshed app captures ([#1093](https://github.com/benoit-bremaud/brasse-bouillon/issues/1093)) ([c75bdee](https://github.com/benoit-bremaud/brasse-bouillon/commit/c75bdee7550102340ff8dd070c66e1d1db861575))
* **website:** accessible mobile burger menu for the header nav ([#1063](https://github.com/benoit-bremaud/brasse-bouillon/issues/1063)) ([97a134e](https://github.com/benoit-bremaud/brasse-bouillon/commit/97a134ec78487215313f8c1b78751b9de92f6f5a))
* **website:** add app screen captures (slide/mockup assets) ([#1122](https://github.com/benoit-bremaud/brasse-bouillon/issues/1122)) ([52e5daf](https://github.com/benoit-bremaud/brasse-bouillon/commit/52e5dafddfe172f0e01b1ed75548b89214ea11ec))
* **website:** add beer scan recognition section to landing page ([#1083](https://github.com/benoit-bremaud/brasse-bouillon/issues/1083)) ([6aeeb44](https://github.com/benoit-bremaud/brasse-bouillon/commit/6aeeb440e7e325bbeaa23c281b528c6e9510f99d))
* **website:** denser device-adaptive bubbles + reworked, perf-tuned dew drop ([#1090](https://github.com/benoit-bremaud/brasse-bouillon/issues/1090)) ([a36f37f](https://github.com/benoit-bremaud/brasse-bouillon/commit/a36f37fe897f42863e0acf8e7abe3ad9dacc4536))
* **website:** embed the feedback widget on all pages (FR + EN) ([#1089](https://github.com/benoit-bremaud/brasse-bouillon/issues/1089)) ([6f60d5d](https://github.com/benoit-bremaud/brasse-bouillon/commit/6f60d5d2291a5ef6f0694981154cfdc15e2d5e2e))
* **website:** home simplification + Kinetic editorial design refresh ([#1023](https://github.com/benoit-bremaud/brasse-bouillon/issues/1023)) ([29cdb90](https://github.com/benoit-bremaud/brasse-bouillon/commit/29cdb9079b5f32cce20bdc116d2b23f866f1fa44))
* **website:** lead the journey with scan→clone (5 steps) ([#1109](https://github.com/benoit-bremaud/brasse-bouillon/issues/1109)) ([67afba9](https://github.com/benoit-bremaud/brasse-bouillon/commit/67afba90159ecf47fe6310d098207ebb796fe3c8))
* **website:** move feedback widget to staging-only, off production ([#1158](https://github.com/benoit-bremaud/brasse-bouillon/issues/1158)) ([8f87fc6](https://github.com/benoit-bremaud/brasse-bouillon/commit/8f87fc67218f60a018b5b1abff2a0fd23e7e179a))
* **website:** native 12-question brewer survey on the landing page ([#1088](https://github.com/benoit-bremaud/brasse-bouillon/issues/1088)) ([5410e82](https://github.com/benoit-bremaud/brasse-bouillon/commit/5410e82b7cf2d6b463b171159405c9ecf0f9c2a3))
* **website:** new-brewer journey section + screenshot-ready feature cards ([#1018](https://github.com/benoit-bremaud/brasse-bouillon/issues/1018)) ([e4c8f2d](https://github.com/benoit-bremaud/brasse-bouillon/commit/e4c8f2df5be0d046d1f13e496129205b18cfe9d7))
* **website:** premium bottom band for the 18+ notice + ambient rising bubbles ([#1057](https://github.com/benoit-bremaud/brasse-bouillon/issues/1057)) ([bd56bb2](https://github.com/benoit-bremaud/brasse-bouillon/commit/bd56bb229a804702ae78b6679fdfc6e6523d1dbd))
* **website:** real app screenshots (catalogue, fermentation, studio, hop calculator) ([#1079](https://github.com/benoit-bremaud/brasse-bouillon/issues/1079)) ([ef149de](https://github.com/benoit-bremaud/brasse-bouillon/commit/ef149de491a07b6aa9f25e412947c5455f6deeaa))
* **website:** refresh app captures on beer-gradient bg + dark phone bezel ([#1119](https://github.com/benoit-bremaud/brasse-bouillon/issues/1119)) ([e4fa604](https://github.com/benoit-bremaud/brasse-bouillon/commit/e4fa6040834fbb217ee396f895358953bfccd2ef))


### Bug Fixes

* **review:** address PR [#1018](https://github.com/benoit-bremaud/brasse-bouillon/issues/1018) Copilot + Codex feedback on the journey section ([441eb38](https://github.com/benoit-bremaud/brasse-bouillon/commit/441eb381a97e8f8b32aeea3b9883e4ea447748f3))
* **website:** eliminate Firefox compositing ghost + rebalance density ([#1060](https://github.com/benoit-bremaud/brasse-bouillon/issues/1060)) ([12a7d4b](https://github.com/benoit-bremaud/brasse-bouillon/commit/12a7d4be5f1436d2423960fb95d257a10fe63ffb))
* **website:** journey back to 4 steps — scan lives only in 'La reconnaissance' ([#1114](https://github.com/benoit-bremaud/brasse-bouillon/issues/1114)) ([bec699a](https://github.com/benoit-bremaud/brasse-bouillon/commit/bec699a14b11732cdc369c9d8ca35724c7007fc0))
* **website:** stop dew layer from overflowing cards on mobile ([#1062](https://github.com/benoit-bremaud/brasse-bouillon/issues/1062)) ([5a88880](https://github.com/benoit-bremaud/brasse-bouillon/commit/5a8888031ab7df875db9332bfb4ebfd74feb4c75))


### Performance

* **website:** drop the foam layer, trim bubbles and trickle drops ([#1065](https://github.com/benoit-bremaud/brasse-bouillon/issues/1065)) ([87d88ce](https://github.com/benoit-bremaud/brasse-bouillon/commit/87d88ce08448203a2fbe78a4eea288f12c0005a4))
* **website:** hero logo → WebP, drop unused logo assets ([#1091](https://github.com/benoit-bremaud/brasse-bouillon/issues/1091)) ([56072b8](https://github.com/benoit-bremaud/brasse-bouillon/commit/56072b850dc43f9027ceab2c8ff8b95fb39b0756))
* **website:** remove backdrop-filter on droplets, cut element counts ([#1059](https://github.com/benoit-bremaud/brasse-bouillon/issues/1059)) ([aa5faa9](https://github.com/benoit-bremaud/brasse-bouillon/commit/aa5faa96bbde8eaf61fa489846ff05c1a615acc5))


### Documentation

* **website:** finalize Cloudflare Pages migration — ADR-0014 + drop vestigial CNAME ([#1157](https://github.com/benoit-bremaud/brasse-bouillon/issues/1157)) ([d0c8520](https://github.com/benoit-bremaud/brasse-bouillon/commit/d0c8520a03980f38d72783a294081ce7359d6173))
* **website:** mention auth refresh on public roadmap (Issue [#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) ([a82768f](https://github.com/benoit-bremaud/brasse-bouillon/commit/a82768f4bfc57d25515e3566e70fec4fff7eae33))
* **website:** mention Google sign-in cosmetic preview on public roadmap (Issue [#765](https://github.com/benoit-bremaud/brasse-bouillon/issues/765)) ([778a574](https://github.com/benoit-bremaud/brasse-bouillon/commit/778a574028a8f96d3a5afa61606a1e411f2f6b2f))
* **website:** scrub obsolete deployment claims from the consignes ([59928ba](https://github.com/benoit-bremaud/brasse-bouillon/commit/59928ba93e8799390ecbdaa92c3debef1ae922ff))

## [0.1.1](https://github.com/benoit-bremaud/brasse-bouillon/compare/website-v0.1.0...website-v0.1.1) (2026-04-24)


### Bug Fixes

* **website:** fix SyntaxError in weekly_digest.py ([c093955](https://github.com/benoit-bremaud/brasse-bouillon/commit/c093955305716418031896392c04426dd6b3f9a1))
* **website:** sync packages/website with latest standalone repo ([0a5f63c](https://github.com/benoit-bremaud/brasse-bouillon/commit/0a5f63c2ffc98b0dba18a7ddeed432ccf8285a0e))
* **website:** sync packages/website with latest standalone repo ([#494](https://github.com/benoit-bremaud/brasse-bouillon/issues/494)) ([9cd50b5](https://github.com/benoit-bremaud/brasse-bouillon/commit/9cd50b57bfb01b16eb60f31d58d2645d794380a8)), closes [#329](https://github.com/benoit-bremaud/brasse-bouillon/issues/329)
* **website:** sync remaining divergent files from standalone repo ([8f495d6](https://github.com/benoit-bremaud/brasse-bouillon/commit/8f495d666042099c616593f098ce5581d8e22504))
