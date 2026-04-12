# ADR-0001: Detection-first strategy for Sprint 1

- Status: Accepted
- Date: 2026-02-26

## Context

The project combines detection, OCR, and recipe recommendation. Early quality risk is high if all subsystems are optimized simultaneously.

## Decision

Sprint 1 follows a **detection-first** strategy:

1. prioritize label detection dataset quality and baseline model reliability
2. defer OCR optimization and advanced ranking refinements to next sprint cycles

## Rationale

- Reduces complexity for first measurable baseline
- Produces clear error signals (detection vs OCR vs ranking)
- Improves iteration speed and maintainability

## Consequences

### Positive

- Faster baseline delivery
- Better dataset governance from day one
- Cleaner metrics interpretation

### Trade-offs

- OCR accuracy may remain limited in Sprint 1
- Some recommendation precision is deferred to Sprint 2
