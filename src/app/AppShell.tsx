import { Routes, Route, NavLink, useNavigate } from "react-router-dom";

function Screen({ title }: { title: string }) {
    return (
        <div className="p-4 pb-24">
            <div className="text-2xl font-semibold">{title}</div>
            <div className="text-neutral-400 mt-2">Placeholder for your big app UI.</div>
        </div>
    );
}

export function AppShell() {
    const nav = useNavigate();
    async function logout() {
        nav("/logout");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <Routes>
                <Route path="/" element={<Screen title="Tonight" />} />
                <Route path="explore" element={<Screen title="Explore" />} />
                <Route path="profile" element={<Screen title="Profile" />} />
                <Route path="history" element={<Screen title="History" />} />
            </Routes>

            <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
                <div className="max-w-md mx-auto grid grid-cols-5 gap-1 p-2">
                    <Tab to="/app" label="Tonight" end />
                    <Tab to="/app/explore" label="Explore" />
                    <Tab to="/app/profile" label="Profile" />
                    <Tab to="/app/history" label="History" />
                    <button className="rounded-xl px-3 py-2 text-sm border border-neutral-800" onClick={logout}>
                        Logout
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
