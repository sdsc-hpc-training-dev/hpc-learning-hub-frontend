import { render, screen } from "@testing-library/react";
import EventsView from "../EventsView";

const upcomingEvent = {
  id: "event-1",
  title: "Upcoming HPC workshop",
  description: "A practical workshop.",
  startAt: "2027-06-23T18:00:00.000Z",
  endAt: "2027-06-23T19:30:00.000Z",
  format: "online",
  location: "Remote event",
  eventUrl: "https://www.sdsc.edu/events/upcoming-workshop.html",
  registrationUrl: "https://registration.example/upcoming-workshop",
  isTimeDisplayed: true,
};

const recording = {
  id: "material-1",
  title: "Recorded HPC session",
  description: "Watch the archived session.",
  recordedAt: "2026-04-12T18:00:00.000Z",
};

describe("event source text", () => {
  it("cleans encoded titles, locations and archive descriptions on both event sections", () => {
    const { container } = render(
      <EventsView
        upcomingEvents={[
          {
            ...upcomingEvent,
            title: "Research &amp; HPC",
            location: "Room A &amp; B",
            description: "<p>Learn &copy; SDSC.</p>",
          },
        ]}
        recordings={[
          {
            ...recording,
            title: "Cheap &amp; FAIR Data Practices",
            description:
              'Python&#8212;Numba and Dask. <a name="top" </a Watch the recording.',
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Research & HPC" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cheap & FAIR Data Practices" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Room A & B")).toBeInTheDocument();
    expect(
      screen.getByText("Python\u2014Numba and Dask. Watch the recording."),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/&amp;|&#8212;|<a /);
  });
});

describe("EventsView", () => {
  it("renders upcoming events and recording links", () => {
    render(
      <EventsView upcomingEvents={[upcomingEvent]} recordings={[recording]} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Attend what is next. Learn from what already happened.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upcoming HPC workshop")).toBeInTheDocument();
    expect(screen.getByText("Remote event")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "https://registration.example/upcoming-workshop",
    );
    expect(screen.getByRole("link", { name: "Event details" })).toHaveAttribute(
      "href",
      "https://www.sdsc.edu/events/upcoming-workshop.html",
    );
    expect(
      screen.getByRole("link", { name: "Recorded HPC session" }),
    ).toHaveAttribute("href", "/materials/material-1");
  });

  it("renders honest empty states", () => {
    render(<EventsView upcomingEvents={[]} recordings={[]} />);

    const statuses = screen.getAllByRole("status");
    expect(statuses[0]).toHaveTextContent(
      "No upcoming events are currently listed.",
    );
    expect(statuses[1]).toHaveTextContent(
      "No recorded training sessions are currently available.",
    );
  });

  it("labels a missing recording date as unavailable", () => {
    render(
      <EventsView
        upcomingEvents={[]}
        recordings={[{ ...recording, recordedAt: null }]}
      />,
    );

    expect(screen.getByText("Recording date unavailable")).toBeInTheDocument();
  });
});
