import { buildInfo } from "./buildInfo";

export function BuildInfoBadge() {
    return (
        <div className="fixed left-[1px] top-[1px] z-50 pointer-events-none text-[10px] leading-none text-neutral-400">
            {buildInfo.stage} v{buildInfo.appVersion} b{buildInfo.buildNumber} {buildInfo.gitSha}
        </div>
    );
}
