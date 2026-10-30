import Image from "next/image";
import Link from "next/link";

// Footer columns intentionally remain together for the site-wide layout.
// eslint-disable-next-line max-lines-per-function
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <Image
            src="/SDSC-logo.svg"
            alt="San Diego Supercomputer Center"
            width={170}
            height={48}
            priority
          />
          <p>
            Public training, practical learning paths, and grounded discovery
            across SDSC resources.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/materials">Training Library</Link>
          <Link href="/learning-paths">Learning Paths</Link>
          <Link href="/events">Events &amp; Recordings</Link>
          <Link href="/programs">Programs &amp; Series</Link>
        </div>
        <div id="contribute">
          <h2>Contribute</h2>
          <p>
            SDSC instructors and coordinators can request that training or
            recordings be added.
          </p>
          <a
            href="https://www.sdsc.edu/contact.html"
            target="_blank"
            rel="noopener"
          >
            Contact SDSC
          </a>
          <Link href="/feedback">Give feedback</Link>
          <a
            href="https://github.com/sdsc-hpc-training-dev/learning-hub-feedback/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report a bug or request a feature
          </a>
        </div>
        <div>
          <h2>About</h2>
          <a href="https://www.sdsc.edu/" target="_blank" rel="noopener">
            SDSC home
          </a>
          <a
            href="https://www.sdsc.edu/about/brand.html"
            target="_blank"
            rel="noopener"
          >
            Brand guidelines
          </a>
        </div>
      </div>
    </footer>
  );
}
