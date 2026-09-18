import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "../error";
import EventsPage from "../events/page";
import LearningPathsError from "../learning-paths/error";
import LearningPathPage from "../learning-paths/[pathId]/page";
import LearningPathsLoading from "../learning-paths/loading";
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
import {
  getLearningPath,
  getLearningPaths,
} from "@/features/learning-paths/api";
import { notFound } from "next/navigation";

jest.mock("@/features/learning-paths/api", () => ({
  getLearningPaths: jest.fn().mockResolvedValue([]),
  getLearningPath: jest.fn().mockResolvedValue({
    id: "new-to-hpc",
    title: "New to HPC",
    description: "Build a practical foundation.",
    audience: "New learners",
    prerequisites: "None",
    estimatedScope: "One step",
    items: [],
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/materials",
  useRouter: () => ({ replace: jest.fn() }),
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const samplePath = {
  id: "new-to-hpc",
  title: "New to HPC",
  description: "Build a practical foundation.",
  audience: "New learners",
  prerequisites: "None",
  estimatedScope: "One step",
  items: [],
};

const getLearningPathsMock = jest.mocked(getLearningPaths);
const getLearningPathMock = jest.mocked(getLearningPath);
const notFoundMock = jest.mocked(notFound);

describe("static route components", () => {
  it("renders the route pages", async () => {
    const pages = [
      () => EventsPage(),
      () => MaintainerPage(),
      () =>
        MaterialPage({
          params: Promise.resolve({ materialId: fallbackMaterials[0].id }),
        }),
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
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });
});

describe("learning path route components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getLearningPathsMock.mockResolvedValue([]);
    getLearningPathMock.mockResolvedValue(samplePath);
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("renders the asynchronous learning path routes", async () => {
    const { unmount } = render(await LearningPathsPage());
    expect(
      screen.getByRole("heading", {
        name: "Start with a sequence, not a search box.",
      }),
    ).toBeInTheDocument();
    unmount();

    render(
      await LearningPathPage({
        params: Promise.resolve({ pathId: "new-to-hpc" }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "New to HPC" }),
    ).toBeInTheDocument();
  });

  it("propagates learning path gateway failures", async () => {
    const listError = new Error("list request failed");
    getLearningPathsMock.mockRejectedValueOnce(listError);
    await expect(LearningPathsPage()).rejects.toThrow(listError);

    const detailError = new Error("detail request failed");
    getLearningPathMock.mockRejectedValueOnce(detailError);
    await expect(
      LearningPathPage({
        params: Promise.resolve({ pathId: "new-to-hpc" }),
      }),
    ).rejects.toThrow(detailError);
  });

  it("uses the not-found boundary for a missing learning path", async () => {
    getLearningPathMock.mockResolvedValueOnce(null);

    await expect(
      LearningPathPage({ params: Promise.resolve({ pathId: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("renders the learning path loading state", () => {
    render(<LearningPathsLoading />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading learning paths…",
    );
  });
});

describe("error boundaries", () => {
  it("renders the global error state and retries", () => {
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

  it("renders the learning path error state and retries", () => {
    const reset = jest.fn();
    const error = new Error("gateway unavailable");
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<LearningPathsError error={error} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      screen.getByRole("heading", {
        name: "Learning paths are temporarily unavailable.",
      }),
    ).toBeInTheDocument();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });
});
