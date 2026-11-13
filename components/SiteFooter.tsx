import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import FooterFeedbackLink from "@/features/feedback/FooterFeedbackLink";
import {
  bugReportLinkLabel,
  feedbackIssuesUrl,
  feedbackLinkLabel,
} from "@/features/feedback/links";

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
          <a
            className="footer-school-brand"
            href="https://hsdsc.ucsd.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/brand/hsdsc-white.png"
              alt="UC San Diego Halicioglu School of Data Science and Computing"
              width={473}
              height={150}
              unoptimized
            />
          </a>
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
          <Suspense
            fallback={<Link href="/feedback">{feedbackLinkLabel}</Link>}
          >
            <FooterFeedbackLink />
          </Suspense>
          <a href={feedbackIssuesUrl} target="_blank" rel="noopener noreferrer">
            {bugReportLinkLabel}
          </a>
        </div>
        <div>
          <h2>About</h2>
          <Link href="/about">About Us</Link>
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
