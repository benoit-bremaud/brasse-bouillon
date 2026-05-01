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
import { Share } from "react-native";

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

  // Compliance regression guard — Loi Évin (article L.3323-4 du Code
  // de la santé publique) requires the disclaimer on every alcohol
  // label. See #634. If this assertion ever breaks, we are shipping a
  // legally non-compliant rendered label.
  it("renders the Loi Évin disclaimer on the visual preview", async () => {
    const draft = buildLabelDraft();
    mockedGetLabelDraftById.mockResolvedValue(draft);

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    await screen.findByText("Détails du brouillon");

    // Asserts the exact legal-mention text from the snapshot. Using
    // getAllByText because the disclaimer is rendered TWICE on this
    // screen by design:
    //   1. on the visual preview Card (the legally compliant render
    //      that ships to the future PDF / PNG export)
    //   2. inside the "Informations" metadata card (documentation
    //      surface for the user reviewing the saved draft)
    // Asserting `>= 2` catches a regression on EITHER render — if a
    // future change accidentally drops one of the two, this test
    // fails immediately. `>= 1` would silently let one-render
    // regressions through.
    const occurrences = screen.getAllByText(draft.previewSnapshot.legalHint);
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });

  // Issue #629 — KISS scope: a "Partager" button on the details screen
  // hands a text summary of the draft over to the OS share sheet (no
  // PDF / PNG / Print yet — those ship in the follow-up). The button
  // sits between Modifier and Supprimer in the actions row.
  it("shares draft text via the OS share sheet when Partager is pressed", async () => {
    const draft = buildLabelDraft();
    mockedGetLabelDraftById.mockResolvedValue(draft);
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({
      action: Share.sharedAction,
    });

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    expect(await screen.findByText("Saison")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Partager le brouillon"));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
    });
    const [payload] = shareSpy.mock.calls[0];
    expect(payload.title).toBe(draft.previewSnapshot.title);
    expect(payload.message).toContain("🍺 Saison");
    expect(payload.message).toContain(draft.previewSnapshot.legalHint);
    expect(payload.message).toContain(
      "Brouillon partagé depuis Brasse Bouillon",
    );

    shareSpy.mockRestore();
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
