import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import { Notification } from "../../ui/Notification";
import { PasswordStep } from "../auth/components/PasswordStep";
import { getAuthMethods, setPassword, type LoginMethod } from "../../auth/authApi";

type MethodItem = {
    method: LoginMethod;
    provider: string;
    linkedAt?: string;
    verified: boolean;
};

function methodLabel(method: LoginMethod) {
    if (method === "password") return "Email + Password";
    if (method === "google") return "Google";
    return "Facebook";
}

export function AccountSettingsPanel() {
    const [busy, setBusy] = useState(true);
    const [savingPassword, setSavingPassword] = useState(false);
    const [methods, setMethods] = useState<MethodItem[]>([]);
    const [newPassword, setNewPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const hasPasswordMethod = useMemo(() => methods.some((m) => m.method === "password"), [methods]);

    async function loadMethods() {
        setBusy(true);
        setErr(null);
        try {
            const res = await getAuthMethods();
            setMethods(res.methods);
        } catch {
            setErr("Failed to load linked sign-in methods.");
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        void loadMethods();
    }, []);

    async function onSetPassword(e: React.FormEvent) {
        e.preventDefault();
        setSavingPassword(true);
        setErr(null);
        setInfo(null);
        try {
            const res = await setPassword(newPassword);
            if (!res.ok) {
                setErr(res.message);
                return;
            }
            setInfo("Password enabled for this account.");
            setNewPassword("");
            await loadMethods();
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <div className="p-4 pb-24 motion-fade-slide">
            <div className="text-2xl font-semibold">Profile</div>
            <div className="text-neutral-400 mt-2">Connected sign-in methods and account security settings.</div>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">Connected sign-in methods</div>
                    <Button variant="link" type="button" onClick={loadMethods} disabled={busy || savingPassword}>
                        Refresh
                    </Button>
                </div>

                {busy ? (
                    <div className="text-sm text-neutral-400">Loading methods...</div>
                ) : methods.length === 0 ? (
                    <div className="text-sm text-neutral-400">No methods detected yet.</div>
                ) : (
                    <div className="space-y-2">
                        {methods.map((item) => (
                            <div
                                key={`${item.provider}-${item.linkedAt ?? "na"}`}
                                className="rounded-xl border border-neutral-800 px-3 py-2 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{methodLabel(item.method)}</div>
                                    <div className="text-xs text-neutral-400">
                                        {item.linkedAt ? `Linked: ${new Date(item.linkedAt).toLocaleString()}` : "Linked"}
                                    </div>
                                </div>
                                <div
                                    className={`text-xs rounded-full px-2 py-1 border ${
                                        item.verified
                                            ? "border-emerald-500/60 text-emerald-300"
                                            : "border-amber-500/60 text-amber-300"
                                    }`}
                                >
                                    {item.verified ? "Verified" : "Unverified"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!hasPasswordMethod && (
                    <form onSubmit={onSetPassword} className="space-y-3 border-t border-neutral-800 pt-4">
                        <div className="text-sm text-neutral-300">
                            This account currently uses social sign-in only. Set a password to enable email login.
                        </div>
                        <PasswordStep
                            password={newPassword}
                            onPasswordChange={setNewPassword}
                            mode="reset"
                            label="New password"
                        />
                        <Button type="submit" fullWidth disabled={savingPassword || newPassword.length < 10}>
                            {savingPassword ? "Please wait..." : "Set password"}
                        </Button>
                    </form>
                )}

                {err && <Notification tone="error" message={err} />}
                {info && <Notification tone="success" message={info} />}
            </div>
        </div>
    );
}
