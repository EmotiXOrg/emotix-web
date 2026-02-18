import { useState } from "react";
import { TextField } from "../../../ui/TextField";
import { Button } from "../../../ui/Button";
import { useTranslation } from "react-i18next";

export function PasswordStep(props: {
    password: string;
    onPasswordChange: (password: string) => void;
    mode: "login" | "signup" | "reset";
    label?: string;
}) {
    const { t } = useTranslation("auth");
    const [visible, setVisible] = useState(false);
    const passwordLabel = props.label ?? t("password", { defaultValue: "Password" });
    return (
        <TextField
            label={passwordLabel}
            placeholder={passwordLabel}
            value={props.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            type={visible ? "text" : "password"}
            autoComplete={props.mode === "login" ? "current-password" : "new-password"}
            rightAdornment={
                <Button
                    type="button"
                    variant="link"
                    onClick={() => setVisible((v) => !v)}
                    className="px-1 py-0 text-xs text-neutral-300 hover:text-neutral-100"
                    aria-label={visible ? t("hidePassword", { defaultValue: "Hide password" }) : t("showPassword", { defaultValue: "Show password" })}
                >
                    {visible ? t("hide", { defaultValue: "Hide" }) : t("show", { defaultValue: "Show" })}
                </Button>
            }
        />
    );
}
