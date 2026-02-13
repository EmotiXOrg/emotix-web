import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthPage } from "./AuthPage";

// We mock LoginForm so this suite only verifies query->mode parsing logic in AuthPage.
vi.mock("./LoginForm", () => ({
  LoginForm: ({ mode }: { mode: string }) => <div data-testid="login-form-mode">{mode}</div>,
}));

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <AuthPage />
    </MemoryRouter>
  );
}

describe("AuthPage", () => {
  it("defaults to login mode when no mode query is provided", () => {
    renderAt("/auth");

    // Failure here means the default auth entry screen changed unexpectedly.
    expect(screen.getByTestId("login-form-mode")).toHaveTextContent("login");
  });

  it("parses known mode from query string", () => {
    renderAt("/auth?mode=signup");

    // Failure here means URL-driven routing between auth screens is broken.
    expect(screen.getByTestId("login-form-mode")).toHaveTextContent("signup");
  });

  it("falls back to login mode for unknown mode", () => {
    renderAt("/auth?mode=unknown-value");

    // Failure here means invalid mode values are no longer safely normalized.
    expect(screen.getByTestId("login-form-mode")).toHaveTextContent("login");
  });
});
