import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges & Innovation Competitions",
  description:
    "Enterprise-posted healthcare AI challenges — submit your startup to solve real clinical problems and win contracts. Agorize-style innovation board for healthcare B2B.",
  openGraph: {
    title: "Healthcare AI Challenges — EthAum.ai",
    description:
      "Solve real clinical problems posted by enterprise healthcare organizations. Win contracts and gain visibility.",
    url: "https://ethaum.ai/challenges",
  },
};

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
