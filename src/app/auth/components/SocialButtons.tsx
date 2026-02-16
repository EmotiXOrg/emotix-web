import { Button } from "../../../ui/Button";

export function SocialButtons(props: {
    busy: boolean;
    methods: Array<"google" | "facebook">;
    onClick: (provider: "Google" | "Facebook") => void;
}) {
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
                    Continue with Google
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
                    Continue with Facebook
                </Button>
            )}
        </div>
    );
}
