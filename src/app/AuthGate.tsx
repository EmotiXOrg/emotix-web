import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

function Loading() {
    return <div className="min-h-screen grid place-items-center">Loading…</div>;
}

export function AuthGate() {
    const nav = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                await getCurrentUser();
                nav("/app", { replace: true });
            } catch {
                // default mode = login
                nav("/auth?mode=login", { replace: true });
            } finally {
                setChecking(false);
            }
        })();
    }, [nav]);

    if (checking) return <Loading />;
    return null;
}

export function RequireAuth(props: { children: ReactNode }) {
    const nav = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                await getCurrentUser();
            } catch {
                nav("/auth?mode=login", { replace: true });
            } finally {
                setChecking(false);
            }
        })();
    }, [nav]);

    if (checking) return <Loading />;
    return <>{props.children}</>;
}
