type BuildInfo = {
    appVersion: string;
    buildNumber: string;
    gitSha: string;
    deployedAt: string;
    stage: string;
};

function getValue(value: string | undefined, fallback: string): string {
    if (typeof value === "string" && value.trim()) {
        return value;
    }
    return fallback;
}

export const buildInfo: BuildInfo = {
    appVersion: getValue(import.meta.env.VITE_RELEASE_VERSION as string | undefined, "dev"),
    buildNumber: getValue(import.meta.env.VITE_BUILD_NUMBER as string | undefined, "local"),
    gitSha: getValue(import.meta.env.VITE_BUILD_SHA as string | undefined, "local").slice(0, 12),
    deployedAt: getValue(import.meta.env.VITE_DEPLOYED_AT as string | undefined, "local"),
    stage: getValue(import.meta.env.VITE_STAGE as string | undefined, "local"),
};
