import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInWithRedirect } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { AuthCard } from "./AuthCard";
import { Button } from "../../ui/Button";
import { TextField } from "../../ui/TextField";
import { Notification } from "../../ui/Notification";
import { MethodChooser } from "./components/MethodChooser";
import { EmailStep } from "./components/EmailStep";
import { PasswordStep } from "./components/PasswordStep";
import { SocialButtons } from "./components/SocialButtons";

import {
    discoverAuthMethods,
    nativeConfirm,
    nativeConfirmReset,
    nativeRequestReset,
    nativeResend,
    nativeSignIn,
    nativeSignUp,
    type LoginMethod,
} from "../../auth/authApi";

export type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";
type LoginState =
    | "choose_method"
    | "password_login"
    | "social_only";

const normEmail = (v: string) => v.trim().toLowerCase();

function getErrorMessage(err: unknown, fallback: string) {
    if (err && typeof err === "object" && "message" in err) {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }
    return fallback;
}

function getQuery(locSearch: string) {
    return new URLSearchParams(locSearch);
}

function socialMethodsFrom(methods: LoginMethod[]): Array<"google" | "facebook"> {
    return methods.filter((m): m is "google" | "facebook" => m === "google" || m === "facebook");
}

function fallbackMethods(methods: LoginMethod[]): LoginMethod[] {
    if (methods.length > 0) return methods;
    return ["password", "google", "facebook"];
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
    const [loginState, setLoginState] = useState<LoginState>("choose_method");
    const [discoveredMethods, setDiscoveredMethods] = useState<LoginMethod[]>([]);

    useEffect(() => {
        if (emailFromQuery) setEmail(emailFromQuery);
    }, [emailFromQuery]);

    useEffect(() => {
        if (props.mode === "login") {
            setLoginState("choose_method");
            setDiscoveredMethods([]);
            setPassword("");
        }
    }, [props.mode]);

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
                return t("subtitle", { defaultValue: "Choose a sign-in method" });
            case "signup":
                return t("signupSubtitle", { defaultValue: "Sign up with email and verify it" });
            case "verify":
                return t("verifySubtitle", { defaultValue: "Enter the code we sent to your email" });
            case "forgot":
                return t("forgotSubtitle", { defaultValue: "We'll email you a reset code" });
            case "reset":
                return t("resetSubtitle", { defaultValue: "Enter the code and set a new password" });
        }
    }, [props.mode, t]);

    function go(mode: AuthMode, opts?: { email?: string; replace?: boolean }) {
        const params = new URLSearchParams();
        params.set("mode", mode);
        if (opts?.email) {
            params.set("email", opts.email);
        }
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
        } catch (socialError) {
            setError(getErrorMessage(socialError, `Failed to redirect to ${provider}`));
            setBusy(false);
        }
    }

    async function runDiscoverForGuidance() {
        const eNorm = normEmail(email);
        if (!eNorm) return;

        try {
            const discovered = await discoverAuthMethods(eNorm);
            const methods = fallbackMethods(discovered.methods);
            setDiscoveredMethods(methods);
            if (discovered.nextAction === "social") {
                setLoginState("social_only");
                setInformation(
                    t("socialOnlyHint", {
                        defaultValue: "This account uses social sign-in. Continue with your linked provider.",
                    })
                );
                return true;
            }
            return false;
        } catch {
            setDiscoveredMethods(["password", "google", "facebook"]);
            return false;
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
                const result = await nativeSignIn(eNorm, password);
                if (!result.ok) {
                    if (result.code === "UserNotConfirmedException") {
                        go("verify", { email: eNorm, replace: true });
                        return;
                    }
                    if (
                        result.code === "NotAuthorizedException" &&
                        (discoveredMethods.length === 0 || discoveredMethods.includes("password"))
                    ) {
                        const socialOnly = await runDiscoverForGuidance();
                        if (socialOnly) {
                            setError(
                                t("wrongMethodUseSocial", {
                                    defaultValue:
                                        "This email is linked to social sign-in. Continue with Google/Facebook, then set password in Profile.",
                                })
                            );
                            return;
                        }
                    }
                    setError(result.message);
                    return;
                }
                nav("/app", { replace: true });
                return;
            }

            if (props.mode === "signup") {
                const result = await nativeSignUp(eNorm, password);
                if (!result.ok) {
                    if (result.code === "UsernameExistsException") {
                        setError(
                            t("userExists", {
                                defaultValue: "Account already exists. Try login or reset password.",
                            })
                        );
                        return;
                    }
                    setError(result.message);
                    return;
                }
                go("verify", { email: eNorm, replace: true });
                return;
            }

            if (props.mode === "verify") {
                const result = await nativeConfirm(eNorm, code.trim());
                if (!result.ok) {
                    setError(result.message);
                    return;
                }
                go("login", { replace: true });
                setInformation(t("verifiedNowLogin", { defaultValue: "Email verified. Please log in." }));
                return;
            }

            if (props.mode === "forgot") {
                await nativeRequestReset(eNorm);
                go("reset", { email: eNorm, replace: true });
                return;
            }

            if (props.mode === "reset") {
                const result = await nativeConfirmReset(eNorm, code.trim(), newPassword);
                if (!result.ok) {
                    setError(result.message);
                    return;
                }
                go("login", { replace: true });
                setInformation(t("passwordUpdated", { defaultValue: "Password updated. Please log in." }));
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
            const result = await nativeResend(normEmail(email));
            if (!result.ok) {
                setError(result.message);
                return;
            }
            setInformation(t("codeResent", { defaultValue: "Code resent." }));
        } finally {
            setBusy(false);
        }
    }

    const canSubmit = useMemo(() => {
        if (busy) return false;
        if (props.mode === "login") return loginState === "password_login" && !!email.trim() && !!password;
        if (props.mode === "signup") return !!password;
        if (props.mode === "verify") return !!code.trim();
        if (props.mode === "forgot") return true;
        if (props.mode === "reset") return !!code.trim() && !!newPassword;
        return false;
    }, [busy, code, email, loginState, newPassword, password, props.mode]);

    const socialOnlyMethods = socialMethodsFrom(discoveredMethods);
    const showLoginEmail = props.mode === "login" && loginState === "password_login";
    const chooserMethods: LoginMethod[] =
        discoveredMethods.length > 0 ? fallbackMethods(discoveredMethods) : ["password", "google", "facebook"];

    return (
        <AuthCard title={title} subtitle={subtitle}>
            {props.mode === "login" && (
                <div className="space-y-3 mb-4 motion-fade-slide">
                    {showLoginEmail && <EmailStep email={email} onEmailChange={setEmail} />}

                    {loginState === "choose_method" && (
                        <MethodChooser
                            busy={busy}
                            methods={chooserMethods}
                            onChoosePassword={() => {
                                setErr(null);
                                setInfo(null);
                                setLoginState("password_login");
                            }}
                            onChooseSocial={social}
                        />
                    )}

                    {loginState === "social_only" && (
                        <SocialButtons busy={busy} methods={socialOnlyMethods} onClick={social} />
                    )}

                </div>
            )}

            {err && <Notification tone="error" message={err} />}
            {info && <Notification tone="success" message={info} />}

            {(props.mode !== "login" || loginState === "password_login") && (
                <div key={props.mode} className="motion-fade-slide">
                    <form onSubmit={onSubmit} className="space-y-3">
                        {props.mode !== "login" && <EmailStep email={email} onEmailChange={setEmail} />}

                        {(props.mode === "login" || props.mode === "signup") && (
                            <PasswordStep password={password} onPasswordChange={setPassword} mode={props.mode} />
                        )}

                        {props.mode === "verify" && (
                            <TextField
                                label={t("verificationCode", { defaultValue: "Verification code" })}
                                placeholder={t("verificationCode", { defaultValue: "Verification code" })}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                inputMode="numeric"
                            />
                        )}

                        {props.mode === "reset" && (
                            <>
                                <TextField
                                    label={t("resetCode", { defaultValue: "Reset code" })}
                                    placeholder={t("resetCode", { defaultValue: "Reset code" })}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    inputMode="numeric"
                                />
                                <PasswordStep
                                    password={newPassword}
                                    onPasswordChange={setNewPassword}
                                    mode="reset"
                                    label={t("newPassword", { defaultValue: "New password" })}
                                />
                            </>
                        )}

                        <Button fullWidth disabled={!canSubmit} type="submit">
                            {busy
                                ? t("pleaseWait", { defaultValue: "Please wait..." })
                                : t("continue", { defaultValue: "Continue" })}
                        </Button>
                    </form>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-neutral-300">
                {props.mode === "login" && (
                    <>
                        <Button
                            variant="link"
                            onClick={() => {
                                setErr(null);
                                setInfo(null);
                                setPassword("");
                                setLoginState("choose_method");
                            }}
                            disabled={busy}
                            type="button"
                        >
                            {t("back", { defaultValue: "Back" })}
                        </Button>
                        <Button variant="link" onClick={() => go("forgot", { email: normEmail(email) })} disabled={busy} type="button">
                            {t("forgotPassword", { defaultValue: "Forgot password" })}
                        </Button>
                    </>
                )}

                {props.mode === "signup" && (
                    <>
                        <Button variant="link" onClick={() => go("login")} disabled={busy} type="button">
                            {t("backToLogin", { defaultValue: "Back to login" })}
                        </Button>
                        <span />
                    </>
                )}

                {props.mode === "verify" && (
                    <>
                        <Button variant="link" onClick={() => go("login")} disabled={busy} type="button">
                            {t("backToLogin", { defaultValue: "Back to login" })}
                        </Button>
                        <Button variant="link" onClick={onResendCode} disabled={busy || !email} type="button">
                            {t("resendCode", { defaultValue: "Resend code" })}
                        </Button>
                    </>
                )}

                {props.mode === "forgot" && (
                    <>
                        <Button variant="link" onClick={() => go("login")} disabled={busy} type="button">
                            {t("backToLogin", { defaultValue: "Back to login" })}
                        </Button>
                        <span />
                    </>
                )}

                {props.mode === "reset" && (
                    <>
                        <Button variant="link" onClick={() => go("login")} disabled={busy} type="button">
                            {t("backToLogin", { defaultValue: "Back to login" })}
                        </Button>
                        <span />
                    </>
                )}
            </div>
        </AuthCard>
    );
}
