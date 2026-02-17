import { Button } from "../../../ui/Button";
import { useTranslation } from "react-i18next";

export function SocialButtons(props: {
    busy: boolean;
    methods: Array<"google" | "facebook">;
    onClick: (provider: "Google" | "Facebook") => void;
}) {
    const { t } = useTranslation("auth");
    return (
        <div className="space-y-3 mb-6 motion-fade-slide">
            {props.methods.includes("google") && (
                <Button
                    variant="neutral"
                    fullWidth
                    onClick={() => props.onClick("Google")}
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
                    onClick={() => props.onClick("Facebook")}
                    disabled={props.busy}
                    type="button"
                >
                    {t("continue_facebook", { defaultValue: "Continue with Facebook" })}
                </Button>
            )}
        </div>
    );
}
