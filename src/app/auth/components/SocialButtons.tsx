import { Button } from "../../../ui/Button";

export function SocialButtons(props: {
    busy: boolean;
    onClick: (provider: "Google" | "Facebook") => void;
}) {
    return (
        <div className="space-y-3 mb-6 motion-fade-slide">
            <Button
                variant="neutral"
                fullWidth
                onClick={() => props.onClick("Google")}
                disabled={props.busy}
                type="button"
            >
                Continue with Google
            </Button>
            <Button
                variant="secondary"
                fullWidth
                onClick={() => props.onClick("Facebook")}
                disabled={props.busy}
                type="button"
            >
                Continue with Facebook
            </Button>
        </div>
    );
}
