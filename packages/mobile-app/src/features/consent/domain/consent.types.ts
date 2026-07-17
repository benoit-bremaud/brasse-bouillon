export type ConsentAxis =
  | "scan.barcode"
  | "scan.photos"
  | "scan.metadata"
  | "scan.training"
  | "ml.training"
  | "telemetry";

export type ConsentSource = "profile" | "scan" | "system";

export interface ConsentDecision {
  axis: ConsentAxis;
  value: boolean;
  decidedAt: string;
  source: ConsentSource;
}

export interface ConsentRepository {
  listDecisions(): Promise<ConsentDecision[]>;
  appendDecisions(decisions: ConsentDecision[]): Promise<void>;
  purgeAll(): Promise<void>;
}
