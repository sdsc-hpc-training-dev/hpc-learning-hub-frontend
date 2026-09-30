import Link from "next/link";
import MaterialCard from "@/features/training-library/MaterialCard";
import { UpcomingEventCard } from "@/features/events/EventsView";
import { ProgramCard } from "@/features/programs/ProgramsView";
import type { StartHereData } from "./api";

function EmptyCollection({ message }: Readonly<{ message: string }>) {
  return (
    <p className="home-empty" role="status">
      {message}
    </p>
  );
}

function filterHref(type: string, name: string) {
  const query = new URLSearchParams({ [type]: name });
  return `/materials?${query.toString()}`;
}

// The landing page keeps its reference sections in one stable reading order.
// eslint-disable-next-line max-lines-per-function
export default function StartHereView({
  data,
}: Readonly<{ data: StartHereData }>) {
  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-header">
        <div className="hero-shell">
          <div className="hero-content">
            <span className="eyebrow">Free public learning from SDSC</span>
            <h1 id="hero-header">
              Find the training that moves your work forward
            </h1>
            <p className="lede">
              Explore practical HPC (High Performance Computing) learning paths,
              system guides, upcoming events, and supporting resources from the
              San Diego Supercomputer Center.
            </p>
          </div>
          <div className="hero-actions" aria-label="Choose how to begin">
            <Link className="route-action" href="/materials">
              <strong>Find training</strong>
              <span>Search by topic, tool, system, or format.</span>
            </Link>
            <Link className="route-action" href="/learning-paths">
              <strong>Explore learning paths</strong>
              <span>Follow a short, guided learning sequence.</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section section--compact section--blue"
        aria-labelledby="browse-heading"
      >
        <div className="section-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Browse without jargon</span>
              <h2 id="browse-heading">Start with something you recognize.</h2>
              <p>
                Choose a system, subject, or tool. The library will apply the
                matching filter for you.
              </p>
            </div>
            <Link className="text-link" href="/materials">
              See the full Training Library →
            </Link>
          </div>
          {data.browseOptions.length ? (
            <div
              className="home-topic-grid"
              aria-label="Browse training filters"
            >
              {data.browseOptions.map((option) => (
                <Link
                  className="browse-tile"
                  href={filterHref(option.type, option.name)}
                  key={`${option.type}-${option.name}`}
                >
                  <span className="browse-tile__type">{option.type}</span>
                  <strong>{option.name}</strong>
                  <span>
                    Browse {option.count} materials{" "}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyCollection message="Browse options will appear when catalog filters are available." />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="featured-heading">
        <div className="section-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Good places to begin</span>
              <h2 id="featured-heading">Featured Trainings</h2>
              <p>Explore training materials from across the SDSC catalog.</p>
            </div>
            <Link className="text-link" href="/materials">
              Browse all training →
            </Link>
          </div>
          {data.featuredMaterials.length ? (
            <div className="home-material-grid">
              {data.featuredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <EmptyCollection message="Featured training will appear here when materials are available." />
          )}
        </div>
      </section>

      <section
        className="section section--compact section--sand home-upcoming"
        aria-labelledby="upcoming-events-heading"
      >
        <div className="section-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Live Training</span>
              <h2 id="upcoming-events-heading">Upcoming Events</h2>
            </div>
            <Link className="text-link" href="/events">
              Browse Events →
            </Link>
          </div>
          {data.upcomingEvents.length ? (
            <div className="event-grid">
              {data.upcomingEvents.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyCollection message="No upcoming events are currently listed." />
          )}
        </div>
      </section>

      <section
        className="section section--soft"
        aria-labelledby="paths-heading"
      >
        <div className="section-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Ordered guidance</span>
              <h2 id="paths-heading">Learning Paths</h2>
              <p>
                Follow a curated sequence of materials toward a learning goal.
              </p>
            </div>
            <Link className="text-link" href="/learning-paths">
              Explore all learning paths →
            </Link>
          </div>
          {data.learningPaths.length ? (
            <div className="home-path-grid">
              {data.learningPaths.map((path) => {
                const title = path.title ?? path.name ?? "Learning path";
                const href = `/learning-paths/${encodeURIComponent(path.id)}`;
                return (
                  <article className="learning-path-card" key={path.id}>
                    <span className="eyebrow">Curated learning path</span>
                    <h3>
                      <Link href={href}>{title}</Link>
                    </h3>
                    {path.description ? <p>{path.description}</p> : null}
                    <div className="learning-path-card__footer">
                      <span>Explore the sequence</span>
                      <Link className="text-link" href={href}>
                        Open path <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyCollection message="Learning paths will appear here when available." />
          )}
        </div>
      </section>

      <section
        className="section section--sand"
        aria-labelledby="programs-heading"
      >
        <div className="section-shell">
          <div className="section-heading">
            <span className="eyebrow">Recurring programs</span>
            <h2 id="programs-heading">
              Understand the collections behind the material.
            </h2>
            <p>
              Programs and series connect individual sessions to a recognizable
              learning context.
            </p>
          </div>
          {data.programs.length ? (
            <div className="event-grid home-program-grid">
              {data.programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  selected={false}
                />
              ))}
            </div>
          ) : (
            <EmptyCollection message="No programs or series are currently listed." />
          )}
        </div>
      </section>
    </div>
  );
}
