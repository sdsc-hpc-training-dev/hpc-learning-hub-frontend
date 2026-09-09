import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";
import Navbar from "../Navbar";

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...imgProps } = props;
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
    expect(screen.getByAltText("San Diego Supercomputer Center")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /start here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /training library/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learning paths/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /programs & series/i })).toBeInTheDocument();
  });

  it("renders sign in and create account links", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders Ask AIDA button", () => {
    render(<Navbar />);
    const aidaButtons = screen.getAllByTitle("Ask AIDA");
    expect(aidaButtons.length).toBeGreaterThan(0);
  });

  it("renders menu toggle button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
});

describe("Navbar - Interactions", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("toggles menu when menu button is clicked", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    const nav = screen.getByRole("navigation");

    expect(nav).not.toHaveClass("is-open");

    fireEvent.click(menuButton);
    expect(nav).toHaveClass("is-open");

    fireEvent.click(menuButton);
    expect(nav).not.toHaveClass("is-open");
  });

  it("closes menu when a navigation link is clicked", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    const nav = screen.getByRole("navigation");

    fireEvent.click(menuButton);
    expect(nav).toHaveClass("is-open");

    const link = screen.getByRole("link", { name: /learning paths/i });
    fireEvent.click(link);
    expect(nav).not.toHaveClass("is-open");
  });
});

describe("Navbar - Active Page Detection", () => {
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
    const programsLink = screen.getByRole("link", { name: /programs & series/i });
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
    expect(screen.getByRole("link", { name: /start here/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /training library/i })).toHaveAttribute("href", "/materials");
    expect(screen.getByRole("link", { name: /learning paths/i })).toHaveAttribute("href", "/learning-paths");
    expect(screen.getByRole("link", { name: /^events$/i })).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: /programs & series/i })).toHaveAttribute("href", "/programs");
  });

  it("has correct account action links", () => {
    render(<Navbar />);
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    const createLink = screen.getByRole("link", { name: /create account/i });
    expect(signInLink).toHaveAttribute("href", "/account");
    expect(createLink).toHaveAttribute("href", "/account?mode=create");
  });
});
