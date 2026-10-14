import { render, screen } from "@testing-library/react";
import Home from "../page";

jest.mock("@/features/start-here/api", () => ({
  getStartHereData: jest.fn().mockResolvedValue({
    browseOptions: [],
    featuredMaterials: [],
    learningPaths: [],
    upcomingEvents: [],
    programs: [],
    errors: [],
  }),
}));

describe("Home Page", () => {
  it("renders the main heading successfully", async () => {
    render(await Home());

    const heading = screen.getByRole("heading", {
      level: 1,
    });

    expect(heading).toBeInTheDocument();
  });
});
