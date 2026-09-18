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
import AccountsPage from "../account/page";
import ConversationsPage from "../my-learning/conversations/page";
import ProgramsPage from "../programs/page";
import { fallbackMaterials } from "@/features/training-library/api";

jest.mock("next/navigation", () => ({
  usePathname: () => "/materials",
  useRouter: () => ({ replace: jest.fn() }),
}));

describe("route components", () => {
  it("renders the route pages", async () => {
    const pages = [
      () => EventsPage(),
      () => LearningPathPage(),
      () => LearningPathsPage(),
      () => MaintainerPage(),
      () => MaterialPage({ params: Promise.resolve({ materialId: fallbackMaterials[0].id }) }),
      () => MaterialsPage({}),
      () => MyLearningPage(),
      () => AccountsPage(),
      () => ConversationsPage(),
      () => ProgramsPage(),
    ];

    for (const Page of pages) {
      const { unmount } = render(await Page());
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      unmount();
    }
  });

  it("renders the catalog page with the public library hero text", async () => {
    render(await MaterialsPage({}));
    expect(screen.getByRole("heading", { name: /Search by what you want to learn or use\./i })).toBeInTheDocument();
    expect(screen.getByLabelText(/training filters/i)).toBeInTheDocument();
  });

  it("renders the loading and not-found states", () => {
    const { unmount: unmountLoading } = render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    unmountLoading();

    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("renders the error state and retries", () => {
    const reset = jest.fn();
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorPage error={new Error("test error")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});