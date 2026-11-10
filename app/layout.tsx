
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://repo-doctor-hazel.vercel.app"),

  title: {
    default: "RepoDoctor | GitHub Repository Health Intelligence",
    template: "%s | RepoDoctor",
  },

  description:
    "Analyze, diagnose, and compare GitHub repositories. Explore repository health scores, security signals, testing, CI/CD, maintenance, and actionable recommendations.",

  applicationName: "RepoDoctor",

  keywords: [
    "RepoDoctor",
    "GitHub repository analyzer",
    "Repository health",
    "GitHub repository comparison",
    "Code quality",
    "Security analysis",
    "Open source",
    "Developer tools",
  ],

  openGraph: {
    type: "website",
    url: "https://repo-doctor-hazel.vercel.app",
    siteName: "RepoDoctor",
    title: "RepoDoctor | Repository Health Intelligence",
    description:
      "Understand your GitHub repository's health. Analyze engineering quality, detect gaps, and compare projects.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
