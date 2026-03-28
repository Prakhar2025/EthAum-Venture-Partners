import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healthcare AI Marketplace",
  description:
    "Discover verified healthcare AI startups — filtered by HIPAA, FDA, CE Mark compliance, revenue stage, and geography. AI-powered Trust Scores included.",
  openGraph: {
    title: "Healthcare AI Marketplace — EthAum.ai",
    description:
      "Browse 100+ verified healthcare AI startups with compliance filters, Trust Scores, and investor-grade analytics.",
    url: "https://ethaum.ai/marketplace",
    images: [{ url: "/og-marketplace.png", width: 1200, height: 630, alt: "EthAum Marketplace" }],
  },
  twitter: {
    title: "Healthcare AI Marketplace — EthAum.ai",
    description: "Browse verified healthcare AI startups with Trust Scores and compliance filters.",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
