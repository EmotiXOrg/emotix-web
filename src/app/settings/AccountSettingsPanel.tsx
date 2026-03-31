import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button";
import { LanguageSelect } from "../../ui/LanguageSelect";
import { Notification } from "../../ui/Notification";
import { PasswordStep } from "../auth/components/PasswordStep";
import { TextField } from "../../ui/TextField";
import { Skeleton, SkeletonText } from "../../ui/Skeleton";
import {
    completePasswordSetup,
    getAuthMethods,
    getCurrentUserEmail,
    startPasswordSetup,
    type LoginMethod,
    verifyPasswordSetupCode,
} from "../../auth/authApi";
import { buildInfo } from "../buildInfo";

type MethodItem = {
    method: LoginMethod;
    provider: string;
    linkedAt?: string;
    verified: boolean;
};

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 5;

function methodLabel(method: LoginMethod) {
    if (method === "password") return "settings.method.password";
    if (method === "google") return "settings.method.google";
    return "settings.method.facebook";
}

export function AccountSettingsPanel() {
    const { t, i18n } = useTranslation("common");
    const [busy, setBusy] = useState(true);
    const [savingPassword, setSavingPassword] = useState(false);
    const [methods, setMethods] = useState<MethodItem[]>([]);
    const [profileEmail, setProfileEmail] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [passwordSetupStep, setPasswordSetupStep] = useState<"intro" | "code" | "password">("intro");
    const [sendingVerificationCode, setSendingVerificationCode] = useState(false);
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
    const [resendAttempts, setResendAttempts] = useState(0);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const hasPasswordMethod = useMemo(() => methods.some((m) => m.method === "password"), [methods]);

    const loadMethods = useCallback(async (options?: { forceRefresh?: boolean }) => {
        setBusy(true);
        setErr(null);
        const email = await getCurrentUserEmail();
        setProfileEmail(email);
        try {
            const res = await getAuthMethods(options);
            setMethods(res.methods);
        } catch {
            setErr(t("settings.error.load", { defaultValue: "Failed to load linked sign-in methods." }));
        } finally {
            setBusy(false);
        }
    }, [t]);

    useEffect(() => {
        void loadMethods();
    }, [loadMethods]);

    useEffect(() => {
        if (resendCooldownSeconds <= 0) {
            return;
        }
        const timer = window.setInterval(() => {
            setResendCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [resendCooldownSeconds]);

    async function onSendVerificationCode() {
        if (!profileEmail) {
            setErr(t("settings.error.missingEmail", { defaultValue: "Account email is unavailable." }));
            return;
        }
        if (resendCooldownSeconds > 0) {
            return;
        }
        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
            setErr(
                t("settings.error.tooManyResendAttempts", {
                    defaultValue: "Too many resend attempts. Please wait a few minutes and try again.",
                })
            );
            return;
        }

        setSendingVerificationCode(true);
        setErr(null);
        setInfo(null);
        try {
            const res = await startPasswordSetup(profileEmail);
            if (!res.ok) {
                setErr(res.message);
                return;
            }
            setResendAttempts((prev) => prev + 1);
            setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
            setInfo(t("settings.info.verificationCodeSent", { defaultValue: "Verification code sent." }));
            setPasswordSetupStep("code");
        } finally {
            setSendingVerificationCode(false);
        }
    }

    async function onSetPassword(e: React.FormEvent) {
        e.preventDefault();
        setSavingPassword(true);
        setErr(null);
        setInfo(null);
        try {
            if (!profileEmail) {
                setErr(t("settings.error.missingEmail", { defaultValue: "Account email is unavailable." }));
                return;
            }

            if (passwordSetupStep === "intro") {
                await onSendVerificationCode();
                return;
            }

            if (passwordSetupStep === "code") {
                const verify = await verifyPasswordSetupCode(profileEmail, verificationCode.trim());
                if (!verify.ok) {
                    setErr(verify.message);
                    return;
                }
                setPasswordSetupStep("password");
                setInfo(t("settings.info.emailVerified", { defaultValue: "Email verified. Now set your password." }));
                return;
            }

            if (newPassword !== confirmPassword) {
                setErr(t("settings.error.passwordMismatch", { defaultValue: "Passwords do not match." }));
                return;
            }
            const res = await completePasswordSetup(profileEmail, newPassword);
            if (!res.ok) {
                setErr(res.message);
                setPasswordSetupStep("intro");
                setVerificationCode("");
                return;
            }
            setInfo(t("settings.info.passwordEnabled", { defaultValue: "Password enabled for this account." }));
            setVerificationCode("");
            setPasswordSetupStep("intro");
            setNewPassword("");
            setConfirmPassword("");
            setResendCooldownSeconds(0);
            setResendAttempts(0);
            await loadMethods({ forceRefresh: true });
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <div className="p-4 pb-24 motion-fade-slide">
            <div className="flex items-start justify-between gap-4">
                <div className="text-2xl font-semibold">{t("nav.profile", { defaultValue: "Profile" })}</div>
                <div className="space-y-1">
                    <div className="text-xs text-neutral-400">{t("settings.languageLabel", { defaultValue: "Language" })}</div>
                    <LanguageSelect
                        className="min-w-[8.5rem] rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm normal-case tracking-normal"
                        value={i18n.language}
                        ariaLabel={t("settings.languageLabel", { defaultValue: "Language" })}
                    />
                </div>
            </div>
            <div className="mt-2 text-neutral-400">
                {t("settings.subtitle", {
                    defaultValue: "Connected sign-in methods and account security settings.",
                })}
            </div>
            <div className="mt-6 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">
                        {t("settings.connectedMethods", { defaultValue: "Connected sign-in methods" })}
                    </div>
                    <Button
                        variant="link"
                        type="button"
                        onClick={() => void loadMethods({ forceRefresh: true })}
                        disabled={busy || savingPassword}
                    >
                        {t("settings.refresh", { defaultValue: "Refresh" })}
                    </Button>
                </div>

                {busy ? (
                    <div className="space-y-2">
                        <div className="rounded-xl border border-neutral-800 px-3 py-2">
                            <SkeletonText lines={2} />
                        </div>
                        <div className="rounded-xl border border-neutral-800 px-3 py-2">
                            <SkeletonText lines={2} />
                        </div>
                        <Skeleton className="h-9 w-28" />
                    </div>
                ) : methods.length === 0 ? (
                    <div className="text-sm text-neutral-400">{t("settings.noMethods", { defaultValue: "No methods detected yet." })}</div>
                ) : (
                    <div className="space-y-2">
                        {methods.map((item) => (
                            <div
                                key={`${item.provider}-${item.linkedAt ?? "na"}`}
                                className="flex items-center justify-between rounded-xl border border-neutral-800 px-3 py-2"
                            >
                                <div>
                                    <div className="font-medium">{t(methodLabel(item.method), { defaultValue: item.method })}</div>
                                    <div className="text-xs text-neutral-400">
                                        {item.linkedAt
                                            ? `${t("settings.linkedAt", { defaultValue: "Linked at" })}: ${new Date(item.linkedAt).toLocaleString()}`
                                            : t("settings.linkedAt", { defaultValue: "Linked at" })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`rounded-full border px-2 py-1 text-xs ${
                                            item.verified
                                                ? "border-emerald-500/60 text-emerald-300"
                                                : "border-amber-500/60 text-amber-300"
                                        }`}
                                    >
                                        {item.verified
                                            ? t("settings.verified", { defaultValue: "Verified" })
                                            : t("settings.unverified", { defaultValue: "Unverified" })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-neutral-800 pt-4">
                    <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                        <div className="text-base font-medium">{t("settings.emailLoginTitle", { defaultValue: "Email login" })}</div>
                        <div>
                            <div className="text-xs text-neutral-400">{t("settings.accountEmail", { defaultValue: "Account email" })}</div>
                            <div className="text-sm font-medium">{profileEmail ?? t("settings.unavailable", { defaultValue: "Unavailable" })}</div>
                        </div>
                        {hasPasswordMethod ? (
                            <div className="text-sm text-emerald-300">
                                {t("settings.info.passwordEnabled", { defaultValue: "Password enabled for this account." })}
                            </div>
                        ) : (
                            <form onSubmit={onSetPassword} className="space-y-3">
                                {passwordSetupStep === "intro" && (
                                    <>
                                        <div className="text-sm text-neutral-300">
                                            {t("settings.socialOnlyHelp", {
                                                defaultValue: "Verify your email to enable login with email and password.",
                                            })}
                                        </div>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={savingPassword || sendingVerificationCode || !profileEmail}
                                        >
                                            {savingPassword || sendingVerificationCode
                                                ? t("auth:pleaseWait", { defaultValue: "Please wait..." })
                                                : t("settings.verifyEmail", { defaultValue: "Verify email" })}
                                        </Button>
                                    </>
                                )}
                                {passwordSetupStep === "code" && (
                                    <>
                                        <TextField
                                            label={t("auth:verificationCode", { defaultValue: "Verification code" })}
                                            placeholder={t("auth:verificationCode", { defaultValue: "Verification code" })}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            inputMode="numeric"
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={savingPassword || verificationCode.trim().length === 0}
                                        >
                                            {savingPassword
                                                ? t("auth:pleaseWait", { defaultValue: "Please wait..." })
                                                : t("settings.verifyCode", { defaultValue: "Verify code" })}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={() => void onSendVerificationCode()}
                                            disabled={sendingVerificationCode || savingPassword || resendCooldownSeconds > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
                                        >
                                            {resendCooldownSeconds > 0
                                                ? t("auth:resendCodeCooldown", {
                                                    defaultValue: "Resend code in {{seconds}}s",
                                                    seconds: resendCooldownSeconds,
                                                })
                                                : t("settings.sendCodeAgain", { defaultValue: "Send code again" })}
                                        </Button>
                                    </>
                                )}
                                {passwordSetupStep === "password" && (
                                    <>
                                        <PasswordStep
                                            password={newPassword}
                                            onPasswordChange={setNewPassword}
                                            mode="reset"
                                            label={t("settings.newPassword", { defaultValue: "New password" })}
                                        />
                                        <TextField
                                            label={t("settings.confirmPassword", { defaultValue: "Confirm password" })}
                                            placeholder={t("settings.confirmPassword", { defaultValue: "Confirm password" })}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            type="password"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={savingPassword || newPassword.length < 10 || confirmPassword.length < 10}
                                        >
                                            {savingPassword
                                                ? t("auth:pleaseWait", { defaultValue: "Please wait..." })
                                                : t("settings.setPassword", { defaultValue: "Set password" })}
                                        </Button>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                </div>

                {err && <Notification tone="error" message={err} />}
                {info && <Notification tone="success" message={info} />}
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="text-sm font-medium">{t("settings.buildInfo", { defaultValue: "Build info" })}</div>
                <div className="mt-2 space-y-1 text-xs text-neutral-400">
                    <div>stage: {buildInfo.stage}</div>
                    <div>web version: {buildInfo.appVersion}</div>
                    <div>build number: {buildInfo.buildNumber}</div>
                    <div>git sha: {buildInfo.gitSha}</div>
                    <div>deployed at: {buildInfo.deployedAt}</div>
                </div>
            </div>
        </div>
    );
}
