import { TextField } from "../../../ui/TextField";
import { useTranslation } from "react-i18next";

export function EmailStep(props: { email: string; onEmailChange: (email: string) => void }) {
    const { t } = useTranslation("auth");
    return (
        <TextField
            label={t("email", { defaultValue: "Email" })}
            placeholder={t("email", { defaultValue: "Email" })}
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            autoComplete="email"
        />
    );
}
