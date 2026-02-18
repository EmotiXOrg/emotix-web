import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { LoginForm } from "./LoginForm";

const {
    navigateMock,
    discoverAuthMethodsMock,
    nativeSignInMock,
    signInWithRedirectMock,
    startPasswordSetupMock,
} = vi.hoisted(() => ({
    navigateMock: vi.fn(),
    discoverAuthMethodsMock: vi.fn(),
    nativeSignInMock: vi.fn(),
    signInWithRedirectMock: vi.fn(),
    startPasswordSetupMock: vi.fn(),
}));

vi.mock("aws-amplify/auth", () => ({
    signInWithRedirect: signInWithRedirectMock,
}));

vi.mock("../../auth/authApi", () => ({
    discoverAuthMethods: discoverAuthMethodsMock,
    nativeConfirm: vi.fn(),
    nativeConfirmReset: vi.fn(),
    nativeRequestReset: vi.fn(),
    nativeResend: vi.fn(),
    nativeSignIn: nativeSignInMock,
    nativeSignUp: vi.fn(),
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
        discoverAuthMethodsMock.mockReset();
        nativeSignInMock.mockReset();
        signInWithRedirectMock.mockReset();
        startPasswordSetupMock.mockReset();
        startPasswordSetupMock.mockResolvedValue({ ok: true });
    });

    it("discovers methods and shows chooser", async () => {
        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue with Facebook" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue with Email" })).toBeInTheDocument();
    });

    it("forces social-only path after wrong password when discovery says social", async () => {
        const user = userEvent.setup();
        discoverAuthMethodsMock.mockResolvedValue({
            email: "dev@emotix.net",
            methods: ["google"],
            nextAction: "social",
        });

        nativeSignInMock.mockResolvedValue({
            ok: false,
            code: "NotAuthorizedException",
            message: "Incorrect username or password.",
        });

        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Continue with Email" }));
        await user.type(screen.getByLabelText("Email"), "dev@emotix.net");
        await user.type(screen.getByLabelText("Password"), "Password123!");
        await user.click(screen.getAllByRole("button", { name: "Continue" }).at(-1)!);

        expect(await screen.findByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Continue with Email" })).not.toBeInTheDocument();
    });

    it("signs in with password after choosing email method", async () => {
        const user = userEvent.setup();
        discoverAuthMethodsMock.mockResolvedValue({
            email: "dev@emotix.net",
            methods: ["password", "google"],
            nextAction: "choose_method",
        });
        nativeSignInMock.mockResolvedValue({ ok: true });

        render(
            <MemoryRouter initialEntries={["/auth?mode=login"]}>
                <LoginForm mode="login" />
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Continue with Email" }));
        await user.type(screen.getByLabelText("Email"), "DEV@emotix.net");
        await user.type(screen.getByLabelText("Password"), "Password123!");
        await user.click(screen.getAllByRole("button", { name: "Continue" }).at(-1)!);

        await waitFor(() => {
            expect(nativeSignInMock).toHaveBeenCalledWith("dev@emotix.net", "Password123!");
            expect(navigateMock).toHaveBeenCalledWith("/app", { replace: true });
        });
    });
});
