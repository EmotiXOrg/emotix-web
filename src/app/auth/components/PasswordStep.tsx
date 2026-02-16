import { TextField } from "../../../ui/TextField";

export function PasswordStep(props: {
    password: string;
    onPasswordChange: (password: string) => void;
    mode: "login" | "signup" | "reset";
    label?: string;
}) {
    return (
        <TextField
            label={props.label ?? "Password"}
            placeholder={props.label ?? "Password"}
            value={props.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            type="password"
            autoComplete={props.mode === "login" ? "current-password" : "new-password"}
        />
    );
}
