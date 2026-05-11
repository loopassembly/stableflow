import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";

import { FirebaseSessionBridge } from "@/components/auth/firebase-session-bridge";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const bodySans = Manrope({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const headingSans = Manrope({
  variable: "--font-heading-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const displaySans = Archivo_Black({
  variable: "--font-display-sans",
  subsets: ["latin"],
  weight: ["400"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-body-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "StableFlow",
  description:
    "Dodo-powered revenue routing and Solana stablecoin settlement for global SaaS teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${headingSans.variable} ${displaySans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <FirebaseSessionBridge />
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
