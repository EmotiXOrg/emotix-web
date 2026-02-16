import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CallbackPage } from "./CallbackPage";

const { navigateMock, getCurrentUserMock, locationSearchMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  getCurrentUserMock: vi.fn(),
  locationSearchMock: vi.fn(() => ""),
}));

// External auth/session and router navigation are mocked to keep callback tests deterministic.
vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ search: locationSearchMock() }),
  };
});

describe("CallbackPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getCurrentUserMock.mockReset();
    locationSearchMock.mockReset();
    locationSearchMock.mockReturnValue("");
  });

  it("redirects to /app when current user is available", async () => {
    getCurrentUserMock.mockResolvedValue({ userId: "123" });

    render(<CallbackPage />);

    // Failure here means successful OAuth callback no longer advances into the protected app.
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/app", { replace: true });
    });
  });

  it("renders error state when auth callback fails", async () => {
    getCurrentUserMock.mockRejectedValue(new Error("Auth callback failed in test"));

    render(<CallbackPage />);

    // Failure here means callback errors are not surfaced to users for troubleshooting.
    expect(await screen.findByText("Login failed")).toBeInTheDocument();
    expect(screen.getByText("Auth callback failed in test")).toBeInTheDocument();
  });

  it("renders oauth error from callback query", async () => {
    locationSearchMock.mockReturnValue("?error=access_denied&error_description=Denied");

    render(<CallbackPage />);

    expect(await screen.findByText("Login failed")).toBeInTheDocument();
    expect(screen.getByText("Denied")).toBeInTheDocument();
  });
});
