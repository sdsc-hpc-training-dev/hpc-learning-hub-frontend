import { fireEvent, render, screen } from "@testing-library/react";
import ExpandableDescription from "../ExpandableDescription";

describe("ExpandableDescription", () => {
  it("renders short descriptions without a disclosure control", () => {
    render(<ExpandableDescription text="A concise description." />);

    expect(screen.getByText("A concise description.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("truncates long descriptions and lets the reader expand and collapse them", () => {
    const text =
      "This description is intentionally longer than the limit so that the material page remains easy to scan while the complete catalog text remains available on demand.";
    render(<ExpandableDescription text={text} limit={60} />);

    const toggle = screen.getByRole("button", { name: "Show more" });
    expect(screen.queryByText(text)).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
