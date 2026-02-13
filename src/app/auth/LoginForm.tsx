import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInWithRedirect } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { AuthCard } from "./AuthCard";

import {
    nativeConfirm,
    nativeConfirmReset,
    nativeRequestReset,
    nativeResend,
    nativeSignIn,
    nativeSignUp,
} from "../../auth/authApi";

export type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";

const normEmail = (v: string) => v.trim().toLowerCase();

function getQuery(locSearch: string) {
    return new URLSearchParams(locSearch);
}

export function LoginForm(props: { mode: AuthMode }) {
    const nav = useNavigate();
    const loc = useLocation();
    const { t } = useTranslation("auth");

    const emailFromQuery = useMemo(() => getQuery(loc.search).get("email") ?? "", [loc.search]);

    const [email, setEmail] = useState(emailFromQuery);
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Keep email in sync when navigating between modes
    useEffect(() => {
        if (emailFromQuery) setEmail(emailFromQuery);
    }, [emailFromQuery]);

    const title = useMemo(() => {
        switch (props.mode) {
            case "login":
                return t("title", { defaultValue: "Welcome back" });
            case "signup":
                return t("signupTitle", { defaultValue: "Create account" });
            case "verify":
                return t("verifyTitle", { defaultValue: "Verify email" });
            case "forgot":
                return t("forgotTitle", { defaultValue: "Forgot password" });
            case "reset":
                return t("resetTitle", { defaultValue: "Reset password" });
        }
    }, [props.mode, t]);

    const subtitle = useMemo(() => {
        switch (props.mode) {
            case "login":
                return t("subtitle", { defaultValue: "Continue to EmotiX" });
            case "signup":
                return t("signupSubtitle", { defaultValue: "Sign up with email and verify it" });
            case "verify":
                return t("verifySubtitle", { defaultValue: "Enter the code we sent to your email" });
            case "forgot":
                return t("forgotSubtitle", { defaultValue: "We’ll email you a reset code" });
            case "reset":
                return t("resetSubtitle", { defaultValue: "Enter the code and set a new password" });
        }
    }, [props.mode, t]);

    function go(mode: AuthMode, opts?: { email?: string; replace?: boolean }) {
        const params = new URLSearchParams();
        params.set("mode", mode);
        if (opts?.email) params.set("email", opts.email);
        nav(`/auth?${params.toString()}`, { replace: opts?.replace ?? false });
    }

    function setError(message: string) {
        setInfo(null);
        setErr(message);
    }

    function setInformation(message: string) {
        setErr(null);
        setInfo(message);
    }

    async function social(provider: "Google" | "Facebook") {
        setErr(null);
        setInfo(null);
        setBusy(true);
        try {
            await signInWithRedirect({ provider });
            // redirect happens; no further code
        } catch (e: any) {
            setError(e?.message ?? `Failed to redirect to ${provider}`);
            setBusy(false);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setInfo(null);

        const eNorm = normEmail(email);

        setBusy(true);
        try {
            if (props.mode === "login") {
                const r = await nativeSignIn(eNorm, password);
                if (!r.ok) {
                    // Common: user exists but hasn't confirmed email
                    if (r.code === "UserNotConfirmedException") {
                        go("verify", { email: eNorm, replace: true });
                        return;
                    }
                    setError(r.message);
                    return;
                }
                nav("/app", { replace: true });
                return;
            }

            if (props.mode === "signup") {
                const r = await nativeSignUp(eNorm, password);
                if (!r.ok) {
                    // If exists, tell user to login/reset
                    if (r.code === "UsernameExistsException") {
                        setError(
                            t("userExists", {
                                defaultValue: "Account already exists. Try login or reset password.",
                            })
                        );
                        return;
                    }
                    setError(r.message);
                    return;
                }
                go("verify", { email: eNorm, replace: true });
                return;
            }

            if (props.mode === "verify") {
                const r = await nativeConfirm(eNorm, code.trim());
                if (!r.ok) {
                    setError(r.message);
                    return;
                }
                // After verification, send to login (don’t auto-login)
                go("login", { replace: true });
                setInformation(t("verifiedNowLogin", { defaultValue: "Email verified. Please log in." }));
                return;
            }

            if (props.mode === "forgot") {
                // Anti-enumeration: your authApi returns ok:true even if user doesn't exist
                await nativeRequestReset(eNorm);
                go("reset", { email: eNorm, replace: true });
                return;
            }

            if (props.mode === "reset") {
                const r = await nativeConfirmReset(eNorm, code.trim(), newPassword);
                if (!r.ok) {
                    setError(r.message);
                    return;
                }
                go("login", { replace: true });
                setInformation(t("passwordUpdated", { defaultValue: "Password updated. Please log in." }));
                return;
            }
        } finally {
            setBusy(false);
        }
    }

    async function onResendCode() {
        setErr(null);
        setInfo(null);
        setBusy(true);

        try {
            const r = await nativeResend(normEmail(email));
            if (!r.ok) {
                setError(r.message);
                return;
            }
            setInformation(t("codeResent", { defaultValue: "Code resent." }));
        } finally {
            setBusy(false);
        }
    }

    const canSubmit = useMemo(() => {
        if (busy) return false;
        if (!email.trim()) return false;

        if (props.mode === "login" || props.mode === "signup") return !!password;
        if (props.mode === "verify") return !!code.trim();
        if (props.mode === "forgot") return true;
        if (props.mode === "reset") return !!code.trim() && !!newPassword;
        return false;
    }, [busy, email, password, code, newPassword, props.mode]);

    return (
        <AuthCard title={title} subtitle={subtitle}>
            {/* Social buttons only on login (can add to signup if you want) */}
            {props.mode === "login" && (
                <>
                    <div className="space-y-3 mb-6">
                        <button
                            className="w-full rounded-xl bg-neutral-100 text-neutral-900 py-3 font-medium disabled:opacity-60"
                            onClick={() => social("Google")}
                            disabled={busy}
                            type="button"
                        >
                            Continue with Google
                        </button>
                        <button
                            className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-60"
                            onClick={() => social("Facebook")}
                            disabled={busy}
                            type="button"
                        >
                            Continue with Facebook
                        </button>
                    </div>

                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px bg-neutral-800 flex-1" />
                        <div className="text-xs text-neutral-400">or</div>
                        <div className="h-px bg-neutral-800 flex-1" />
                    </div>
                </>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                {(props.mode === "login" || props.mode === "signup") && (
                    <input
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete={props.mode === "login" ? "current-password" : "new-password"}
                    />
                )}

                {props.mode === "verify" && (
                    <input
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                        placeholder="Verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        inputMode="numeric"
                    />
                )}

                {props.mode === "reset" && (
                    <>
                        <input
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                            placeholder="Reset code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            inputMode="numeric"
                        />
                        <input
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />
                    </>
                )}

                {err && <div className="text-sm text-red-400">{err}</div>}
                {info && <div className="text-sm text-emerald-300">{info}</div>}

                <button
                    className="w-full rounded-xl bg-emerald-500 text-neutral-950 py-3 font-semibold disabled:opacity-60"
                    disabled={!canSubmit}
                >
                    {busy ? "Please wait…" : "Continue"}
                </button>
            </form>

            {/* Footer actions */}
            <div className="mt-4 flex items-center justify-between text-sm text-neutral-300">
                {props.mode === "login" && (
                    <>
                        <button className="underline underline-offset-4" onClick={() => go("signup")} disabled={busy} type="button">
                            Create account
                        </button>
                        <button className="underline underline-offset-4" onClick={() => go("forgot")} disabled={busy} type="button">
                            Forgot password
                        </button>
                    </>
                )}

                {props.mode === "signup" && (
                    <>
                        <button className="underline underline-offset-4" onClick={() => go("login")} disabled={busy} type="button">
                            Back to login
                        </button>
                        <span />
                    </>
                )}

                {props.mode === "verify" && (
                    <>
                        <button className="underline underline-offset-4" onClick={() => go("login")} disabled={busy} type="button">
                            Back to login
                        </button>
                        <button
                            className="underline underline-offset-4"
                            onClick={onResendCode}
                            disabled={busy || !email}
                            type="button"
                        >
                            Resend code
                        </button>
                    </>
                )}

                {props.mode === "forgot" && (
                    <>
                        <button className="underline underline-offset-4" onClick={() => go("login")} disabled={busy} type="button">
                            Back to login
                        </button>
                        <span />
                    </>
                )}

                {props.mode === "reset" && (
                    <>
                        <button className="underline underline-offset-4" onClick={() => go("login")} disabled={busy} type="button">
                            Back to login
                        </button>
                        <span />
                    </>
                )}
            </div>
        </AuthCard>
    );
}
