import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "neutral" | "link" | "success";

const variantClass: Record<ButtonVariant, string> = {
    primary: "ui-button-primary",
    secondary: "ui-button-secondary",
    neutral: "ui-button-neutral",
    link: "ui-button-link",
    success: "ui-button-success",
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
                "ui-button motion-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(132,38,58,0.65)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)]",
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
