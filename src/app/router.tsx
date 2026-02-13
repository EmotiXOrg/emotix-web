import { createBrowserRouter } from "react-router-dom";
import { AuthGate } from "./AuthGate";
import { LoginPage } from "../auth/LoginPage";
import { CallbackPage } from "../auth/CallbackPage";
import { AppShell } from "./AppShell";

export const router = createBrowserRouter([
    { path: "/", element: <AuthGate /> },
    { path: "/auth", element: <LoginPage /> },
    { path: "/auth/callback", element: <CallbackPage /> },
    { path: "/app/*", element: <AppShell /> },
]);
