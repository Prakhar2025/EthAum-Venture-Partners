import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launch Leaderboard",
  description:
    "Today's top healthcare AI startups ranked by community upvotes. See which products are gaining the most traction on the EthAum platform.",
  openGraph: {
    title: "Launch Leaderboard — EthAum.ai",
    description: "Top healthcare AI startups ranked by community upvotes today.",
    url: "https://ethaum.ai/leaderboard",
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
