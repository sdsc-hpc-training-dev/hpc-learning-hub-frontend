import Link from "next/link";
import type { GatewayEventEdition } from "@/lib/gateway/types";
import type { RecordedMaterial } from "./api";

interface EventsViewProps {
  upcomingEvents: GatewayEventEdition[];
  recordings: RecordedMaterial[];
}

function formatDate(value: string | null, fallback = "Date to be announced"): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

function truncate(value: string | null, length = 180): string {
  const clean = (value ?? "").replace(/\s+/g, " ").trim();
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

function UpcomingEventCard({ event }: Readonly<{ event: GatewayEventEdition }>) {
  return (
    <article className="event-card">
      <div className="event-card__date">{formatDate(event.startAt)}</div>
      <span className="event-card__type">{event.format ?? "SDSC event"}</span>
      <h3>{event.title ?? "Untitled event"}</h3>
      <p>{truncate(event.description)}</p>
      {event.location ? <div className="event-card__location">{event.location}</div> : null}
    </article>
  );
}

function RecordingCard({ recording }: Readonly<{ recording: RecordedMaterial }>) {
  const href = `/materials/${encodeURIComponent(recording.id)}`;
  return (
    <article className="event-card">
      <div className="event-card__date">
        {formatDate(recording.recordedAt, "Recording date unavailable")}
      </div>
      <span className="event-card__type">Recorded session</span>
      <h3>
        <Link href={href}>{recording.title}</Link>
      </h3>
      <p>{truncate(recording.description)}</p>
      <Link className="text-link event-card__link" href={href}>
        Open recording or material <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function UpcomingEvents({ events }: Readonly<{ events: GatewayEventEdition[] }>) {
  return (
    <section className="section section--sand" aria-labelledby="upcoming-heading">
      <div className="section-shell">
        <div className="section-heading">
          <span className="eyebrow">SDSC schedule</span>
          <h2 id="upcoming-heading">Upcoming events</h2>
        </div>
        {events.length > 0 ? (
          <div className="event-grid">
            {events.map((event) => <UpcomingEventCard event={event} key={event.id} />)}
          </div>
        ) : (
          <EmptyEvents>No upcoming events are currently listed.</EmptyEvents>
        )}
      </div>
    </section>
  );
}

function PastRecordings({ recordings }: Readonly<{ recordings: RecordedMaterial[] }>) {
  return (
    <section className="section" aria-labelledby="recordings-heading">
      <div className="section-shell">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">Training archive</span>
            <h2 id="recordings-heading">Past sessions and recordings</h2>
            <p>Open a material to explore its recording and supporting resources.</p>
          </div>
          <Link className="text-link" href="/materials">
            Browse the Training Library <span aria-hidden="true">→</span>
          </Link>
        </div>
        {recordings.length > 0 ? (
          <div className="event-grid">
            {recordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </div>
        ) : (
          <EmptyEvents>No recorded training sessions are currently available.</EmptyEvents>
        )}
      </div>
    </section>
  );
}

export default function EventsView({
  upcomingEvents,
  recordings,
}: Readonly<EventsViewProps>) {
  return (
    <div className="events-page">
      <section className="page-hero" aria-labelledby="events-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">Events</span>
          <h1 id="events-heading">Attend what is next. Learn from what already happened.</h1>
          <p>
            View upcoming events from SDSC and past session recordings to guide
            your learning further.
          </p>
        </div>
      </section>
      <UpcomingEvents events={upcomingEvents} />
      <PastRecordings recordings={recordings} />
    </div>
  );
}
