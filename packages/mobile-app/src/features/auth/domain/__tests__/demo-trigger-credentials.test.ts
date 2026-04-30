import {
  DEMO_TRIGGER_EMAIL,
  DEMO_TRIGGER_PASSWORD,
  isDemoTriggerCredentials,
} from "@/features/auth/domain/demo-trigger-credentials";

describe("isDemoTriggerCredentials (Issue #822)", () => {
  it("returns true on an exact email + password match", () => {
    expect(
      isDemoTriggerCredentials(DEMO_TRIGGER_EMAIL, DEMO_TRIGGER_PASSWORD),
    ).toBe(true);
  });

  it("is case-insensitive on the email and tolerates whitespace", () => {
    expect(
      isDemoTriggerCredentials(
        "  Demo@Brasse-Bouillon.Local  ",
        DEMO_TRIGGER_PASSWORD,
      ),
    ).toBe(true);
  });

  it("does NOT match when the password case differs (capslock guard)", () => {
    expect(
      isDemoTriggerCredentials(
        DEMO_TRIGGER_EMAIL,
        DEMO_TRIGGER_PASSWORD.toUpperCase(),
      ),
    ).toBe(false);
  });

  it("does NOT match a typo on the email (e.g., real user typing close to the demo address)", () => {
    expect(
      isDemoTriggerCredentials(
        "demo@brasse-bouillon.com",
        DEMO_TRIGGER_PASSWORD,
      ),
    ).toBe(false);
  });

  it("does NOT match an arbitrary login pair", () => {
    expect(
      isDemoTriggerCredentials("lea@brasse-bouillon.test", "StrongPass123!"),
    ).toBe(false);
  });

  it("does NOT match an empty pair", () => {
    expect(isDemoTriggerCredentials("", "")).toBe(false);
  });

  it("does NOT match the demo email with a wrong password", () => {
    expect(isDemoTriggerCredentials(DEMO_TRIGGER_EMAIL, "wrong-password")).toBe(
      false,
    );
  });
});
