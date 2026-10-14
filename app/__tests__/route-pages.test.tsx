import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "../error";
import EventsPage from "../events/page";
import EventsLoading from "../events/loading";
import LearningPathsError from "../learning-paths/error";
import LearningPathPage from "../learning-paths/[pathId]/page";
import LearningPathsLoading from "../learning-paths/loading";
import LearningPathsPage from "../learning-paths/page";
import Loading from "../loading";
import MaterialPage from "../materials/[materialId]/page";
import MaterialsPage from "../materials/page";
import NotFound from "../not-found";
import ProgramsPage from "../programs/page";
import ProgramsLoading from "../programs/loading";
import {
  fallbackMaterials,
  getMaterialById,
  getTrainingLibraryData,
} from "@/features/training-library/api";
import { getEventsData } from "@/features/events/api";
import { getProgramsData } from "@/features/programs/api";
import {
  getLearningPath,
  getLearningPaths,
} from "@/features/learning-paths/api";
import { notFound } from "next/navigation";

const mockSearchParams = new URLSearchParams();

jest.mock("@/features/training-library/api", () => {
  const actual = jest.requireActual<
    typeof import("@/features/training-library/api")
  >("@/features/training-library/api");
  return {
    ...actual,
    getTrainingLibraryData: jest.fn().mockResolvedValue({
      materials: actual.fallbackMaterials,
      total: actual.fallbackMaterials.length,
      page: 1,
      totalPages: 1,
    }),
    getTrainingLibraryFacets: jest
      .fn()
      .mockResolvedValue({ topics: [], tools: [], systems: [] }),
    getMaterialById: jest
      .fn()
      .mockImplementation((id: string) =>
        Promise.resolve(
          actual.fallbackMaterials.find(
            (material: { id: string }) => material.id === id,
          ) ?? null,
        ),
      ),
  };
});

jest.mock("@/features/events/api", () => ({
  getEventsData: jest.fn().mockResolvedValue({
    upcomingEvents: [],
    recordings: [],
  }),
}));

jest.mock("@/features/programs/api", () => ({
  getProgramsData: jest.fn().mockResolvedValue({
    programs: [],
    selectedProgram: null,
  }),
}));

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
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => mockSearchParams,
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
const getEventsDataMock = jest.mocked(getEventsData);
const getProgramsDataMock = jest.mocked(getProgramsData);
const getMaterialByIdMock = jest.mocked(getMaterialById);
const getTrainingLibraryDataMock = jest.mocked(getTrainingLibraryData);
const notFoundMock = jest.mocked(notFound);

describe("static route components", () => {
  it("renders the route pages", async () => {
    const pages = [
      () => EventsPage(),
      () =>
        MaterialPage({
          params: Promise.resolve({ materialId: fallbackMaterials[0].id }),
        }),
      () => MaterialsPage({}),
      () => ProgramsPage(),
    ];

    for (const Page of pages) {
      const { unmount } = render(await Page());
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      unmount();
    }
  });
});

describe("training catalog routes", () => {
  it("renders the catalog page with the public library hero text", async () => {
    render(await MaterialsPage({}));
    expect(
      screen.getByRole("heading", {
        name: /Search by what you want to learn or use\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/training filters/i)).toBeInTheDocument();
  });

  it("shows an inline error when the training catalog is unavailable", async () => {
    getTrainingLibraryDataMock.mockResolvedValueOnce({
      materials: [],
      total: 0,
      page: 1,
      totalPages: 0,
      error: true,
    });

    render(await MaterialsPage({}));
    expect(
      screen.getByRole("heading", {
        name: "Training materials are unavailable.",
      }),
    ).toBeInTheDocument();
  });

  it("uses the 404 boundary for an unknown material", async () => {
    notFoundMock.mockClear();
    getMaterialByIdMock.mockResolvedValueOnce(null);

    await expect(
      MaterialPage({
        params: Promise.resolve({ materialId: "missing-material" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});

describe("training program filter data", () => {
  it("loads program options and passes selected filters to the API modules", async () => {
    getTrainingLibraryDataMock.mockClear();
    getProgramsDataMock.mockResolvedValueOnce({
      programs: [{ id: "series-1", name: "Series One" }],
      selectedProgram: null,
    });
    mockSearchParams.set("query", "batch computing");
    mockSearchParams.set("program", "series-1");

    const page = await MaterialsPage({
      searchParams: Promise.resolve({
        query: "batch computing",
        program: "series-1",
      }),
    });
    const { unmount } = render(page);

    expect(getTrainingLibraryDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "batch computing",
        program: "series-1",
      }),
    );
    expect(getProgramsDataMock).toHaveBeenCalled();
    expect(screen.getByRole("option", { name: "Series One" })).toHaveValue(
      "series-1",
    );
    unmount();
    mockSearchParams.delete("query");
    mockSearchParams.delete("program");
  });
});

describe("static loading and not-found states", () => {
  it("renders the loading and not-found states", () => {
    const { unmount: unmountLoading } = render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    unmountLoading();

    render(<NotFound />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });

  it("renders the events loading state", () => {
    render(<EventsLoading />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading events and recordings…",
    );
  });
});

describe("events route components", () => {
  beforeEach(() => {
    getEventsDataMock.mockResolvedValue({ upcomingEvents: [], recordings: [] });
  });

  it("renders an inline error when the events API fails", async () => {
    const error = new Error("events request failed");
    getEventsDataMock.mockRejectedValueOnce(error);

    render(await EventsPage());
    expect(
      screen.getByRole("heading", { name: "Events are unavailable." }),
    ).toBeInTheDocument();
  });

  it("renders the programs loading state", () => {
    render(<ProgramsLoading />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading training collections…",
    );
  });
});

describe("programs route components", () => {
  beforeEach(() => {
    getProgramsDataMock.mockResolvedValue({
      programs: [],
      selectedProgram: null,
    });
  });

  it("passes the selected program query to the gateway adapter", async () => {
    await ProgramsPage({
      searchParams: Promise.resolve({ program: ["series-1", "series-2"] }),
    });

    expect(getProgramsDataMock).toHaveBeenCalledWith("series-1");
  });

  it("renders an inline error when the programs API fails", async () => {
    const error = new Error("program request failed");
    getProgramsDataMock.mockRejectedValueOnce(error);

    render(await ProgramsPage());
    expect(
      screen.getByRole("heading", { name: "Programs are unavailable." }),
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

  it("renders an inline error for a learning path list failure", async () => {
    const listError = new Error("list request failed");
    getLearningPathsMock.mockRejectedValueOnce(listError);
    render(await LearningPathsPage());
    expect(
      screen.getByRole("heading", {
        name: "Learning paths are unavailable.",
      }),
    ).toBeInTheDocument();

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
    const retry = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<ErrorPage error={new Error("test error")} retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it("renders the learning path error state and retries", () => {
    const retry = jest.fn();
    const error = new Error("gateway unavailable");
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<LearningPathsError error={error} retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      screen.getByRole("heading", {
        name: "Learning paths are temporarily unavailable.",
      }),
    ).toBeInTheDocument();
    expect(retry).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });
});
