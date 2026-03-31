import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Input(
    props: {
        label?: string;
        hint?: string;
        error?: string | boolean;
        success?: boolean;
        rightAdornment?: ReactNode;
        shellClassName?: string;
    } & InputHTMLAttributes<HTMLInputElement>
) {
    const {
        label,
        hint,
        error = false,
        success = false,
        rightAdornment,
        shellClassName,
        className,
        id,
        ...rest
    } = props;

    const fallbackId = id ?? (label ? `field-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const hintText = typeof error === "string" ? error : hint;

    return (
        <div className="ui-input-group">
            {label && (
                <label htmlFor={fallbackId} className="ui-label">
                    {label}
                </label>
            )}
            <div className={cn("ui-input-shell", shellClassName)} data-invalid={Boolean(error)} data-success={success}>
                <input id={fallbackId} className={cn("ui-input", Boolean(rightAdornment) && "pr-12", className)} {...rest} />
                {rightAdornment && <div className="ui-input-adornment">{rightAdornment}</div>}
            </div>
            {hintText && <div className={cn("ui-hint", typeof error === "string" && "ui-hint-danger")}>{hintText}</div>}
        </div>
    );
}
