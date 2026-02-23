import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSettingsPanel } from "./AccountSettingsPanel";

const { getAuthMethodsMock, completePasswordSetupMock, getCurrentUserEmailMock, verifyPasswordSetupCodeMock, startPasswordSetupMock } = vi.hoisted(() => ({
    getAuthMethodsMock: vi.fn(),
    completePasswordSetupMock: vi.fn(),
    getCurrentUserEmailMock: vi.fn(),
    verifyPasswordSetupCodeMock: vi.fn(),
    startPasswordSetupMock: vi.fn(),
}));

vi.mock("../../auth/authApi", () => ({
    getAuthMethods: getAuthMethodsMock,
    completePasswordSetup: completePasswordSetupMock,
    getCurrentUserEmail: getCurrentUserEmailMock,
    verifyPasswordSetupCode: verifyPasswordSetupCodeMock,
    startPasswordSetup: startPasswordSetupMock,
}));

describe("AccountSettingsPanel", () => {
    beforeEach(() => {
        getAuthMethodsMock.mockReset();
        completePasswordSetupMock.mockReset();
        getCurrentUserEmailMock.mockReset();
        verifyPasswordSetupCodeMock.mockReset();
        startPasswordSetupMock.mockReset();
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
        expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    });

    it("shows verify-then-set-password flow when password method is missing", async () => {
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
        startPasswordSetupMock.mockResolvedValue({ ok: true });
        verifyPasswordSetupCodeMock.mockResolvedValue({ ok: true });
        completePasswordSetupMock.mockResolvedValue({ ok: true });

        render(<AccountSettingsPanel />);

        const sendCodeButton = await screen.findByRole("button", { name: "Verify email" });
        await user.click(sendCodeButton);
        await waitFor(() => {
            expect(startPasswordSetupMock).toHaveBeenCalledWith("dev@emotix.net");
        });

        await user.type(screen.getByLabelText("Verification code"), "123456");
        await user.click(screen.getByRole("button", { name: "Verify code" }));

        await waitFor(() => {
            expect(verifyPasswordSetupCodeMock).toHaveBeenCalledWith("dev@emotix.net", "123456");
        });

        const input = await screen.findByLabelText("New password");
        await user.clear(input);
        await user.type(input, "Password123!");
        await user.type(screen.getByLabelText("Confirm password"), "Password123!");
        await user.click(screen.getByRole("button", { name: "Set password" }));

        await waitFor(() => {
            expect(completePasswordSetupMock).toHaveBeenCalledWith("dev@emotix.net", "Password123!");
            expect(screen.getAllByText("Password enabled for this account.").length).toBeGreaterThan(0);
        });
    });
});
