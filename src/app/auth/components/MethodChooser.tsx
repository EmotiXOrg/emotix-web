import { Button } from "../../../ui/Button";
import { useTranslation } from "react-i18next";

export function MethodChooser(props: {
    busy: boolean;
    methods: Array<"password" | "google" | "facebook">;
    onChoosePassword: () => void;
    onChooseSocial: (provider: "Google" | "Facebook") => void;
}) {
    const { t } = useTranslation("auth");
    const hasSocial = props.methods.includes("google") || props.methods.includes("facebook");
    const hasPassword = props.methods.includes("password");

    return (
        <div className="space-y-3 motion-fade-slide">
            {props.methods.includes("google") && (
                <Button
                    variant="neutral"
                    fullWidth
                    onClick={() => props.onChooseSocial("Google")}
                    disabled={props.busy}
                    type="button"
                >
                    {t("continue_google", { defaultValue: "Continue with Google" })}
                </Button>
            )}
            {props.methods.includes("facebook") && (
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => props.onChooseSocial("Facebook")}
                    disabled={props.busy}
                    type="button"
                >
                    {t("continue_facebook", { defaultValue: "Continue with Facebook" })}
                </Button>
            )}

            {hasSocial && hasPassword && (
                <div className="flex items-center gap-3 my-5">
                    <div className="h-px bg-neutral-800 flex-1" />
                    <div className="text-xs text-neutral-400">{t("or", { defaultValue: "or" })}</div>
                    <div className="h-px bg-neutral-800 flex-1" />
                </div>
            )}

            {hasPassword && (
                <Button variant="primary" fullWidth onClick={props.onChoosePassword} disabled={props.busy} type="button">
                    {t("continue_email", { defaultValue: "Continue with Email" })}
                </Button>
            )}
        </div>
    );
}
