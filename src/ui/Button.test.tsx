import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
    it("applies variant and width styles", () => {
        render(
            <Button variant="secondary" fullWidth>
                Click me
            </Button>
        );

        const button = screen.getByRole("button", { name: "Click me" });
        expect(button.className).toContain("bg-blue-600");
        expect(button.className).toContain("w-full");
    });
});
