import { render, screen } from "@testing-library/react";
import SiteFooter from "../SiteFooter";

jest.mock("next/navigation", () => ({
  usePathname: () => "/about",
  useSearchParams: () => new URLSearchParams(),
}));

it("uses the official white HSDSC asset in the dark footer", () => {
  render(<SiteFooter />);
  const logo = screen.getByAltText(
    "UC San Diego Halicioglu School of Data Science and Computing",
  );
  expect(logo).toHaveAttribute("src", "/brand/hsdsc-white.png");
  expect(logo.closest("a")).toHaveAttribute("href", "https://hsdsc.ucsd.edu/");
  expect(logo.closest("a")).toHaveAttribute("rel", "noopener noreferrer");
});
