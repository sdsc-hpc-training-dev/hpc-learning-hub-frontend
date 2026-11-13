import { render, screen } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import FeedbackLink from "./FeedbackLink";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

it.each([
  ["/about", "", "/feedback?returnTo=%2Fabout"],
  ["/feedback", "returnTo=%2Fabout", "/feedback?returnTo=%2Fabout"],
  ["/feedback", "returnTo=https%3A%2F%2Fevil.invalid", "/feedback"],
  ["/account", "", "/feedback"],
])(
  "uses a safe, non-recursive return URL from %s?%s",
  (pathname, query, href) => {
    jest.mocked(usePathname).mockReturnValue(pathname);
    jest
      .mocked(useSearchParams)
      .mockReturnValue(
        new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
      );
    render(<FeedbackLink label="Feedback" />);
    expect(screen.getByRole("link", { name: "Feedback" })).toHaveAttribute(
      "href",
      href,
    );
  },
);
