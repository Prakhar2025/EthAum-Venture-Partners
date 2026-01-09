import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserSyncProvider } from "@/components/UserSyncProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EthAum AI - AI-Powered Credibility for Startups",
  description:
    "Discover, validate, and launch growth-stage startups with AI-powered trust scores.",
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
