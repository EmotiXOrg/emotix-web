import { useTranslation } from "react-i18next";
import { setLanguage, supportedLanguages, type SupportedLanguage } from "../i18n";
import { cn } from "./cn";

export function LanguageSelect(props: { value: string; className?: string; ariaLabel?: string }) {
    const { t } = useTranslation("common");

    return (
        <select
            className={cn("ui-language-select", props.className)}
            value={props.value}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label={props.ariaLabel ?? t("settings.languageLabel", { defaultValue: "Language" })}
        >
            {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                    {t(`settings.language.${lang}`, {
                        defaultValue: lang === "en" ? "English" : lang === "de" ? "Deutsch" : "Русский",
                    })}
                </option>
            ))}
        </select>
    );
}
