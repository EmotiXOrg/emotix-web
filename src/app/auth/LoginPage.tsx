import { useState } from "react";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLanguage, type SupportedLanguage } from "../../i18n";


export function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const { t, i18n } = useTranslation("auth");

    async function onEmailLogin(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            await signIn({ username: email, password });
            nav("/app", { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? "Login failed");
        } finally {
            setBusy(false);
        }
    }

    async function social(provider: "Google" | "Facebook") {
        setErr(null);
        setBusy(true);
        try {
            await signInWithRedirect({ provider });
        } catch (e: any) {
            setErr(e?.message ?? `Failed to redirect to ${provider}`);
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-2xl font-semibold">{t("title")}</div>
                        <div className="text-sm text-neutral-300">{t("subtitle")}</div>
                    </div>

                    <select
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-sm"
                        value={i18n.language}
                        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    >
                        <option value="en">EN</option>
                        <option value="de">DE</option>
                        <option value="ru">RU</option>
                    </select>
                </div>

                <div className="space-y-3 mb-6">
                    <button
                        className="w-full rounded-xl bg-neutral-100 text-neutral-900 py-3 font-medium disabled:opacity-60"
                        onClick={() => social("Google")}
                        disabled={busy}
                    >
                        Continue with Google
                    </button>
                    <button
                        className="w-full rounded-xl bg-blue-600 py-3 font-medium disabled:opacity-60"
                        onClick={() => social("Facebook")}
                        disabled={busy}
                    >
                        Continue with Facebook
                    </button>
                </div>

                <div className="flex items-center gap-3 my-6">
                    <div className="h-px bg-neutral-800 flex-1" />
                    <div className="text-xs text-neutral-400">or</div>
                    <div className="h-px bg-neutral-800 flex-1" />
                </div>

                <form onSubmit={onEmailLogin} className="space-y-3">
                    <input
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <input
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete="current-password"
                    />
                    {err && <div className="text-sm text-red-400">{err}</div>}
                    <button
                        className="w-full rounded-xl bg-emerald-500 text-neutral-950 py-3 font-semibold disabled:opacity-60"
                        disabled={busy || !email || !password}
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
