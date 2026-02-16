import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useLocation, useNavigate } from "react-router-dom";

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
    const nav = useNavigate();
    const loc = useLocation();
    const [err, setErr] = useState<string | null>(null);
    const [message, setMessage] = useState("Finishing sign-in...");

    useEffect(() => {
        (async () => {
            const sp = new URLSearchParams(loc.search);
            const oauthError = sp.get("error");
            if (oauthError) {
                const description = sp.get("error_description") ?? "Authentication callback failed";
                setErr(description);
                return;
            }

            try {
                await getCurrentUser();
                const result = sp.get("result");
                if (result === "linked") {
                    setMessage("Account linked. Redirecting...");
                }
                nav("/app", { replace: true });
            } catch (callbackError) {
                setErr(getErrorMessage(callbackError, "Auth callback failed"));
            }
        })();
    }, [loc.search, nav]);

    if (err) {
        return (
            <div className="min-h-screen grid place-items-center p-6">
                <div className="max-w-md">
                    <div className="text-xl font-semibold mb-2">Login failed</div>
                    <div className="text-sm text-red-400">{err}</div>
                </div>
            </div>
        );
    }

    return <div className="min-h-screen grid place-items-center">{message}</div>;
}
