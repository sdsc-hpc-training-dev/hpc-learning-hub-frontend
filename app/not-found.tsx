import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page" role="status">
      <span className="eyebrow">404 · Not found</span>
      <h1>Page not found</h1>
      <p>
        This page or training material is unavailable. It may have moved or the
        address may be incorrect.
      </p>
      <div className="not-found-page__actions">
        <Link className="button button--gold" href="/materials">
          Browse the Training Library
        </Link>
        <Link className="text-link" href="/">
          Return home
        </Link>
      </div>
    </section>
  );
}
