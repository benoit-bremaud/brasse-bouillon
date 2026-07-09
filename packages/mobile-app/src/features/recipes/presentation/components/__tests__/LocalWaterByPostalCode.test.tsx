import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HttpError } from "@/core/http/http-error";
import {
  loadWaterProfile,
  resolveCommunes,
} from "@/features/recipes/application/water-profile.use-cases";
import { LocalWaterByPostalCode } from "@/features/recipes/presentation/components/LocalWaterByPostalCode";
import type {
  Commune,
  LiveWaterProfile,
} from "@/features/recipes/domain/water-profile.types";

jest.mock("@/features/recipes/application/water-profile.use-cases", () => ({
  ...jest.requireActual(
    "@/features/recipes/application/water-profile.use-cases",
  ),
  resolveCommunes: jest.fn(),
  loadWaterProfile: jest.fn(),
}));

const mockResolve = resolveCommunes as jest.MockedFunction<
  typeof resolveCommunes
>;
const mockLoad = loadWaterProfile as jest.MockedFunction<
  typeof loadWaterProfile
>;

const lille: Commune = {
  codeInsee: "59350",
  nom: "Lille",
  codesPostaux: ["59000"],
};
const lomme: Commune = {
  codeInsee: "59352",
  nom: "Lomme",
  codesPostaux: ["59160"],
};
const profile: LiveWaterProfile = {
  codeInsee: "59350",
  year: 2025,
  networkName: "LILLE",
  sampleCount: 100,
  conformity: "C",
  mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
  hardnessFrench: 125.4,
  freshnessDate: null,
};

function renderComponent() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <LocalWaterByPostalCode />
    </QueryClientProvider>,
  );
}

function submit(postalCode: string) {
  fireEvent.changeText(screen.getByTestId("water-postal-input"), postalCode);
  fireEvent.press(screen.getByTestId("water-resolve-button"));
}

describe("LocalWaterByPostalCode", () => {
  afterEach(() => jest.clearAllMocks());

  it("resolves a single commune and renders its live water profile", async () => {
    mockResolve.mockResolvedValue([lille]);
    mockLoad.mockResolvedValue(profile);
    renderComponent();

    submit("59000");

    expect(await screen.findByTestId("water-profile-panel")).toBeTruthy();
    expect(mockResolve).toHaveBeenCalledWith("59000", expect.anything());
    expect(mockLoad.mock.calls[0][0]).toBe("59350");
  });

  it("forces a commune choice on several communes and keeps the picker to switch", async () => {
    mockResolve.mockResolvedValue([lille, lomme]);
    mockLoad.mockResolvedValue(profile);
    renderComponent();

    submit("59000");

    expect(
      await screen.findByText(/Plusieurs communes partagent ce code postal/),
    ).toBeTruthy();
    expect(mockLoad).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("water-commune-59352"));

    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    expect(mockLoad.mock.calls[0][0]).toBe("59352");
    // The picker stays mounted so the user can switch after a miss.
    expect(screen.getByTestId("water-commune-59350")).toBeTruthy();
  });

  it("does not query on an invalid postal code and shows a hint", () => {
    renderComponent();

    submit("5900");

    expect(
      screen.getByText("Un code postal français comporte 5 chiffres."),
    ).toBeTruthy();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it("tells the user when the postal code is unknown", async () => {
    mockResolve.mockResolvedValue([]);
    renderComponent();

    submit("00000");

    expect(
      await screen.findByText("Code postal inconnu, vérifie ta saisie."),
    ).toBeTruthy();
  });

  it("surfaces a resolver error message", async () => {
    mockResolve.mockRejectedValue(new Error("Service géo indisponible"));
    renderComponent();

    submit("59000");

    expect(await screen.findByText("Service géo indisponible")).toBeTruthy();
  });

  it("shows the French no-data message on a 404 water fetch", async () => {
    mockResolve.mockResolvedValue([lille]);
    mockLoad.mockRejectedValue(
      new HttpError(404, "No data for this city/year"),
    );
    renderComponent();

    submit("59000");

    expect(
      await screen.findByText(
        "Pas de données d'eau disponibles pour cette commune.",
      ),
    ).toBeTruthy();
  });

  it("passes through a non-404 water error message", async () => {
    mockResolve.mockResolvedValue([lille]);
    mockLoad.mockRejectedValue(new Error("Backend indisponible"));
    renderComponent();

    submit("59000");

    expect(await screen.findByText("Backend indisponible")).toBeTruthy();
  });

  it("shows the loading indicator while communes resolve", async () => {
    mockResolve.mockReturnValue(new Promise<Commune[]>(() => {}));
    renderComponent();

    submit("59000");

    expect(await screen.findByTestId("water-communes-loading")).toBeTruthy();
  });

  it("shows the loading indicator while the water profile loads", async () => {
    mockResolve.mockResolvedValue([lille]);
    mockLoad.mockReturnValue(new Promise<LiveWaterProfile>(() => {}));
    renderComponent();

    submit("59000");

    expect(await screen.findByTestId("water-profile-loading")).toBeTruthy();
  });
});
