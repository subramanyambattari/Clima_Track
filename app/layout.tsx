import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Weather-Based Outfit Suggestion System",
  description: "Personalized weather-aware outfit recommendations with real-time weather, auth, and saved preferences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
