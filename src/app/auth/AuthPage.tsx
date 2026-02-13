import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LoginForm, type AuthMode } from "./LoginForm";

function parseMode(v: string | null): AuthMode {
    switch ((v ?? "").toLowerCase()) {
        case "signup":
            return "signup";
        case "verify":
            return "verify";
        case "forgot":
            return "forgot";
        case "reset":
            return "reset";
        default:
            return "login";
    }
}

export function AuthPage() {
    const loc = useLocation();

    const mode = useMemo(() => {
        const sp = new URLSearchParams(loc.search);
        return parseMode(sp.get("mode"));
    }, [loc.search]);

    return <LoginForm mode={mode} />;
}
