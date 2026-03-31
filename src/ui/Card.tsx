import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type CardVariant = "default" | "auth";

export function Card(
    props: {
        children: ReactNode;
        variant?: CardVariant;
    } & HTMLAttributes<HTMLDivElement>
) {
    const { children, className, variant = "default", ...rest } = props;

    return (
        <div className={cn(variant === "auth" ? "auth-frame" : "ui-card", className)} {...rest}>
            {children}
        </div>
    );
}
