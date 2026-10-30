/* eslint-disable @typescript-eslint/no-base-to-string, @typescript-eslint/no-confusing-void-expression */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FeedbackForm from "./FeedbackForm";

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
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
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ rating: 4, foundWhatNeeded: null, workedWell: "Great resources", improvements: null });
  expect(screen.getByRole("status")).toHaveTextContent("feedback was received");
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
