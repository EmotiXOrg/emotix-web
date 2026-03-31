import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type SocialProvider = "google" | "facebook";

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="ui-social-icon-svg" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="ui-social-icon-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="url(#facebookGradient)" />
            <path
                fill="#fff"
                d="M31.8206 30.4224L32.7534 24.4951H26.9178V20.6505C26.9178 19.0286 27.7316 17.4467 30.3453 17.4467H33V12.4005C33 12.4005 30.5918 12 28.2905 12C23.4822 12 20.3426 14.8394 20.3426 19.9776V24.4951H15V30.4224H20.3426V44.7518C21.4151 44.916 22.5123 45 23.6301 45C24.7479 45 25.8453 44.916 26.9178 44.7518V30.4224H31.8206Z"
            />
            <defs>
                <linearGradient id="facebookGradient" x1="24" y1="3" x2="24" y2="44.8755" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#18ACFE" />
                    <stop offset="1" stopColor="#0163E0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function SocialIcon(props: { provider: SocialProvider }) {
    if (props.provider === "google") {
        return (
            <div className="ui-social-button-icon" aria-hidden="true">
                <GoogleIcon />
            </div>
        );
    }

    return (
        <div className="ui-social-button-icon" aria-hidden="true">
            <FacebookIcon />
        </div>
    );
}

export function SocialButton(
    props: {
        provider: SocialProvider;
        children: string;
    } & ButtonHTMLAttributes<HTMLButtonElement>
) {
    const { provider, children, className, disabled, type = "button", ...rest } = props;

    return (
        <button
            className={cn("ui-social-button", className)}
            disabled={disabled}
            type={type}
            {...rest}
        >
            <div className="ui-social-button-state" />
            <div className="ui-social-button-content">
                <SocialIcon provider={provider} />
                <span className="ui-social-button-label">{children}</span>
            </div>
        </button>
    );
}
