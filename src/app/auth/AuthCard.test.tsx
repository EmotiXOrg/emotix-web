import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthCard } from "./AuthCard";

const { setLanguageMock } = vi.hoisted(() => ({
  setLanguageMock: vi.fn(),
}));

// Mock i18n side-effects so this suite can focus on UI rendering and language switch wiring.
vi.mock("../../i18n", () => ({
  setLanguage: setLanguageMock,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "en",
    },
  }),
}));

describe("AuthCard", () => {
  beforeEach(() => {
    setLanguageMock.mockReset();
  });

  it("renders title, subtitle, and child content", () => {
    render(
      <AuthCard title="Welcome" subtitle="Sign in to continue">
        <div>Child body</div>
      </AuthCard>
    );

    // Failure here usually indicates a regression in shared auth layout contract.
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
    expect(screen.getByText("Child body")).toBeInTheDocument();
  });

  it("calls setLanguage when language is changed", () => {
    render(
      <AuthCard title="Welcome">
        <div>Child body</div>
      </AuthCard>
    );

    const languageSelect = screen.getByRole("combobox");
    fireEvent.change(languageSelect, { target: { value: "de" } });

    // Failure here means language selector changed UI state but did not trigger app i18n change.
    expect(setLanguageMock).toHaveBeenCalledWith("de");
  });
});
