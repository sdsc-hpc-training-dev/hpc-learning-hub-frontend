import { render, screen } from "@testing-library/react";
import Page from "@/app/programs/materials/page";
import { getSeriesMaterialsData } from "../api";
import { redirect } from "next/navigation";

jest.mock("../api", () => ({
  ...jest.requireActual<typeof import("../api")>("../api"),
  getSeriesMaterialsData: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
  redirect: jest.fn(() => {
    throw new Error("REDIRECT");
  }),
}));
const load = jest.mocked(getSeriesMaterialsData);
const program = { id: "series-1", name: "COMPLECS", total: 12, materials: [] };

describe("series materials route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("reads a directly linked series and page from URL state", async () => {
    load.mockResolvedValue({ program, page: 2, totalPages: 2 });
    render(
      await Page({
        searchParams: Promise.resolve({
          program: ["series-1", "other"],
          page: "2",
        }),
      }),
    );
    expect(load).toHaveBeenCalledWith("series-1", 2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "12 associated materials. Page 2 of 2.",
    );
  });
  it("redirects an out-of-range URL to its bounded page", async () => {
    load.mockResolvedValue({ program, page: 2, totalPages: 2 });
    await expect(
      Page({
        searchParams: Promise.resolve({ program: "series-1", page: "999" }),
      }),
    ).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith(
      "/programs/materials?program=series-1&page=2",
    );
  });
  it("renders unknown-series guidance without loading unfiltered materials", async () => {
    load.mockResolvedValue({ program: null, page: 1, totalPages: 0 });
    render(await Page());
    expect(load).toHaveBeenCalledWith(undefined, 1);
    expect(
      screen.getByRole("heading", { name: "Series unavailable" }),
    ).toBeInTheDocument();
  });
  it("renders a service error separately from zero results", async () => {
    load.mockRejectedValue(new Error("Offline"));
    const log = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    render(
      await Page({ searchParams: Promise.resolve({ program: "series-1" }) }),
    );
    expect(
      screen.getByText("We could not reach this collection. Please try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No training materials/)).not.toBeInTheDocument();
    log.mockRestore();
  });
});
