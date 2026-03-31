import { cn } from "./cn";

type Tone = "error" | "info" | "success";

const toneClass: Record<Tone, string> = {
    error: "ui-notification-error",
    info: "ui-notification-info",
    success: "ui-notification-success",
};

export function Notification(props: { message: string; tone?: Tone }) {
    const tone = props.tone ?? "info";

    return (
        <div className={cn("ui-notification motion-fade-slide", toneClass[tone])}>
            {props.message}
        </div>
    );
}
