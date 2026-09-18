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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main id="main-content">{children}</main>
        <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <Image src="/SDSC-logo.svg" alt="San Diego Supercomputer Center" width={170} height={48} priority />
            <p>Public training, practical learning paths, and grounded discovery across SDSC resources.</p>
          </div>
          <div>
            <h2>Explore</h2>
            <Link href="/materials">Training Library</Link>
            <Link href="/learning-paths">Learning Paths</Link>
            <Link href="/events">Events & Recordings</Link>
            <Link href="/programs">Programs & Series</Link>
          </div>
          <div id="contribute">
            <h2>Contribute</h2>
            <p>SDSC instructors and coordinators can request that training or recordings be added.</p>
            <a href="https://www.sdsc.edu/contact.html" target="_blank" rel="noopener">Contact SDSC</a>
          </div>
          <div>
            <h2>About</h2>
            <a href="https://www.sdsc.edu/" target="_blank" rel="noopener">SDSC home</a>
            <a href="https://www.sdsc.edu/about/brand.html" target="_blank" rel="noopener">Brand guidelines</a>
          </div>
        </div>
      </footer>
      </body>
    </html>
  );
}
