import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
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
            <img src="SDSC-logo.svg" alt="San Diego Supercomputer Center" />
            <p>Public training, practical learning paths, and grounded discovery across SDSC resources.</p>
          </div>
          <div>
            <h2>Explore</h2>
            <a href="training-catalog.html">Training Library</a>
            <a href="learning-paths.html">Learning Paths</a>
            <a href="events.html">Events & Recordings</a>
            <a href="programs.html">Programs & Series</a>
          </div>
          <div id="contribute">
            <h2>Contribute</h2>
            <p>SDSC instructors and coordinators can request that training or recordings be added.</p>
            <a href="https://www.sdsc.edu/about/contact_us.html" target="_blank" rel="noopener">Contact SDSC</a>
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
