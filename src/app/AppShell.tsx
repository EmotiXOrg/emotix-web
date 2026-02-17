import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { AccountSettingsPanel } from "./settings/AccountSettingsPanel";
import { useTranslation } from "react-i18next";

function Screen({ title }: { title: string }) {
    const { t } = useTranslation("common");
    return (
        <div className="p-4 pb-24">
            <div className="text-2xl font-semibold">{title}</div>
            <div className="text-neutral-400 mt-2">
                {t("app.placeholder", { defaultValue: "Placeholder for your big app UI." })}
            </div>
        </div>
    );
}

export function AppShell() {
    const { t } = useTranslation("common");
    const nav = useNavigate();
    async function logout() {
        nav("/logout");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <Routes>
                <Route path="/" element={<Screen title={t("nav.tonight", { defaultValue: "Tonight" })} />} />
                <Route path="explore" element={<Screen title={t("nav.explore", { defaultValue: "Explore" })} />} />
                <Route path="profile" element={<AccountSettingsPanel />} />
                <Route path="history" element={<Screen title={t("nav.history", { defaultValue: "History" })} />} />
            </Routes>

            <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
                <div className="max-w-md mx-auto grid grid-cols-5 gap-1 p-2">
                    <Tab to="/app" label={t("nav.tonight", { defaultValue: "Tonight" })} end />
                    <Tab to="/app/explore" label={t("nav.explore", { defaultValue: "Explore" })} />
                    <Tab to="/app/profile" label={t("nav.profile", { defaultValue: "Profile" })} />
                    <Tab to="/app/history" label={t("nav.history", { defaultValue: "History" })} />
                    <button className="rounded-xl px-3 py-2 text-sm border border-neutral-800" onClick={logout}>
                        {t("nav.logout", { defaultValue: "Logout" })}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Tab({ to, label, end }: { to: string; label: string; end?: boolean }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm text-center border ${isActive ? "border-neutral-100" : "border-neutral-800"}`
            }
        >
            {label}
        </NavLink>
    );
}
