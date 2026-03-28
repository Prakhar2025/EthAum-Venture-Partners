import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ethaum.ai";

interface Props {
  params: { id: string };
}

// Per Phase 8 build plan: title = "{Product Name} — EthAum.ai"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  try {
    const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
      next: { revalidate: 3600 }, // cache for 1 hour, refresh on revalidation
    });

    if (!res.ok) throw new Error("Not found");

    const product = await res.json();
    const name          = product.name ?? "Healthcare Startup";
    const description   = product.description
      ? product.description.slice(0, 160)
      : `View ${name}'s Trust Score, compliance certifications, reviews, and investor analysis on EthAum AI.`;
    const trustScore    = product.trust_score ?? null;
    const category      = product.healthcare_category ?? product.category ?? "Healthcare AI";
    const compliance    = Array.isArray(product.compliance) ? product.compliance.join(", ").toUpperCase() : "";

    const fullTitle = `${name} — EthAum.ai`;
    const fullDesc  = trustScore
      ? `${name} · Trust Score ${trustScore}/100 · ${category}${compliance ? ` · ${compliance}` : ""} — ${description}`
      : description;

    return {
      title:       fullTitle,
      description: fullDesc,
      openGraph: {
        title:       fullTitle,
        description: fullDesc,
        url:         `${SITE_URL}/product/${id}`,
        type:        "website",
        images: [
          {
            url:    `/og-image.png`,
            width:  1200,
            height: 630,
            alt:    `${name} on EthAum AI`,
          },
        ],
      },
      twitter: {
        card:        "summary_large_image",
        title:       fullTitle,
        description: fullDesc,
        images:      [`/og-image.png`],
      },
    };
  } catch {
    return {
      title:       "Healthcare Startup Profile",
      description: "View this startup's Trust Score, compliance status, reviews, and enterprise buyer matches on EthAum AI.",
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
