import type { ReactNode } from "react";
import { cn } from "./cn";

export function Skeleton(props: { className?: string; children?: ReactNode }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "animate-pulse rounded-md bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 bg-[length:200%_100%]",
                props.className
            )}
        >
            {props.children}
        </div>
    );
}

export function SkeletonText(props: { lines?: number; className?: string }) {
    const lines = props.lines ?? 2;
    return (
        <div className={cn("space-y-2", props.className)}>
            {Array.from({ length: lines }).map((_, idx) => (
                <Skeleton
                    key={idx}
                    className={cn("h-3", idx === lines - 1 ? "w-2/3" : "w-full")}
                />
            ))}
        </div>
    );
}
