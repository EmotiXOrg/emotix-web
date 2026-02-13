import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";

export function LogoutPage() {
    useEffect(() => {
        (async () => {
            try {
                // 1. Clear local tokens
                await signOut({ global: false });
            } catch {
                // ignore
            }

            // 2. Redirect to Cognito logout endpoint
            const domain = (import.meta.env.VITE_COGNITO_DOMAIN as string).replace("https://", "");
            const clientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID as string;
            const logoutUri = `${import.meta.env.VITE_APP_ORIGIN}/auth`;

            const url =
                `https://${domain}/logout` +
                `?client_id=${encodeURIComponent(clientId)}` +
                `&logout_uri=${encodeURIComponent(logoutUri)}`;

            window.location.assign(url);
        })();
    }, []);

    return (
        <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-100">
            <div className="text-lg">Signing you out…</div>
        </div>
    );
}
