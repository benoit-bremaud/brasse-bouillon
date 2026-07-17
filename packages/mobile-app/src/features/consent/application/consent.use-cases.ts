import { consentRepository } from "@/features/consent/data/consent.storage";
import type {
  ConsentAxis,
  ConsentDecision,
  ConsentSource,
} from "@/features/consent/domain/consent.types";

export type RecordConsentInput = {
  axis: ConsentAxis;
  value: boolean;
  source: ConsentSource;
  decidedAt?: string;
};

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function toDecision(input: RecordConsentInput): ConsentDecision {
  const decidedAt = input.decidedAt ?? new Date().toISOString();
  if (!isValidDate(decidedAt)) {
    throw new Error("Consent decision date must be a valid ISO date.");
  }

  return {
    axis: input.axis,
    value: input.value,
    decidedAt,
    source: input.source,
  };
}

export async function listConsentDecisions(): Promise<ConsentDecision[]> {
  return consentRepository.listDecisions();
}

export async function recordConsentDecisions(
  inputs: RecordConsentInput[],
): Promise<ConsentDecision[]> {
  const decisions = inputs.map(toDecision);
  await consentRepository.appendDecisions(decisions);
  return decisions;
}

export async function getLatestConsentDecision(
  axis: ConsentAxis,
): Promise<ConsentDecision | null> {
  const decisions = await listConsentDecisions();
  return (
    decisions
      .filter((decision) => decision.axis === axis)
      .sort(
        (left, right) =>
          Date.parse(right.decidedAt) - Date.parse(left.decidedAt),
      )[0] ?? null
  );
}

export async function purgeConsentDecisions(): Promise<void> {
  await consentRepository.purgeAll();
}
