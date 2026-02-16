import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "neutral" | "link";

const variantClass: Record<ButtonVariant, string> = {
    primary: "bg-emerald-500 text-neutral-950 hover:bg-emerald-400",
    secondary: "bg-blue-600 text-neutral-100 hover:bg-blue-500",
    neutral: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    link: "bg-transparent text-neutral-300 underline underline-offset-4 hover:text-neutral-100",
};

export function Button(
    props: {
        children: ReactNode;
        variant?: ButtonVariant;
        fullWidth?: boolean;
    } & ButtonHTMLAttributes<HTMLButtonElement>
) {
    const { children, className, variant = "primary", fullWidth = false, ...rest } = props;

    return (
        <button
            className={cn(
                "rounded-xl py-3 font-medium motion-soft transition-all duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "enabled:hover:-translate-y-0.5 enabled:active:translate-y-0",
                fullWidth && "w-full",
                variantClass[variant],
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
}
