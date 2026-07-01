/* istanbul ignore file -- out-of-band eval bridge (ADR-0019), not part of the unit pyramid. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Bridge between the eval judge (see AGENT.md) and dev/CI. GREEN only when `results.json` exists,
 * covers every case in `test-cases.json`, and every expectation is `met: true`. Run out-of-band
 * with `npm run eval:faq-bot` (ts-node) — never in the Jest `*.spec.ts` unit suite (ADR-0019).
 */
interface Expectation {
  key: string;
  met: boolean;
  note?: string;
}
interface CaseResult {
  id: string;
  answer: string;
  expectations: Expectation[];
  pass: boolean;
}
interface Results {
  results: CaseResult[];
  summary: { total: number; passed: number; failed: number };
}
interface TestCases {
  cases: { id: string; expectations: { key: string }[] }[];
}

const dir = __dirname;
const testCases = JSON.parse(
  readFileSync(join(dir, 'test-cases.json'), 'utf8'),
) as TestCases;

let results: Results;
try {
  results = JSON.parse(
    readFileSync(join(dir, 'results.json'), 'utf8'),
  ) as Results;
} catch {
  console.error(
    '❌ results.json not found. Run the eval judge (see AGENT.md) first.',
  );
  process.exit(1);
}

const byId = new Map(results.results.map((r) => [r.id, r]));
const failures: string[] = [];

for (const tc of testCases.cases) {
  const result = byId.get(tc.id);
  if (!result) {
    failures.push(`${tc.id}: no result`);
    continue;
  }
  for (const expectation of tc.expectations) {
    const judged = result.expectations.find((e) => e.key === expectation.key);
    if (!judged) {
      failures.push(`${tc.id}/${expectation.key}: not judged`);
    } else if (!judged.met) {
      failures.push(
        `${tc.id}/${expectation.key}: FAILED — ${judged.note ?? ''}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`🔴 Eval RED — ${failures.length} unmet expectation(s):`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `🟢 Eval GREEN — ${testCases.cases.length} cases, every expectation met.`,
);
