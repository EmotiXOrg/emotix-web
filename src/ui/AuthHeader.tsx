import type { ReactNode } from "react";
import { cn } from "./cn";

function BrandMark() {
    return (
        <svg viewBox="0 0 220 64" className="auth-brand-mark" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 43C42 38 66 18 98 14C121 11 144 15 206 43" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M14 21C42 26 66 46 98 50C121 53 144 49 206 21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.88" />
            <path d="M86 32C97 29 103 22 110 14C117 22 123 29 134 32C123 35 117 42 110 50C103 42 97 35 86 32Z" fill="currentColor" />
        </svg>
    );
}

export function AuthHeader(props: {
    title?: string;
    subtitle?: string;
    stepLabel?: string;
    actions?: ReactNode;
    className?: string;
}) {
    const { title, subtitle, stepLabel, actions, className } = props;

    return (
        <header className={cn("auth-header", className)}>
            <div className="auth-header-row">
                <div className="auth-brand-lockup">
                    <BrandMark />
                    <div className="auth-brand-name">EmotiX</div>
                </div>
                {actions}
            </div>
            {stepLabel && <div className="auth-step-copy">{stepLabel}</div>}
            <div className="space-y-2">
                {title && <h1 className="auth-title text-center">{title}</h1>}
                {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            </div>
        </header>
    );
}
