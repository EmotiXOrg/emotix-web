import { TextField } from "../../../ui/TextField";

export function EmailStep(props: { email: string; onEmailChange: (email: string) => void }) {
    return (
        <TextField
            label="Email"
            placeholder="Email"
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            autoComplete="email"
        />
    );
}
