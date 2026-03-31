import type { ReactNode } from "react";
import { Card } from "./Card";
import { AuthHeader } from "./AuthHeader";

export function AuthLayout(props: {
    title: string;
    subtitle?: string;
    stepLabel?: string;
    actions?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className="app-auth-shell">
            <div className="app-auth-center">
                <Card variant="auth" className={props.className}>
                    <AuthHeader title={props.title} subtitle={props.subtitle} stepLabel={props.stepLabel} actions={props.actions} />
                    <div className="space-y-6">{props.children}</div>
                    {props.footer && <div className="mt-6">{props.footer}</div>}
                </Card>
            </div>
        </div>
    );
}
