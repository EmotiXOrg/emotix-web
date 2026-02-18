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
                    className="px-1 py-0 text-neutral-300 hover:text-neutral-100"
                    aria-label={visible ? t("hidePassword", { defaultValue: "Hide password" }) : t("showPassword", { defaultValue: "Show password" })}
                >
                    {visible ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path d="M3 3l18 18" />
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9.3 5 9.9 6-.2.4-1 1.7-2.2 3.1" />
                            <path d="M6.6 6.7C4.5 8 3.2 9.8 2.9 10.4c.6 1 4.4 6 9.1 6 1.2 0 2.3-.2 3.3-.6" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path d="M2.9 12c.6-1 4.4-6 9.1-6s8.5 5 9.1 6c-.6 1-4.4 6-9.1 6s-8.5-5-9.1-6Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </Button>
            }
        />
    );
}
