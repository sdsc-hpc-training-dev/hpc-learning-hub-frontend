import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "../error";
import EventsPage from "../events/page";
import LearningPathPage from "../learning-paths/[pathId]/page";
import LearningPathsPage from "../learning-paths/page";
import Loading from "../loading";
import MaintainerPage from "../maintainer/page";
import MaterialPage from "../materials/[materialId]/page";
import MaterialsPage from "../materials/page";
import MyLearningPage from "../my-learning/page";
import NotFound from "../not-found";

describe("route components", () => {
  it("renders the route pages", () => {
    const pages = [
      EventsPage,
      LearningPathPage,
      LearningPathsPage,
      MaintainerPage,
      MaterialPage,
      MaterialsPage,
      MyLearningPage,
    ];

    pages.forEach((Page) => {
      const { unmount } = render(<Page />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      unmount();
    });
  });

  it("renders the loading and not-found states", () => {
    const { unmount: unmountLoading } = render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    unmountLoading();

    render(<NotFound />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });

  it("renders the error state and retries", () => {
    const reset = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<ErrorPage error={new Error("test error")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
