import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { exportPersonalData } from "@/features/profile/application/personal-data-export.use-cases";
import { ExportDataScreen } from "../ExportDataScreen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/export",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock(
  "@/features/profile/application/personal-data-export.use-cases",
  () => ({
    exportPersonalData: jest.fn(),
  }),
);

const mockedExportPersonalData = jest.mocked(exportPersonalData);

describe("ExportDataScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockedExportPersonalData.mockReset();
    mockedExportPersonalData.mockResolvedValue("file:///documents/export.json");
  });

  it("generates and shares the complete export on the happy path", async () => {
    // Arrange
    render(<ExportDataScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Exporter et partager mes données"));

    // Assert
    await waitFor(() => {
      expect(mockedExportPersonalData).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText("Export partagé")).toBeTruthy();
    });
  });

  it("shows the export error and keeps the user on the screen", async () => {
    // Arrange
    mockedExportPersonalData.mockRejectedValueOnce(
      new Error("Export indisponible"),
    );
    render(<ExportDataScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Exporter et partager mes données"));

    // Assert
    expect(await screen.findByText("Export indisponible")).toBeTruthy();
    expect(mockedExportPersonalData).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Export de mes données")).toBeTruthy();
  });

  it("ignores a second tap while the first export is running", async () => {
    // Arrange
    let resolveExport: ((value: string) => void) | undefined;
    mockedExportPersonalData.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveExport = resolve;
      }),
    );
    render(<ExportDataScreen />);
    const exportButton = screen.getByLabelText(
      "Exporter et partager mes données",
    );

    // Act
    fireEvent.press(exportButton);
    fireEvent.press(exportButton);
    resolveExport?.("file:///documents/export.json");

    // Assert
    await waitFor(() => {
      expect(mockedExportPersonalData).toHaveBeenCalledTimes(1);
    });
  });
});
