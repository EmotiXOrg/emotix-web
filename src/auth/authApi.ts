// src/auth/authApi.ts
import {
    signUp,
    confirmSignUp,
    resendSignUpCode,
    signIn,
    signOut,
    resetPassword,
    confirmResetPassword,
    getCurrentUser,
    fetchUserAttributes,
    fetchAuthSession,
} from "aws-amplify/auth";

export type AuthResult =
    | { ok: true }
    | { ok: false; code?: string; message: string };

export type LoginMethod = "password" | "google" | "facebook";
export type DiscoverNextAction =
    | "signup_or_signin"
    | "password"
    | "choose_method"
    | "social"
    | "needs_verification";

export type AuthDiscoverResponse = {
    email: string;
    methods: LoginMethod[];
    nextAction: DiscoverNextAction;
};

export type AuthMethodsResponse = {
    methods: Array<{
        method: LoginMethod;
        provider: string;
        linkedAt?: string;
        verified: boolean;
        currentlyUsed?: boolean;
    }>;
};

type AuthMethodsCacheEntry = {
    expiresAt: number;
    token: string;
    value: AuthMethodsResponse;
};

type AmplifyErrorLike = {
    name?: unknown;
    message?: unknown;
};

function toAuthError(e: unknown): AuthResult {
    if (e && typeof e === "object" && "name" in e) {
        const err = e as AmplifyErrorLike;
        const code = String(err.name);
        const message = String(err.message ?? "Authentication error");
        return { ok: false, code, message };
    }
    return { ok: false, message: "Authentication error" };
}

function getApiBaseUrl(): string {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, "");
}

const AUTH_METHODS_CACHE_TTL_MS = 60_000;
let authMethodsCache: AuthMethodsCacheEntry | null = null;

export function __resetAuthMethodsCacheForTests() {
    authMethodsCache = null;
}

async function getAccessTokenOrThrow(): Promise<string> {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (!token) {
        throw new Error("No access token available");
    }
    return token;
}

export async function nativeSignUp(email: string, password: string): Promise<AuthResult> {
    try {
        await signUp({
            username: email,
            password,
            options: { userAttributes: { email } },
        });
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function nativeConfirm(email: string, code: string): Promise<AuthResult> {
    try {
        await confirmSignUp({ username: email, confirmationCode: code });
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function nativeResend(email: string): Promise<AuthResult> {
    try {
        await resendSignUpCode({ username: email });
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function nativeSignIn(email: string, password: string): Promise<AuthResult> {
    try {
        await signIn({ username: email, password });
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function nativeRequestReset(email: string): Promise<AuthResult> {
    try {
        await resetPassword({ username: email });
        // IMPORTANT: don't reveal if user exists
        return { ok: true };
    } catch {
        // still return ok to avoid account enumeration UX
        return { ok: true };
    }
}

export async function nativeConfirmReset(
    email: string,
    code: string,
    newPassword: string
): Promise<AuthResult> {
    try {
        await confirmResetPassword({
            username: email,
            confirmationCode: code,
            newPassword,
        });
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function doSignOut(): Promise<AuthResult> {
    try {
        await signOut();
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function isSignedIn(): Promise<boolean> {
    try {
        await getCurrentUser();
        return true;
    } catch {
        return false;
    }
}

export async function debugSession(): Promise<Awaited<ReturnType<typeof fetchAuthSession>>> {
    const s = await fetchAuthSession();
    return s;
}

export async function getCurrentUserEmail(): Promise<string | null> {
    try {
        const attrs = await fetchUserAttributes();
        const email = attrs.email;
        if (typeof email === "string" && email.trim()) {
            return email;
        }
    }
    catch {
        // Fallbacks below.
    }

    try {
        const session = await fetchAuthSession();
        const idTokenEmail = session.tokens?.idToken?.payload?.email;
        if (typeof idTokenEmail === "string" && idTokenEmail.trim()) {
            return idTokenEmail;
        }

        const user = await getCurrentUser();
        const loginId = user.signInDetails?.loginId;
        if (typeof loginId === "string" && loginId.includes("@")) {
            return loginId;
        }
    } catch {
        return null;
    }
    return null;
}

export async function discoverAuthMethods(email: string): Promise<AuthDiscoverResponse> {
    const res = await fetch(`${getApiBaseUrl()}/auth/discover`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        throw new Error("Failed to discover auth methods");
    }
    const data = (await res.json()) as AuthDiscoverResponse;
    return data;
}

export async function getAuthMethods(options?: { forceRefresh?: boolean }): Promise<AuthMethodsResponse> {
    const token = await getAccessTokenOrThrow();
    const now = Date.now();
    // Cache is scoped to the current access token to avoid cross-session leakage.
    if (
        !options?.forceRefresh &&
        authMethodsCache &&
        authMethodsCache.token === token &&
        authMethodsCache.expiresAt > now
    ) {
        return authMethodsCache.value;
    }

    const res = await fetch(`${getApiBaseUrl()}/auth/methods`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to load auth methods");
    }
    const value = (await res.json()) as AuthMethodsResponse;
    authMethodsCache = {
        token,
        value,
        expiresAt: now + AUTH_METHODS_CACHE_TTL_MS,
    };
    return value;
}

export async function setPassword(newPassword: string): Promise<AuthResult> {
    try {
        const token = await getAccessTokenOrThrow();
        const res = await fetch(`${getApiBaseUrl()}/auth/set-password`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ newPassword }),
        });
        if (!res.ok) {
            return { ok: false, message: "Failed to set password" };
        }
        authMethodsCache = null;
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function startPasswordSetup(email: string): Promise<AuthResult> {
    try {
        const res = await fetch(`${getApiBaseUrl()}/auth/password-setup/start`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            return { ok: false, message: "Unable to start verification flow" };
        }
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}

export async function completePasswordSetup(
    email: string,
    code: string,
    newPassword: string
): Promise<AuthResult> {
    try {
        const res = await fetch(`${getApiBaseUrl()}/auth/password-setup/complete`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ email, code, newPassword }),
        });
        if (!res.ok) {
            return { ok: false, message: "Unable to verify email or set password" };
        }
        return { ok: true };
    } catch (e) {
        return toAuthError(e);
    }
}
