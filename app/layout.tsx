// This is the root layout component that wraps all pages in the application
// It provides global styles and font configurations
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from './providers';
import SessionTimeout from './components/SessionTimeout';

// Load and configure the Geist Sans font for general text
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

// Load and configure the Geist Mono font for monospace text
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Define metadata for the application (SEO and browser tab info)
export const metadata: Metadata = {
  title: "SportEv",
  description: "",
};

// Root layout component that applies fonts and provides structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SessionTimeout />
          {children}
        </Providers>
      </body>
    </html>
  );
}
