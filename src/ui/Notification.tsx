import { cn } from "./cn";

type Tone = "error" | "info" | "success";

const toneClass: Record<Tone, string> = {
    error: "text-red-300 border-red-500/40 bg-red-950/30",
    info: "text-blue-200 border-blue-400/30 bg-blue-950/20",
    success: "text-emerald-200 border-emerald-500/30 bg-emerald-950/20",
};

export function Notification(props: { message: string; tone?: Tone }) {
    const tone = props.tone ?? "info";

    return (
        <div className={cn("rounded-lg border px-3 py-2 text-sm motion-fade-slide", toneClass[tone])}>
            {props.message}
        </div>
    );
}
