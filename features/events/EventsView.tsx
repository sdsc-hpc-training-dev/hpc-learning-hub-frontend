import type { GatewayEventEdition } from "@/lib/gateway/types";
import { catalogPlainText } from "@/features/training-library/presentation";
import type { RecordedMaterial } from "./api";
import PastRecordings from "./PastRecordings";
import InlineError from "@/components/ui/InlineError";

interface EventsViewProps {
  upcomingEvents: GatewayEventEdition[];
  recordings: RecordedMaterial[];
  error?: string;
}

function formatSchedule(
  event: GatewayEventEdition,
  fallback = "Date to be announced",
): string {
  if (!event.startAt) return fallback;
  const date = new Date(event.startAt);
  if (Number.isNaN(date.getTime())) return fallback;
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  };
  if (event.isTimeDisplayed !== false) {
    options.hour = "numeric";
    options.minute = "2-digit";
    options.timeZoneName = "short";
  }
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function truncate(value: string | null, length = 180): string {
  const clean = catalogPlainText(value);
  if (!clean) return "Additional event details are not available yet.";
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

function EmptyEvents({ children }: Readonly<{ children: string }>) {
  return (
    <div className="events-status" role="status">
      <p>{children}</p>
    </div>
  );
}

export function UpcomingEventCard({
  event,
}: Readonly<{ event: GatewayEventEdition }>) {
  const title = event.title ?? "Untitled event";
  const titleContent = event.eventUrl ? (
    <a href={event.eventUrl} target="_blank" rel="noreferrer">
      {title}
    </a>
  ) : (
    title
  );

  return (
    <article className="event-card">
      <time className="event-card__date" dateTime={event.startAt ?? undefined}>
        {formatSchedule(event)}
      </time>
      <span className="event-card__type">{event.format ?? "SDSC event"}</span>
      <h3>{titleContent}</h3>
      <p>{truncate(event.description)}</p>
      {event.location ? (
        <div className="event-card__location">{event.location}</div>
      ) : null}
      {event.registrationUrl || event.eventUrl ? (
        <div className="event-card__actions">
          {event.registrationUrl ? (
            <a
              className="text-link"
              href={event.registrationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Register <span aria-hidden="true">→</span>
            </a>
          ) : null}
          {event.eventUrl ? (
            <a
              className="text-link"
              href={event.eventUrl}
              target="_blank"
              rel="noreferrer"
            >
              Event details <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function UpcomingEvents({
  events,
}: Readonly<{ events: GatewayEventEdition[] }>) {
  return (
    <section
      className="section section--sand"
      aria-labelledby="upcoming-heading"
    >
      <div className="section-shell">
        <div className="section-heading">
          <span className="eyebrow">SDSC schedule</span>
          <h2 id="upcoming-heading">Upcoming events</h2>
        </div>
        {events.length > 0 ? (
          <div className="event-grid">
            {events.map((event) => (
              <UpcomingEventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <EmptyEvents>No upcoming events are currently listed.</EmptyEvents>
        )}
      </div>
    </section>
  );
}

export default function EventsView({
  upcomingEvents,
  recordings,
  error,
}: Readonly<EventsViewProps>) {
  return (
    <div className="events-page">
      <section className="page-hero" aria-labelledby="events-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">Events</span>
          <h1 id="events-heading">
            Attend what is next. Learn from what already happened.
          </h1>
          <p>
            View upcoming events from SDSC and past session recordings to guide
            your learning further.
          </p>
        </div>
      </section>
      {error ? (
        <InlineError title="Events are unavailable." message={error} />
      ) : (
        <>
          <UpcomingEvents events={upcomingEvents} />
          <PastRecordings recordings={recordings} />
        </>
      )}
    </div>
  );
}
