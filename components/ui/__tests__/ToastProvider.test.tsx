import { fireEvent, render, screen } from "@testing-library/react";
import InlineError from "../InlineError";
import { ToastProvider, useToast } from "../ToastProvider";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

function ToastTrigger() {
  const notify = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        notify("Saved successfully.", "success");
      }}
    >
      Save
    </button>
  );
}

describe("toast feedback", () => {
  it("shows and dismisses API feedback", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully.");
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("announces an inline API error and offers retry", () => {
    const onRetry = jest.fn();
    render(
      <ToastProvider>
        <InlineError
          title="Could not load materials."
          message="The training catalog is unavailable."
          onRetry={onRetry}
        />
      </ToastProvider>,
    );

    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
      "The training catalog is unavailable.",
    );
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
