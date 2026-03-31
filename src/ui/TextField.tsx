import type { ComponentProps } from "react";
import { Input } from "./Input";

export function TextField(props: ComponentProps<typeof Input>) {
    return <Input {...props} />;
}
