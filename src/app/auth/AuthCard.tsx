import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, type SupportedLanguage } from "../../i18n";
import { AuthLayout } from "../../ui/AuthLayout";

export function AuthCard(props: { title: string; subtitle?: string; stepLabel?: string; footer?: ReactNode; children: ReactNode }) {
    const { i18n } = useTranslation("auth");

    return (
        <AuthLayout
            title={props.title}
            subtitle={props.subtitle}
            stepLabel={props.stepLabel}
            footer={props.footer}
            actions={
                <select
                    className="auth-select"
                    value={i18n.language}
                    aria-label="Language"
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                >
                    <option value="en">EN</option>
                    <option value="de">DE</option>
                    <option value="ru">RU</option>
                </select>
            }
        >
            {props.children}
        </AuthLayout>
    );
}
