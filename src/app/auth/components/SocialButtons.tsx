import { useTranslation } from "react-i18next";
import { SocialButton } from "../../../ui/SocialButton";

export function SocialButtons(props: {
    busy: boolean;
    methods: Array<"google" | "facebook">;
    onClick: (provider: "Google" | "Facebook") => void;
}) {
    const { t } = useTranslation("auth");
    return (
        <div className="mx-auto flex w-fit items-center gap-3 motion-fade-slide">
            {props.methods.includes("google") && (
                <SocialButton
                    provider="google"
                    onClick={() => props.onClick("Google")}
                    disabled={props.busy}
                    type="button"
                >
                    {t("continue_google", { defaultValue: "Google" })}
                </SocialButton>
            )}
            {props.methods.includes("facebook") && (
                <SocialButton
                    provider="facebook"
                    onClick={() => props.onClick("Facebook")}
                    disabled={props.busy}
                    type="button"
                >
                    {t("continue_facebook", { defaultValue: "Facebook" })}
                </SocialButton>
            )}
        </div>
    );
}
