import type { ReactNode } from "react";
import { cn } from "./cn";

export function AuthFooter(props: {
    title: string;
    items: string[];
    className?: string;
    icon?: ReactNode;
}) {
    const { title, items, className, icon } = props;

    return (
        <section className={cn("auth-note-card", className)}>
            <div className="flex items-center gap-3">
                {icon}
                <h2 className="auth-note-title">{title}</h2>
            </div>
            <ul className="auth-note-list">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--color-gold-500)]" aria-hidden="true" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
