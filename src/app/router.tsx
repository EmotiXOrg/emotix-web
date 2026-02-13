import { createBrowserRouter } from "react-router-dom";
import { AuthGate } from "./AuthGate";
import { LoginPage } from "./auth/LoginPage";
import { CallbackPage } from "./auth/CallbackPage";
import { AppShell } from "./AppShell";
import { LogoutPage } from "./auth/LogoutPage";

export const router = createBrowserRouter([
    { path: "/", element: <AuthGate /> },
    { path: "/auth", element: <LoginPage /> },
    { path: "/auth/callback", element: <CallbackPage /> },
    { path: "/logout", element: <LogoutPage /> },
    { path: "/app/*", element: <AppShell /> },
]);
