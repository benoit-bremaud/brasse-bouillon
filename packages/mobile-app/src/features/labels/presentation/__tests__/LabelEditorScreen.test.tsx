import {
  getLabelDraftById,
  updateLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import { DEFAULT_LABEL_LEGAL_HINT } from "@/features/labels/domain/label.constants";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelEditorScreen } from "@/features/labels/presentation/LabelEditorScreen";
import { buildLabelDraft } from "@/features/labels/test-utils/label-test-fixtures";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/labels/application/labels.use-cases", () => ({
  getLabelDraftById: jest.fn(),
  updateLabelDraft: jest.fn(),
}));

const mockedGetLabelDraftById = getLabelDraftById as jest.MockedFunction<
  typeof getLabelDraftById
>;
const mockedUpdateLabelDraft = updateLabelDraft as jest.MockedFunction<
  typeof updateLabelDraft
>;

describe("LabelEditorScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedGetLabelDraftById.mockReset();
    mockedUpdateLabelDraft.mockReset();
  });

  it("loads, updates and opens details view", async () => {
    const initialDraft = buildLabelDraft();
    const updatedDraft = buildLabelDraft({
      editableFields: {
        ...initialDraft.editableFields,
        name: "Saison révisée",
        subtitle: "Batch spécial",
      },
    });

    mockedGetLabelDraftById.mockResolvedValue(initialDraft);
    mockedUpdateLabelDraft.mockResolvedValue(updatedDraft);

    render(<LabelEditorScreen draftIdParam="draft-1" />);

    expect(await screen.findByDisplayValue("Saison")).toBeTruthy();

    fireEvent.changeText(
      screen.getByLabelText("Modifier le nom de l’étiquette"),
      "Saison révisée",
    );
    fireEvent.changeText(
      screen.getByLabelText("Modifier le sous-titre de l’étiquette"),
      "Batch spécial",
    );

    fireEvent.press(screen.getByLabelText("Enregistrer le brouillon"));

    await waitFor(() => {
      expect(mockedUpdateLabelDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          draftId: "draft-1",
          customName: "Saison révisée",
          customSubtitle: "Batch spécial",
        }),
      );
    });

    expect(await screen.findByText("Brouillon enregistré.")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la fiche du brouillon"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/labels/draft-1");
  });

  // Compliance regression guard — Loi Évin (article L.3323-4 du Code
  // de la santé publique) requires the disclaimer on every alcohol
  // label. The Editor live-preview MUST render the same exact
  // disclaimer that gets saved on the draft. See #634. If this
  // assertion ever breaks, we are shipping a non-compliant editor.
  it("renders the Loi Évin disclaimer in the live preview", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildLabelDraft());

    render(<LabelEditorScreen draftIdParam="draft-1" />);

    // Wait for the editor to mount with the loaded draft.
    await screen.findByDisplayValue("Saison");

    // Imported as a top-level static import (not via mock-bypass)
    // because `domain/label.constants` is the canonical source of
    // truth and is intentionally NOT mocked — see #634 reviewer
    // discussion. Any drift between the constant and the rendered
    // preview is caught here.
    expect(screen.getByText(DEFAULT_LABEL_LEGAL_HINT)).toBeTruthy();
  });

  it("routes back to labels home from header action", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildLabelDraft());

    render(<LabelEditorScreen draftIdParam="draft-1" />);

    expect(await screen.findByDisplayValue("Saison")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à mes étiquettes"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/labels");
  });
});
