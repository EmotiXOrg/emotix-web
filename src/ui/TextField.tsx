import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function TextField(
    props: {
        label?: string;
        error?: boolean;
        rightAdornment?: ReactNode;
    } & InputHTMLAttributes<HTMLInputElement>
) {
    const { label, className, error = false, rightAdornment, id, ...rest } = props;
    const fallbackId = id ?? (label ? `field-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={fallbackId} className="text-xs text-neutral-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={fallbackId}
                    className={cn(
                        "w-full rounded-xl bg-neutral-950 border px-4 py-3 outline-none",
                        "motion-soft transition-all duration-200 ease-out",
                        "focus:border-emerald-400/80 border-neutral-800",
                        Boolean(rightAdornment) && "pr-12",
                        error && "border-red-500/70 focus:border-red-400",
                        className
                    )}
                    {...rest}
                />
                {rightAdornment && <div className="absolute inset-y-0 right-2 flex items-center">{rightAdornment}</div>}
            </div>
        </div>
    );
}
