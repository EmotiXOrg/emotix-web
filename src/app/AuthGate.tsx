import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export function AuthGate() {
    const nav = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                await getCurrentUser();
                nav("/app", { replace: true });
            } catch {
                nav("/auth", { replace: true });
            } finally {
                setChecking(false);
            }
        })();
    }, [nav]);

    if (checking) return <div className="min-h-screen grid place-items-center">Loading…</div>;
    return null;
}
