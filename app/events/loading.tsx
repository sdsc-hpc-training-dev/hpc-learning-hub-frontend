export default function EventsLoading() {
  return (
    <div className="events-status" role="status" aria-live="polite">
      <span className="eyebrow">Events</span>
      <h1>Loading events and recordings…</h1>
      <p>Gathering the latest public SDSC training schedule.</p>
    </div>
  );
}
