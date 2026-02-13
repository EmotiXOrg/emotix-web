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
    fetchAuthSession,
} from "aws-amplify/auth";

export type AuthResult =
    | { ok: true }
    | { ok: false; code?: string; message: string };

function toAuthError(e: unknown): AuthResult {
    if (e && typeof e === "object" && "name" in e) {
        const code = String((e as any).name);
        const message = String((e as any).message ?? "Authentication error");
        return { ok: false, code, message };
    }
    return { ok: false, message: "Authentication error" };
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
    } catch (e) {
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

export async function debugSession(): Promise<any> {
    const s = await fetchAuthSession();
    return s;
}
