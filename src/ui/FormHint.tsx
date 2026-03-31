import type { ReactNode } from "react";
import { cn } from "./cn";

export function FormHint(props: { children: ReactNode; tone?: "default" | "danger"; className?: string }) {
    return (
        <div className={cn("ui-hint", props.tone === "danger" && "ui-hint-danger", props.className)}>
            {props.children}
        </div>
    );
}
