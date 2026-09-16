import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home Page", () => {
  it("renders the main heading successfully", async () => {
    render(await Home());

    const heading = screen.getByRole("heading", {
      level: 1,
    });

    expect(heading).toBeInTheDocument();
  });
});