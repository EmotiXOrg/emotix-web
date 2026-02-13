import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

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
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                await getCurrentUser();
                nav("/app", { replace: true });
            } catch (err) {
                setErr(getErrorMessage(err, "Auth callback failed"));
            }
        })();
    }, [nav]);

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

    return <div className="min-h-screen grid place-items-center">Finishing sign-in…</div>;
}
