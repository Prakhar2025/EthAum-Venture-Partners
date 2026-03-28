import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Transparent pricing for startups, enterprise buyers, and investors. From free listings to full AI due diligence — find the EthAum plan that fits your goals.",
  openGraph: {
    title: "Pricing & Plans — EthAum.ai",
    description:
      "From free startup listings to investor-grade AI due diligence. Compare all EthAum plans.",
    url: "https://ethaum.ai/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
