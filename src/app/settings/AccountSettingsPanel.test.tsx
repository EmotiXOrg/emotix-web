import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSettingsPanel } from "./AccountSettingsPanel";

const { getAuthMethodsMock, setPasswordMock, getCurrentUserEmailMock } = vi.hoisted(() => ({
    getAuthMethodsMock: vi.fn(),
    setPasswordMock: vi.fn(),
    getCurrentUserEmailMock: vi.fn(),
}));

vi.mock("../../auth/authApi", () => ({
    getAuthMethods: getAuthMethodsMock,
    setPassword: setPasswordMock,
    getCurrentUserEmail: getCurrentUserEmailMock,
}));

describe("AccountSettingsPanel", () => {
    beforeEach(() => {
        getAuthMethodsMock.mockReset();
        setPasswordMock.mockReset();
        getCurrentUserEmailMock.mockReset();
    });

    it("renders linked methods from backend", async () => {
        getCurrentUserEmailMock.mockResolvedValue("dev@emotix.net");
        getAuthMethodsMock.mockResolvedValue({
            methods: [{ method: "google", provider: "Google", verified: true, linkedAt: "2026-02-16T10:00:00Z" }],
        });

        render(<AccountSettingsPanel />);

        expect(await screen.findByText("Google")).toBeInTheDocument();
        expect(screen.getByText("dev@emotix.net")).toBeInTheDocument();
        expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("shows set-password form when password method is missing and submits", async () => {
        const user = userEvent.setup();
        getCurrentUserEmailMock.mockResolvedValue("dev@emotix.net");
        getAuthMethodsMock
            .mockResolvedValueOnce({
                methods: [{ method: "google", provider: "Google", verified: true }],
            })
            .mockResolvedValueOnce({
                methods: [
                    { method: "google", provider: "Google", verified: true },
                    { method: "password", provider: "COGNITO", verified: true },
                ],
            });
        setPasswordMock.mockResolvedValue({ ok: true });

        render(<AccountSettingsPanel />);

        const input = await screen.findByLabelText("New password");
        await user.type(input, "Password123!");
        await user.type(screen.getByLabelText("Confirm password"), "Password123!");
        await user.click(screen.getByRole("button", { name: "Set password" }));

        await waitFor(() => {
            expect(setPasswordMock).toHaveBeenCalledWith("Password123!");
            expect(screen.getByText("Password enabled for this account.")).toBeInTheDocument();
        });
    });
});
