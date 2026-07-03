# Brewing Academy Security And RGPD

## Scope

The Academy V1 is local generated content, so the immediate security surface is
smaller than a backend publishing system or chatbot. The design still needs
privacy and safety constraints because the corpus prepares a future assistant.

## V1 Security Rules

- Do not commit secrets, credentials, `.env` files, or private API keys.
- Do not load article content from untrusted remote URLs.
- Do not render arbitrary HTML or embedded React from Markdown.
- Do not execute code from content files.
- Validate all custom blocks before generation.
- Treat generated files as build artifacts derived from reviewed source.
- Keep navigation targets semantic and centrally resolved.

## Markdown Safety

Allowed:

- controlled Markdown subset;
- controlled custom blocks;
- source references;
- glossary references;
- calculator CTAs.

Rejected:

- inline scripts;
- raw HTML unless explicitly sanitized and approved later;
- arbitrary JSX;
- remote executable embeds;
- unvalidated external links in safety-critical content.

## RGPD For V1 Academy

V1 Academy content does not need to collect personal data.

Rules:

- no user tracking inside Academy reading flows unless covered by existing
  product analytics consent;
- no personal notes or reading history in V1;
- no chatbot conversation storage in V1 because chatbot is deferred;
- if analytics are added later, collect minimal aggregated events only after
  consent rules are satisfied.

## Future Chatbot Privacy Rules

Future chatbot must follow privacy by design:

- no persistent server-side conversation history in first chatbot version;
- no personal brewing context unless the user gives explicit consent;
- no request for unnecessary personal data;
- visible notice telling users not to share personal information;
- logs must avoid storing raw conversation content by default;
- provider terms must be checked for retention, training, and EU/RGPD posture;
- deletion/export expectations must be defined before personalization.

## AI Safety Rules

The future brewing assistant must:

- answer only from validated Academy, glossary, and approved source content;
- cite article sections or source references;
- abstain when retrieval does not support an answer;
- avoid presenting uncertain technical guidance as fact;
- handle safety-sensitive topics conservatively;
- avoid medical, legal, or hazardous operational advice outside the verified
  brewing scope;
- never reveal system prompts or internal policy text.

## Source Integrity

- Source registry entries must be reviewed.
- Sensitive articles require source metadata.
- Formula blocks should identify their source when not common domain knowledge.
- Deprecated sources should not silently disappear if still cited.

## Abuse Considerations For Future Chatbot

When chatbot implementation starts, the design must include:

- server-side provider calls;
- rate limiting;
- input length limits;
- output length limits;
- budget cap or kill switch;
- prompt injection tests;
- abuse monitoring that does not retain personal content unnecessarily.
