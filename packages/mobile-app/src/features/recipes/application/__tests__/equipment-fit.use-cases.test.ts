import { getEquipmentFit } from "@/features/recipes/data/equipment-fit.api";
import {
  describeFit,
  loadEquipmentFit,
} from "@/features/recipes/application/equipment-fit.use-cases";
import type { CapacityFit } from "@/features/recipes/domain/equipment-fit.types";

jest.mock("@/features/recipes/data/equipment-fit.api", () => ({
  getEquipmentFit: jest.fn(),
}));

const mockGet = getEquipmentFit as jest.MockedFunction<typeof getEquipmentFit>;

function fit(overrides: Partial<CapacityFit> = {}): CapacityFit {
  return {
    fermenter: "FITS",
    fermenterReason: null,
    kettle: "OK",
    kettleReason: null,
    fermenterUsableL: 4.5,
    recipeVolumeL: 4.3,
    preBoilL: 5,
    kettleCapacityL: 10,
    scaleRatio: null,
    ...overrides,
  };
}

describe("loadEquipmentFit", () => {
  afterEach(() => jest.clearAllMocks());

  it("delegates to the data layer with the recipe id, profile id and signal", async () => {
    mockGet.mockResolvedValue(fit());
    const signal = new AbortController().signal;

    await loadEquipmentFit("recipe-1", "profile-9", signal);

    expect(mockGet).toHaveBeenCalledWith("recipe-1", "profile-9", signal);
  });
});

describe("describeFit", () => {
  it("marks FITS as success with a usable-volume detail", () => {
    const view = describeFit(fit());
    expect(view.showProfileCta).toBe(false);
    expect(view.fermenter.badgeTone).toBe("success");
    expect(view.fermenter.badgeLabel).toBe("Ça passe");
    expect(view.fermenter.detail).toBe("4.3 L pour 4.5 L utiles");
  });

  it("marks TOO_LARGE as error and surfaces the scale ratio in the message", () => {
    const view = describeFit(
      fit({ fermenter: "TOO_LARGE", recipeVolumeL: 20, scaleRatio: 4.4 }),
    );
    expect(view.fermenter.badgeTone).toBe("error");
    expect(view.fermenter.badgeLabel).toBe("Trop grand");
    expect(view.fermenter.message).toContain("~4.4");
    expect(view.fermenter.message).toContain("20 L");
  });

  it("marks a kettle WARNING as warning (non-blocking)", () => {
    const view = describeFit(
      fit({ kettle: "WARNING", preBoilL: 12, kettleCapacityL: 10 }),
    );
    expect(view.kettle.badgeTone).toBe("warning");
    expect(view.kettle.badgeLabel).toBe("Attention");
  });

  it("renders a distinct message for a HARD_STOP kettle (not the generic not-evaluated copy)", () => {
    const view = describeFit(
      fit({ kettle: "HARD_STOP", preBoilL: 12, kettleCapacityL: 5 }),
    );
    expect(view.kettle.badgeTone).toBe("error");
    expect(view.kettle.badgeLabel).toBe("Impossible");
    expect(view.kettle.message).not.toBe("Adéquation non vérifiable.");
  });

  it("falls back to '?' when TOO_LARGE has no scale ratio", () => {
    const view = describeFit(
      fit({ fermenter: "TOO_LARGE", recipeVolumeL: 20, scaleRatio: null }),
    );
    expect(view.fermenter.badgeTone).toBe("error");
    expect(view.fermenter.message).toContain("~?");
  });

  it("shows the declare-equipment CTA when no profile is declared", () => {
    const view = describeFit(
      fit({
        fermenter: "NOT_EVALUATED",
        fermenterReason: "NO_PROFILE",
        kettle: "NOT_EVALUATED",
        kettleReason: "NO_PROFILE",
      }),
    );
    expect(view.showProfileCta).toBe(true);
  });

  it("does NOT show the whole-screen CTA when only one leg is NO_PROFILE (renders per-leg)", () => {
    const view = describeFit(
      fit({ fermenter: "NOT_EVALUATED", fermenterReason: "NO_PROFILE" }),
    );
    expect(view.showProfileCta).toBe(false);
    expect(view.kettle.badgeTone).toBe("success"); // the kettle leg still renders
  });

  it.each([
    ["NO_RECIPE_VOLUME", "volume cible"],
    ["NO_FERMENTER_VOLUME", "fermenteur exploitable"],
  ] as const)(
    "renders the %s fermenter reason as a neutral 'à vérifier' advisory",
    (reason, needle) => {
      const view = describeFit(
        fit({ fermenter: "NOT_EVALUATED", fermenterReason: reason }),
      );
      expect(view.showProfileCta).toBe(false);
      expect(view.fermenter.badgeTone).toBe("neutral");
      expect(view.fermenter.badgeLabel).toBe("À vérifier");
      expect(view.fermenter.message).toContain(needle);
    },
  );

  it.each([
    ["NO_RECIPE_WATER", "volumes d'eau"],
    ["NO_KETTLE_VOLUME", "bouilloire exploitable"],
  ] as const)(
    "renders the %s kettle reason as a neutral advisory",
    (reason, needle) => {
      const view = describeFit(
        fit({ kettle: "NOT_EVALUATED", kettleReason: reason }),
      );
      expect(view.kettle.badgeTone).toBe("neutral");
      expect(view.kettle.message).toContain(needle);
    },
  );
});
