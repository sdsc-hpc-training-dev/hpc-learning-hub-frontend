import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import "./globals.css";

const sourceSans = localFont({
  src: [
    {
      path: "../public/fonts/SourceSans3-Latin-Variable.woff2",
      style: "normal",
      weight: "400 800",
    },
  ],
  variable: "--font-source-sans",
  fallback: ["system-ui", "arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HPC Learning Hub",
  description: "",
};

function FooterBrand() {
  return (
    <div className="footer-brand">
      <Image
        src="/SDSC-logo.svg"
        alt="San Diego Supercomputer Center"
        width={170}
        height={48}
        priority
      />
      <p>
        Public training, practical learning paths, and grounded discovery across
        SDSC resources.
      </p>
    </div>
  );
}

function FooterColumn({
  heading,
  links,
  content,
}: Readonly<{
  heading: string;
  links?: { href: string; label: string }[];
  content?: React.ReactNode;
}>) {
  return (
    <div>
      <h2>{heading}</h2>
      {links
        ? links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))
        : content}
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <FooterBrand />
        <FooterColumn
          heading="Explore"
          links={[
            { href: "/materials", label: "Training Library" },
            { href: "/learning-paths", label: "Learning Paths" },
            { href: "/events", label: "Events & Recordings" },
            { href: "/programs", label: "Programs & Series" },
          ]}
        />
        <FooterColumn
          heading="Contribute"
          content={
            <>
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
            </>
          }
        />
        <FooterColumn
          heading="About"
          links={[
            { href: "https://www.sdsc.edu/", label: "SDSC home" },
            {
              href: "https://www.sdsc.edu/about/brand.html",
              label: "Brand guidelines",
            },
          ]}
        />
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
