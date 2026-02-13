import { createBrowserRouter } from "react-router-dom";
import { AuthGate, RequireAuth } from "./AuthGate";
import { AuthPage } from "./auth/AuthPage";
import { CallbackPage } from "./auth/CallbackPage";
import { AppShell } from "./AppShell";
import { LogoutPage } from "./auth/LogoutPage";

export const router = createBrowserRouter([
    { path: "/", element: <AuthGate /> },

    // Single auth route (mode via query string)
    { path: "/auth", element: <AuthPage /> },

    // Hosted UI callback
    { path: "/auth/callback", element: <CallbackPage /> },

    { path: "/logout", element: <LogoutPage /> },

    // Protect the app
    { path: "/app/*", element: <RequireAuth><AppShell /></RequireAuth> },
]);
