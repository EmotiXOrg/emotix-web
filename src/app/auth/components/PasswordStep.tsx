import { TextField } from "../../../ui/TextField";
import { useTranslation } from "react-i18next";

export function PasswordStep(props: {
    password: string;
    onPasswordChange: (password: string) => void;
    mode: "login" | "signup" | "reset";
    label?: string;
}) {
    const { t } = useTranslation("auth");
    const passwordLabel = props.label ?? t("password", { defaultValue: "Password" });
    return (
        <TextField
            label={passwordLabel}
            placeholder={passwordLabel}
            value={props.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            type="password"
            autoComplete={props.mode === "login" ? "current-password" : "new-password"}
        />
    );
}
