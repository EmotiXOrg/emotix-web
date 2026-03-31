import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../ui/AuthLayout";
import { LanguageSelect } from "../../ui/LanguageSelect";

export function AuthCard(props: { title: string; subtitle?: string; stepLabel?: string; footer?: ReactNode; children: ReactNode }) {
    const { i18n } = useTranslation("auth");

    return (
        <AuthLayout
            title={props.title}
            subtitle={props.subtitle}
            stepLabel={props.stepLabel}
            footer={props.footer}
            actions={
                <LanguageSelect
                    className="auth-select"
                    value={i18n.language}
                    aria-label="Language"
                />
            }
        >
            {props.children}
        </AuthLayout>
    );
}
