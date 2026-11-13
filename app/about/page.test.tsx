import { render, screen, within } from "@testing-library/react";
import AboutPage from "./page";

it("introduces the team and links to their official profiles and presentation", () => {
  const { container } = render(<AboutPage />);
  expect(
    screen.getByRole("heading", { name: "About Us", level: 1 }),
  ).toBeInTheDocument();
  for (const name of [
    "Mary Thomas",
    "Mai H. Nguyen",
    "Avery Blas",
    "Fernando Garzon",
    "Chanyoung Park",
    "Yi-Shiun (Shing) Hung",
    "Srujam Dave",
    "Keyura Valalla",
    "Arnav Dhole",
    "Yiting (Mio) Su",
    "Michael Ye",
    "Darren Yu",
  ]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    const profile = screen.getByRole("link", {
      name: `SC26 profile for ${name}`,
    });
    expect(profile).toHaveAttribute(
      "href",
      expect.stringContaining("sc26.conference-program.com/presenter/"),
    );
    expect(profile).toHaveAttribute("target", "_blank");
    expect(profile).toHaveAttribute("rel", "noopener noreferrer");
  }
  const presentation = screen.getByRole("link", {
    name: /presentation at SC26/,
  });
  expect(presentation).toHaveAttribute(
    "href",
    expect.stringContaining("ws_bphpcte116"),
  );
  expect(presentation).toHaveAttribute("target", "_blank");
  expect(
    container.querySelectorAll('.about-avatar img[src^="/team/"]'),
  ).toHaveLength(9);
  expect(
    container.querySelectorAll(".about-avatar:not([data-portrait])"),
  ).toHaveLength(3);
});

it("keeps former interns separate from current interns", () => {
  render(<AboutPage />);
  const current = within(
    screen.getByRole("region", { name: "Current Interns" }),
  );
  const former = within(screen.getByRole("region", { name: "Former Interns" }));

  expect(
    current
      .getAllByRole("heading", { level: 4 })
      .map(({ textContent }) => textContent),
  ).toEqual([
    "Srujam Dave",
    "Arnav Dhole",
    "Yi-Shiun (Shing) Hung",
    "Chanyoung Park",
    "Yiting (Mio) Su",
    "Keyura Valalla",
  ]);
  expect(
    former
      .getAllByRole("heading", { level: 4 })
      .map(({ textContent }) => textContent),
  ).toEqual(["Michael Ye", "Darren Yu"]);
});

it("lists Mary first as PI, then the rest of leadership by surname", () => {
  render(<AboutPage />);
  const leadership = within(
    screen.getByRole("region", { name: "Project Leadership" }),
  );
  expect(
    leadership
      .getAllByRole("heading", { level: 4 })
      .map(({ textContent }) => textContent),
  ).toEqual(["Mary Thomas", "Avery Blas", "Fernando Garzon", "Mai H. Nguyen"]);
  expect(screen.getByText(/Principal Investigator \(PI\)/)).toBeInTheDocument();
  expect(leadership.getByText("AI and Data Science")).toBeInTheDocument();
});

it("uses labeled new-tab links for matched social profiles only", () => {
  render(<AboutPage />);
  const linkedin = screen.getAllByRole("link", { name: / on LinkedIn$/ });
  const github = screen.getAllByRole("link", { name: / on GitHub$/ });
  expect(linkedin).toHaveLength(11);
  expect(github).toHaveLength(10);
  for (const link of [...linkedin, ...github]) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(
    screen.getByRole("link", { name: "Fernando Garzon on LinkedIn" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/fgarzonm/");
  expect(
    screen.getByRole("link", { name: "Fernando Garzon on GitHub" }),
  ).toHaveAttribute("href", "https://github.com/ofgarzon2662");
  expect(
    screen.queryByRole("link", { name: "Avery Blas on GitHub" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Yiting \(Mio\) Su on / }),
  ).not.toBeInTheDocument();
});
