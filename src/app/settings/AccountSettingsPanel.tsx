import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import { Notification } from "../../ui/Notification";
import { PasswordStep } from "../auth/components/PasswordStep";
import { TextField } from "../../ui/TextField";
import { getAuthMethods, getCurrentUserEmail, setPassword, type LoginMethod } from "../../auth/authApi";
import { useTranslation } from "react-i18next";
import { setLanguage, type SupportedLanguage } from "../../i18n";

type MethodItem = {
    method: LoginMethod;
    provider: string;
    linkedAt?: string;
    verified: boolean;
};

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
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const hasPasswordMethod = useMemo(() => methods.some((m) => m.method === "password"), [methods]);

    const loadMethods = useCallback(async () => {
        setBusy(true);
        setErr(null);
        const email = await getCurrentUserEmail();
        setProfileEmail(email);
        try {
            const res = await getAuthMethods();
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

    async function onSetPassword(e: React.FormEvent) {
        e.preventDefault();
        setSavingPassword(true);
        setErr(null);
        setInfo(null);
        try {
            if (newPassword !== confirmPassword) {
                setErr(t("settings.error.passwordMismatch", { defaultValue: "Passwords do not match." }));
                return;
            }
            const res = await setPassword(newPassword);
            if (!res.ok) {
                setErr(res.message);
                return;
            }
            setInfo(t("settings.info.passwordEnabled", { defaultValue: "Password enabled for this account." }));
            setNewPassword("");
            setConfirmPassword("");
            await loadMethods();
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
                    <select
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-sm"
                        value={i18n.language}
                        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                        aria-label={t("settings.languageLabel", { defaultValue: "Language" })}
                    >
                        <option value="en">{t("settings.language.en", { defaultValue: "English" })}</option>
                        <option value="de">{t("settings.language.de", { defaultValue: "Deutsch" })}</option>
                        <option value="ru">{t("settings.language.ru", { defaultValue: "Русский" })}</option>
                    </select>
                </div>
            </div>
            <div className="text-neutral-400 mt-2">
                {t("settings.subtitle", {
                    defaultValue: "Connected sign-in methods and account security settings.",
                })}
            </div>
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">{t("settings.accountEmail", { defaultValue: "Account email" })}</div>
                <div className="text-sm font-medium">{profileEmail ?? t("settings.unavailable", { defaultValue: "Unavailable" })}</div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">
                        {t("settings.connectedMethods", { defaultValue: "Connected sign-in methods" })}
                    </div>
                    <Button variant="link" type="button" onClick={loadMethods} disabled={busy || savingPassword}>
                        {t("settings.refresh", { defaultValue: "Refresh" })}
                    </Button>
                </div>

                {busy ? (
                    <div className="text-sm text-neutral-400">{t("settings.loadingMethods", { defaultValue: "Loading methods..." })}</div>
                ) : methods.length === 0 ? (
                    <div className="text-sm text-neutral-400">{t("settings.noMethods", { defaultValue: "No methods detected yet." })}</div>
                ) : (
                    <div className="space-y-2">
                        {methods.map((item) => (
                            <div
                                key={`${item.provider}-${item.linkedAt ?? "na"}`}
                                className="rounded-xl border border-neutral-800 px-3 py-2 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{t(methodLabel(item.method), { defaultValue: item.method })}</div>
                                    <div className="text-xs text-neutral-400">
                                        {item.linkedAt
                                            ? `${t("settings.linkedAt", { defaultValue: "Linked" })}: ${new Date(item.linkedAt).toLocaleString()}`
                                            : t("settings.linkedAt", { defaultValue: "Linked" })}
                                    </div>
                                </div>
                                <div
                                    className={`text-xs rounded-full px-2 py-1 border ${
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
                        ))}
                    </div>
                )}

                {!hasPasswordMethod && (
                    <form onSubmit={onSetPassword} className="space-y-3 border-t border-neutral-800 pt-4">
                        <div className="text-sm text-neutral-300">
                            {t("settings.socialOnlyHelp", {
                                defaultValue: "This account currently uses social sign-in only. Set a password to enable email login.",
                            })}
                        </div>
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
                    </form>
                )}

                {err && <Notification tone="error" message={err} />}
                {info && <Notification tone="success" message={info} />}
            </div>
        </div>
    );
}
