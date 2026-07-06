import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  year: 2024,
  networkName: "LILLE",
  sampleCount: 100,
  conformity: "C",
  mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
  hardnessFrench: 125.4,
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

describe("LocalWaterByPostalCode", () => {
  afterEach(() => jest.clearAllMocks());

  it("resolves a single commune and renders its live water profile", async () => {
    mockResolve.mockResolvedValue([lille]);
    mockLoad.mockResolvedValue(profile);
    renderComponent();

    fireEvent.changeText(screen.getByTestId("water-postal-input"), "59000");
    fireEvent.press(screen.getByTestId("water-resolve-button"));

    expect(await screen.findByText("LILLE")).toBeTruthy();
    expect(mockResolve).toHaveBeenCalledWith("59000", expect.anything());
    expect(mockLoad.mock.calls[0][0]).toBe("59350");
  });

  it("forces a commune choice when the postal code maps to several communes", async () => {
    mockResolve.mockResolvedValue([lille, lomme]);
    mockLoad.mockResolvedValue(profile);
    renderComponent();

    fireEvent.changeText(screen.getByTestId("water-postal-input"), "59000");
    fireEvent.press(screen.getByTestId("water-resolve-button"));

    expect(
      await screen.findByText(/Plusieurs communes partagent ce code postal/),
    ).toBeTruthy();
    expect(mockLoad).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("water-commune-59352"));

    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    expect(mockLoad.mock.calls[0][0]).toBe("59352");
  });

  it("does not query on an invalid postal code and shows a hint", () => {
    renderComponent();

    fireEvent.changeText(screen.getByTestId("water-postal-input"), "5900");
    fireEvent.press(screen.getByTestId("water-resolve-button"));

    expect(
      screen.getByText("Un code postal français comporte 5 chiffres."),
    ).toBeTruthy();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it("tells the user when the postal code is unknown", async () => {
    mockResolve.mockResolvedValue([]);
    renderComponent();

    fireEvent.changeText(screen.getByTestId("water-postal-input"), "00000");
    fireEvent.press(screen.getByTestId("water-resolve-button"));

    expect(
      await screen.findByText("Code postal inconnu, vérifie ta saisie."),
    ).toBeTruthy();
  });

  it("surfaces a resolver error message", async () => {
    mockResolve.mockRejectedValue(new Error("Service géo indisponible"));
    renderComponent();

    fireEvent.changeText(screen.getByTestId("water-postal-input"), "59000");
    fireEvent.press(screen.getByTestId("water-resolve-button"));

    expect(await screen.findByText("Service géo indisponible")).toBeTruthy();
  });
});
