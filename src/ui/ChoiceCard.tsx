import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function ChoiceCard(
    props: {
        title: string;
        description: string;
        icon?: ReactNode;
        selected?: boolean;
    } & ButtonHTMLAttributes<HTMLButtonElement>
) {
    const { title, description, icon, selected = false, className, children, ...rest } = props;

    return (
        <button className={cn("ui-choice-card w-full text-left", className)} data-selected={selected} {...rest}>
            <div className="space-y-4">
                {icon && <div>{icon}</div>}
                <div className="space-y-2">
                    <div className="font-[var(--font-brand)] text-2xl leading-tight text-[color:var(--color-text-primary)]">{title}</div>
                    <div className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{description}</div>
                </div>
                {children}
            </div>
        </button>
    );
}
