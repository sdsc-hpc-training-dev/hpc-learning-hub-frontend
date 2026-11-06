/* eslint-disable @typescript-eslint/no-base-to-string, @typescript-eslint/no-confusing-void-expression */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FeedbackForm from "./FeedbackForm";

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const scrollToMock = jest.fn();

afterEach(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  fetchMock.mockReset();
  scrollToMock.mockClear();
  global.fetch = fetchMock;
  jest.spyOn(window, "scrollTo").mockImplementation(scrollToMock);
});

it("validates the rating and submits anonymous normalized feedback once", async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 201 } as Response);
  render(<FeedbackForm />);
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Choose an overall experience rating");
  expect(screen.getByRole("radio", { name: "1" })).toHaveFocus();
  fireEvent.click(screen.getByRole("radio", { name: "4" }));
  fireEvent.change(screen.getByLabelText(/What worked well/), { target: { value: "  Great resources  " } });
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(fetchMock).toHaveBeenCalledWith("/api/v1/feedback", expect.objectContaining({ credentials: "omit" }));
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ rating: 4, foundWhatNeeded: null, workedWell: "  Great resources  ", improvements: null });
  expect(screen.getByRole("status")).toHaveTextContent("Feedback received");
  const confirmation = screen.getByRole("heading", { name: "Thanks for helping us improve.", level: 1 });
  await waitFor(() => expect(confirmation).toHaveFocus());
  expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  expect(screen.queryByRole("heading", { name: "Help improve the Learning Hub." })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Go back" })).toHaveAttribute("href", "/");
});

it("offers a safe return to the filtered library after submission", async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 201 } as Response);
  render(<FeedbackForm returnTo="/materials?query=HPC" />);
  fireEvent.click(screen.getByRole("radio", { name: "4" }));
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  expect(await screen.findByRole("link", { name: "Go back" })).toHaveAttribute("href", "/materials?query=HPC");
  expect(screen.getByRole("link", { name: "Browse the Training Library" })).toHaveAttribute("href", "/materials");
  expect(screen.getByRole("heading", { name: "Keep exploring the Hub" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Explore the Learning Hub" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^Learning Paths/ })).toHaveAttribute("href", "/learning-paths");
  expect(screen.getByRole("link", { name: /^Events & Recordings/ })).toHaveAttribute("href", "/events");
  expect(screen.getByRole("link", { name: /^Programs & Series/ })).toHaveAttribute("href", "/programs");
});

it("keeps values and exposes a friendly retry state after failure", async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);
  render(<FeedbackForm />);
  fireEvent.click(screen.getByRole("radio", { name: "5" }));
  fireEvent.change(screen.getByLabelText(/What could improve/), { target: { value: "More examples" } });
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("temporarily unavailable"));
  expect(screen.getByLabelText(/What could improve/)).toHaveValue("More examples");
});

it("preserves nonblank whitespace and newlines while converting blank text to null", async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 201 } as Response);
  render(<FeedbackForm />);
  fireEvent.click(screen.getByRole("radio", { name: "3" }));
  fireEvent.change(screen.getByLabelText(/What worked well/), { target: { value: "\n  Useful detail\n" } });
  fireEvent.change(screen.getByLabelText(/What could improve/), { target: { value: " \n\t " } });
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ rating: 3, foundWhatNeeded: null, workedWell: "\n  Useful detail\n", improvements: null });
});
