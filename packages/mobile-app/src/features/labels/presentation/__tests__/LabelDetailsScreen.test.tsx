import {
  getLabelDraftById,
  removeLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelDetailsScreen } from "@/features/labels/presentation/LabelDetailsScreen";
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
  removeLabelDraft: jest.fn(),
}));

const mockedGetLabelDraftById = getLabelDraftById as jest.MockedFunction<
  typeof getLabelDraftById
>;
const mockedRemoveLabelDraft = removeLabelDraft as jest.MockedFunction<
  typeof removeLabelDraft
>;

describe("LabelDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedGetLabelDraftById.mockReset();
    mockedRemoveLabelDraft.mockReset();
  });

  it("renders draft details and opens editor", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildLabelDraft());

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    expect(await screen.findByText("Détails du brouillon")).toBeTruthy();
    expect(screen.getByText("Saison")).toBeTruthy();
    expect(screen.getByText("Informations")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Modifier le brouillon"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/dashboard/labels/create/editor",
      params: { draftId: "draft-1" },
    });
  });

  it("deletes draft and routes to labels home", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildLabelDraft());
    mockedRemoveLabelDraft.mockResolvedValue(undefined);

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    expect(await screen.findByText("Saison")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Supprimer le brouillon"));

    await waitFor(() => {
      expect(mockedRemoveLabelDraft).toHaveBeenCalledWith("draft-1");
    });

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/labels");
  });
});
