import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserSyncProvider } from "@/components/UserSyncProvider";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ethaum.ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EthAum AI — Healthcare AI Marketplace",
    template: "%s — EthAum.ai",
  },
  description:
    "Discover, validate, and invest in verified healthcare AI startups. AI-powered Trust Scores, compliance filters, due diligence PDFs, and enterprise matchmaking — all in one platform.",
  keywords: [
    "healthcare AI marketplace",
    "startup trust score",
    "HIPAA compliant startups",
    "investor due diligence",
    "AI validation",
    "healthcare B2B",
    "EthAum",
  ],
  authors: [{ name: "EthAum AI" }],
  creator: "EthAum AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "EthAum AI",
    title: "EthAum AI — Healthcare AI Marketplace",
    description:
      "Discover, validate, and invest in verified healthcare AI startups with AI-powered Trust Scores.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EthAum AI — Healthcare AI Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EthAum AI — Healthcare AI Marketplace",
    description:
      "Discover verified healthcare AI startups. AI Trust Scores, compliance filters, investor tools.",
    images: ["/og-image.png"],
    creator: "@EthAumAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white antialiased`}>
          <UserSyncProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </UserSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
