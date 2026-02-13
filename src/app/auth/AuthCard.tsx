import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, type SupportedLanguage } from "../../i18n";

export function AuthCard(props: { title: string; subtitle?: string; children: ReactNode }) {
    const { i18n } = useTranslation("auth");

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-2xl font-semibold">{props.title}</div>
                        {props.subtitle && <div className="text-sm text-neutral-300">{props.subtitle}</div>}
                    </div>

                    <select
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-sm"
                        value={i18n.language}
                        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    >
                        <option value="en">EN</option>
                        <option value="de">DE</option>
                        <option value="ru">RU</option>
                    </select>
                </div>

                {props.children}
            </div>
        </div>
    );
}
