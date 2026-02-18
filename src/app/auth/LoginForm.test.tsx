import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { LoginForm } from "./LoginForm";

const {
    navigateMock,
    nativeSignInMock,
    nativeSignUpMock,
    signInWithRedirectMock,
    startPasswordSetupMock,
} = vi.hoisted(() => ({
    navigateMock: vi.fn(),
    nativeSignInMock: vi.fn(),
    nativeSignUpMock: vi.fn(),
    signInWithRedirectMock: vi.fn(),
    startPasswordSetupMock: vi.fn(),
}));

vi.mock("aws-amplify/auth", () => ({
    signInWithRedirect: signInWithRedirectMock,
}));

vi.mock("../../auth/authApi", () => ({
    nativeConfirm: vi.fn(),
    nativeConfirmReset: vi.fn(),
    nativeRequestReset: vi.fn(),
    nativeResend: vi.fn(),
    nativeSignIn: nativeSignInMock,
    nativeSignUp: nativeSignUpMock,
    startPasswordSetup: startPasswordSetupMock,
    completePasswordSetup: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? "",
    }),
}));

vi.mock("./AuthCard", () => ({
    AuthCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe("LoginForm state machine", () => {
    beforeEach(() => {
        navigateMock.mockReset();
        nativeSignInMock.mockReset();
        nativeSignUpMock.mockReset();
        signInWithRedirectMock.mockReset();
        startPasswordSetupMock.mockReset();
        startPasswordSetupMock.mockResolvedValue({ ok: true });
    });

    it("shows email/password and social options on first login screen", async () => {
        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue with Facebook" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Forgot password" })).toBeInTheDocument();
    });

    it("routes unverified users to setup-password verify flow", async () => {
        const user = userEvent.setup();
        nativeSignInMock.mockResolvedValue({
            ok: false,
            code: "UserNotConfirmedException",
            message: "User is not confirmed.",
        });

        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        await user.type(screen.getByLabelText("Email"), "dev@emotix.net");
        await user.type(screen.getByLabelText("Password"), "Password123!");
        await user.click(screen.getAllByRole("button", { name: "Continue" }).at(-1)!);

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith(
                "/auth?mode=verify&email=dev%40emotix.net&action=setup_password",
                { replace: true }
            );
        });
    });

    it("creates brand-new account from login and routes to verify setup flow", async () => {
        const user = userEvent.setup();
        nativeSignInMock.mockResolvedValue({
            ok: false,
            code: "UserNotFoundException",
            message: "User does not exist.",
        });
        nativeSignUpMock.mockResolvedValue({ ok: true });

        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        await user.type(screen.getByLabelText("Email"), "DEV@emotix.net");
        await user.type(screen.getByLabelText("Password"), "Password123!");
        await user.click(screen.getAllByRole("button", { name: "Continue" }).at(-1)!);

        await waitFor(() => {
            expect(nativeSignInMock).toHaveBeenCalledWith("dev@emotix.net", "Password123!");
            expect(nativeSignUpMock).toHaveBeenCalledWith("dev@emotix.net", "Password123!");
            expect(navigateMock).toHaveBeenCalledWith(
                "/auth?mode=verify&email=dev%40emotix.net&action=setup_password",
                { replace: true }
            );
        });
    });
});
