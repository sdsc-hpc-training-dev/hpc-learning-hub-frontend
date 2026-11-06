import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

it("introduces the team and links to their official profiles and presentation", () => {
  render(<AboutPage />);
  for (const name of ["Mary Thomas", "Mai Nguyen", "Avery Blas", "Fernando Garzon", "Chanyoung Park", "Yi-Shiun (Shing) Hung", "Srujam Dave", "Keyura Valalla"]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `SC26 profile for ${name}` })).toHaveAttribute("href", expect.stringContaining("sc26.conference-program.com/presenter/"));
  }
  expect(screen.getByRole("link", { name: /presentation at SC26/ })).toHaveAttribute("href", expect.stringContaining("ws_bphpcte116"));
});
