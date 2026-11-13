import { fireEvent, render, screen, within } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import Navbar from "../Navbar";

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  unoptimized?: boolean;
}

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, unoptimized, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} />;
  },
}));

describe("Navbar - Rendering", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders navbar with site branding", () => {
    render(<Navbar />);
    expect(screen.getByText("HPC Learning Hub")).toBeInTheDocument();
    expect(
      screen.getByAltText("San Diego Supercomputer Center"),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(
        "UC San Diego Halicioglu School of Data Science and Computing",
      ),
    ).toHaveAttribute("src", "/brand/hsdsc-blue-gold.png");
  });

  it("renders all navigation links", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /start here/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /training library/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /learning paths/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /programs & series/i }),
    ).toBeInTheDocument();
  });
  it("groups the Hub name with the SDSC wordmark to the right of HSDSC", () => {
    render(<Navbar />);
    const title = screen.getByRole("link", { name: "HPC Learning Hub" });
    const group = title.parentElement;
    expect(group).toHaveClass("site-brand-lockup");
    expect(
      Array.from(group?.children ?? []).map((element) => element.className),
    ).toEqual(["site-school-brand", "site-brand", "site-name"]);
  });
  it("renders menu toggle button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
});

describe("Navbar - Utility navigation", () => {
  it.each(["/about", "/feedback"])(
    "keeps About and Feedback in the same tab on %s",
    (pathname) => {
      (usePathname as jest.Mock).mockReturnValue(pathname);
      render(<Navbar />);
      const utility = within(
        screen.getByRole("navigation", { name: "About and feedback" }),
      );
      for (const label of ["About Us", "Give us some feedback"]) {
        expect(utility.getByRole("link", { name: label })).not.toHaveAttribute(
          "target",
        );
      }
      expect(
        utility.getByRole("link", {
          name: pathname === "/about" ? "About Us" : "Give us some feedback",
        }),
      ).toHaveAttribute("aria-current", "page");
    },
  );

  it("preserves filtered results as the survey return destination", () => {
    (usePathname as jest.Mock).mockReturnValue("/materials");
    (useSearchParams as jest.Mock).mockReturnValueOnce(
      new URLSearchParams("query=Containers&page=2"),
    );
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: "Give us some feedback" }),
    ).toHaveAttribute(
      "href",
      "/feedback?returnTo=%2Fmaterials%3Fquery%3DContainers%26page%3D2",
    );
  });

  it("offers a short, safely opened GitHub problem-report link", () => {
    (usePathname as jest.Mock).mockReturnValue("/about");
    render(<Navbar />);
    const report = screen.getByRole("link", { name: /Report a bug/ });
    expect(report).toHaveAttribute(
      "href",
      "https://github.com/sdsc-hpc-training-dev/learning-hub-feedback/issues/new/choose",
    );
    expect(report).toHaveAttribute("target", "_blank");
    expect(report).toHaveAttribute("rel", "noopener noreferrer");
    expect(report.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(report.querySelector("svg")).toHaveClass("site-utility__bug");
  });
});

describe("Navbar - Interactions", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("toggles menu when menu button is clicked", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });

    expect(nav).not.toHaveClass("is-open");

    fireEvent.click(menuButton);
    expect(nav).toHaveClass("is-open");

    fireEvent.click(menuButton);
    expect(nav).not.toHaveClass("is-open");
  });

  it("closes menu when a navigation link is clicked", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });

    fireEvent.click(menuButton);
    expect(nav).toHaveClass("is-open");

    const link = screen.getByRole("link", { name: /learning paths/i });
    fireEvent.click(link);
    expect(nav).not.toHaveClass("is-open");
  });
});

describe("Navbar - Active Page Detection", () => {
  it("does not expose account actions in the public navigation", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: "My Account" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "My Learning" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Account" })).toBeNull();
  });
  it("keeps a series materials drill-down under Programs & Series", () => {
    (usePathname as jest.Mock).mockReturnValue("/programs/materials");
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /programs & series/i }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /training library/i }),
    ).not.toHaveAttribute("aria-current");
  });
  it("sets active page indicator for current route", () => {
    (usePathname as jest.Mock).mockReturnValue("/learning-paths");
    render(<Navbar />);
    const learningLink = screen.getByRole("link", { name: /learning paths/i });
    expect(learningLink).toHaveAttribute("aria-current", "page");
  });

  it("highlights home page correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<Navbar />);
    const homeLink = screen.getByRole("link", { name: /start here/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });

  it("highlights events page correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/events");
    render(<Navbar />);
    const eventsLink = screen.getByRole("link", { name: /^events$/i });
    expect(eventsLink).toHaveAttribute("aria-current", "page");
  });

  it("highlights programs page correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/programs");
    render(<Navbar />);
    const programsLink = screen.getByRole("link", {
      name: /programs & series/i,
    });
    expect(programsLink).toHaveAttribute("aria-current", "page");
  });

  it("highlights materials page as catalog", () => {
    (usePathname as jest.Mock).mockReturnValue("/materials");
    render(<Navbar />);
    const catalogLink = screen.getByRole("link", { name: /training library/i });
    expect(catalogLink).toHaveAttribute("aria-current", "page");
  });
});

describe("Navbar - Navigation Links", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("has correct navigation links", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /start here/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: /training library/i }),
    ).toHaveAttribute("href", "/materials");
    expect(
      screen.getByRole("link", { name: /learning paths/i }),
    ).toHaveAttribute("href", "/learning-paths");
    expect(screen.getByRole("link", { name: /^events$/i })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(
      screen.getByRole("link", { name: /programs & series/i }),
    ).toHaveAttribute("href", "/programs");
  });
  /*
  it("has correct account action links", () => {
    render(<Navbar />);
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    const createLink = screen.getByRole("link", { name: /create account/i });
    expect(signInLink).toHaveAttribute("href", "/account");
    expect(createLink).toHaveAttribute("href", "/account?mode=create");
  });*/
});
