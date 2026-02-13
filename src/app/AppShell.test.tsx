import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./AppShell";

function renderAppShellAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: "/app/*", element: <AppShell /> },
      { path: "/logout", element: <div>Logout Page</div> },
    ],
    { initialEntries: [path] }
  );

  return {
    user: userEvent.setup(),
    ...render(<RouterProvider router={router} />),
  };
}

describe("AppShell", () => {
  it("renders app tabs in protected shell", () => {
    renderAppShellAt("/app");

    // Failure here means primary in-app navigation is missing or labels changed.
    expect(screen.getByRole("link", { name: "Tonight" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "History" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("navigates to logout route when logout is clicked", async () => {
    const { user } = renderAppShellAt("/app");

    await user.click(screen.getByRole("button", { name: "Logout" }));

    // Failure here means logout action no longer routes to the sign-out flow.
    expect(await screen.findByText("Logout Page")).toBeInTheDocument();
  });
});
