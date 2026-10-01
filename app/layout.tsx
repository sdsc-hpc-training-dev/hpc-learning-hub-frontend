import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { ToastProvider } from "@/components/ui/ToastProvider";
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
        <ToastProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
