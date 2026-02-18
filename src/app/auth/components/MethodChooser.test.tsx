import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodChooser } from "./MethodChooser";

describe("MethodChooser", () => {
    it("renders skeleton placeholders when busy", () => {
        render(
            <MethodChooser
                busy
                methods={["google", "facebook", "password"]}
                onChoosePassword={() => {}}
                onChooseSocial={() => {}}
            />
        );

        expect(screen.queryByRole("button", { name: "Continue with Google" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Continue with Facebook" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Continue with Email" })).not.toBeInTheDocument();
    });

    it("calls the expected handlers for each method button", async () => {
        const user = userEvent.setup();
        const onChoosePassword = vi.fn();
        const onChooseSocial = vi.fn();

        render(
            <MethodChooser
                busy={false}
                methods={["google", "facebook", "password"]}
                onChoosePassword={onChoosePassword}
                onChooseSocial={onChooseSocial}
            />
        );

        await user.click(screen.getByRole("button", { name: "Continue with Google" }));
        await user.click(screen.getByRole("button", { name: "Continue with Facebook" }));
        await user.click(screen.getByRole("button", { name: "Continue with Email" }));

        expect(onChooseSocial).toHaveBeenNthCalledWith(1, "Google");
        expect(onChooseSocial).toHaveBeenNthCalledWith(2, "Facebook");
        expect(onChoosePassword).toHaveBeenCalledOnce();
    });
});
