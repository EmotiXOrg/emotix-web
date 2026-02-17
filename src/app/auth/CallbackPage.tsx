import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function getErrorMessage(err: unknown, fallback: string) {
    if (err && typeof err === "object" && "message" in err) {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }
    return fallback;
}

export function CallbackPage() {
    const { t } = useTranslation("auth");
    const nav = useNavigate();
    const loc = useLocation();
    const [err, setErr] = useState<string | null>(null);
    const [message, setMessage] = useState(t("callback.finishing", { defaultValue: "Finishing sign-in..." }));

    useEffect(() => {
        (async () => {
            const sp = new URLSearchParams(loc.search);
            const oauthError = sp.get("error");
            if (oauthError) {
                const description = sp.get("error_description") ?? t("callback.failed", { defaultValue: "Authentication callback failed" });
                setErr(description);
                return;
            }

            try {
                await getCurrentUser();
                const result = sp.get("result");
                if (result === "linked") {
                    setMessage(t("callback.linked", { defaultValue: "Account linked. Redirecting..." }));
                }
                nav("/app", { replace: true });
            } catch (callbackError) {
                setErr(getErrorMessage(callbackError, t("callback.failed", { defaultValue: "Auth callback failed" })));
            }
        })();
    }, [loc.search, nav, t]);

    if (err) {
        return (
            <div className="min-h-screen grid place-items-center p-6">
                <div className="max-w-md">
                    <div className="text-xl font-semibold mb-2">{t("callback.loginFailed", { defaultValue: "Login failed" })}</div>
                    <div className="text-sm text-red-400">{err}</div>
                </div>
            </div>
        );
    }

    return <div className="min-h-screen grid place-items-center">{message}</div>;
}
