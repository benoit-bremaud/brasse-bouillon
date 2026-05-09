# Scan tech-spike results

> **Status:** harness shipped, results pending. Driven by issue [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944).
> Update this document with measured values once the benchmark has been run on
> at least one Android device + one iOS device.

## 1. Why this document exists

[scan-algorithms.md §6](scan-algorithms.md#6-tech-stack-constraints--expo-managed-pure)
commits the panoramic capture flow to **Expo Managed pure**. Several technical
bets ride on that commitment. This spike collects hard data on each bet
**before** the implementation of [#945](https://github.com/benoit-bremaud/brasse-bouillon/issues/945)
[#946](https://github.com/benoit-bremaud/brasse-bouillon/issues/946)
[#947](https://github.com/benoit-bremaud/brasse-bouillon/issues/947) lands —
so we can pivot the roadmap if a bet fails on real hardware.

## 2. How to run the benchmark

The harness lives in `packages/mobile-app/src/features/scan/presentation/BenchmarkScreen.tsx`.
Access:

1. Build + install the app on the target device (Expo Go, EAS Build, or
   `npm run android` / `npm run ios` from `packages/mobile-app`).
2. Sign in with any account (the route is gated behind the `(app)` group, so
   auth is required).
3. Open the deep link `brassebouillonmobileapp:///dashboard/scan/benchmark` —
   or navigate manually if a build-time link button is added.
4. Tap each of the three benchmark buttons in order: **Burst (10 s)** → **Hash
   (10×3)** → **OCR**.
5. When all three have run, tap **Partager le JSON complet** and paste the
   JSON into one of the result tables below (under the matching device).

The JSON shape matches `BenchmarkResult` in [`benchmark-result.types.ts`](../../../packages/mobile-app/src/features/scan/domain/benchmark-result.types.ts).

## 3. Acceptance criteria from #944

- [ ] Burst rate of `expo-camera.takePictureAsync` at 1024 px ≥ 5 fps on
      one Android + one iOS device. JPEG payload size per frame measured.
- [ ] Pure-JS perceptual hash ≤ 50 ms per hash on the slowest device.
- [ ] `tesseract.js` outcome documented (succeeded with timings, or failed —
      either way the data point feeds back into decision D4).
- [ ] Expo Managed bundle still builds + runs on EAS Build.

## 4. Results

### 4.1 Android device (TBD model + OS)

> Device: _to fill_
> Date: _to fill_

#### Burst capture

| Metric | Value |
|---|---|
| Frames captured | _to fill_ |
| Duration (s) | _to fill_ |
| FPS | _to fill_ |
| Median JPEG size | _to fill_ |
| Max JPEG size | _to fill_ |
| Notes | _to fill_ |

#### Perceptual hash

| Metric | Value |
|---|---|
| Fixtures × runs | 3 × 10 |
| Median ms / hash | _to fill_ |
| P95 ms / hash | _to fill_ |
| Max ms / hash | _to fill_ |
| Notes | _to fill_ |

#### Tesseract.js OCR

| Metric | Value |
|---|---|
| Succeeded | _to fill_ |
| Init ms | _to fill_ |
| OCR ms | _to fill_ |
| JS thread blocked ms | _to fill_ |
| Error message (if any) | _to fill_ |
| Notes | _to fill_ |

### 4.2 iOS device (TBD model + OS)

> Device: _to fill_
> Date: _to fill_

#### Burst capture

| Metric | Value |
|---|---|
| Frames captured | _to fill_ |
| Duration (s) | _to fill_ |
| FPS | _to fill_ |
| Median JPEG size | _to fill_ |
| Max JPEG size | _to fill_ |
| Notes | _to fill_ |

#### Perceptual hash

| Metric | Value |
|---|---|
| Fixtures × runs | 3 × 10 |
| Median ms / hash | _to fill_ |
| P95 ms / hash | _to fill_ |
| Max ms / hash | _to fill_ |
| Notes | _to fill_ |

#### Tesseract.js OCR

| Metric | Value |
|---|---|
| Succeeded | _to fill_ |
| Init ms | _to fill_ |
| OCR ms | _to fill_ |
| JS thread blocked ms | _to fill_ |
| Error message (if any) | _to fill_ |
| Notes | _to fill_ |

## 5. Go / no-go decisions

To be filled once §4 has measurements on both platforms.

| Bet | Target | Android value | iOS value | Verdict |
|---|---|---|---|---|
| Burst rate | ≥ 5 fps | _to fill_ | _to fill_ | _go / no-go_ |
| pHash latency | ≤ 50 ms median | _to fill_ | _to fill_ | _go / no-go_ |
| Tesseract.js viability | runs without freezing JS thread > 1 s | _to fill_ | _to fill_ | _go / no-go (D4 confirms / overrides)_ |
| Expo Managed bundle | builds on EAS, runs on device | _to fill_ | _to fill_ | _go / no-go_ |

## 6. Implementation notes

- **Tesseract.js is intentionally not declared as a dependency** in
  `packages/mobile-app/package.json`. Decision D4 (2026-05-08, see
  [scan-algorithms.md §3 Phase 4](scan-algorithms.md#phase-4--live-ocr-snapshot--dropped-decision-d4-2026-05-08))
  removes it from production. The benchmark dynamically imports it
  (`await import("tesseract.js")`) and captures the failure mode as itself
  useful evidence backing D4. If a future maintainer wants to re-evaluate the
  OCR question, install `tesseract.js` as a devDependency and re-run.
- **Fixtures:** 3 photos copied from
  `packages/beer-encyclopedia/scan-photos/` (the manual /scan validation
  session 2026-05-02). Real labels with realistic glare + colour variance.
- **pHash impl:** 64-bit FNV-1a over the JPEG byte stream (pure JS, no native
  dep). Not a true DCT-based pHash — the actual loop-closure detection in
  [#947](https://github.com/benoit-bremaud/brasse-bouillon/issues/947) will
  use a richer scheme, but this gives a tight lower bound on the JS hashing
  cost.
- **Burst options:** `skipProcessing: true`, `quality: 0.7`, `base64: false`,
  `exif: false`, `shutterSound: false`. Mirrors what the production
  burst-capture loop in #946 will use.

## 7. References

- Issue [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944) — Tech-spike acceptance criteria
- Spec [scan-algorithms.md](scan-algorithms.md) — algorithmic context
- Roadmap [scan-roadmap.md §4 Phase 0](scan-roadmap.md) — where this spike sits
- Benchmark harness:
  - [`packages/mobile-app/src/features/scan/presentation/BenchmarkScreen.tsx`](../../../packages/mobile-app/src/features/scan/presentation/BenchmarkScreen.tsx)
  - [`packages/mobile-app/src/features/scan/application/benchmark.use-cases.ts`](../../../packages/mobile-app/src/features/scan/application/benchmark.use-cases.ts)
  - [`packages/mobile-app/src/features/scan/application/perceptual-hash.ts`](../../../packages/mobile-app/src/features/scan/application/perceptual-hash.ts)
