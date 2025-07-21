import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KronJobs – Automated Job Alerts from LinkedIn",
  description: "KronJobs scrapes the universe of LinkedIn jobs and brings the right ones straight to your inbox. No login required, instant alerts, trusted by 1000+ job seekers.",
  keywords: ["job alerts", "LinkedIn scraping", "automated job search", "career opportunities", "job notifications"],
  authors: [{ name: "KronJobs Team" }],
  creator: "KronJobs",
  publisher: "KronJobs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kronjobs.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "KronJobs – Job Alerts on Autopilot",
    description: "Automated job alerts from LinkedIn. No login required, instant notifications, trusted by 1000+ professionals.",
    url: 'https://kronjobs.com',
    siteName: 'KronJobs',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KronJobs - Automated Job Alerts',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KronJobs – Job Alerts on Autopilot',
    description: 'Automated job alerts from LinkedIn. No login required, instant notifications.',
    images: ['/og-image.svg'],
    creator: '@kronjobs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider>
            <SpeedInsights />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
