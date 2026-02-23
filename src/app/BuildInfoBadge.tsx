import { buildInfo } from "./buildInfo";

export function BuildInfoBadge() {
    return (
        <div className="fixed bottom-3 right-3 z-50 pointer-events-none max-w-[85vw]">
            <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/80 px-2.5 py-1.5 text-[11px] leading-tight text-neutral-300 shadow-lg backdrop-blur">
                <div className="font-medium text-neutral-200">
                    {buildInfo.stage} · v{buildInfo.appVersion}
                </div>
                <div className="text-neutral-400">
                    b{buildInfo.buildNumber} · {buildInfo.gitSha}
                </div>
            </div>
        </div>
    );
}
