import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "Support | OSINT Forge" };

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Support center."
      description="Get help with account access, credits, provider keys, billing, Cloudflare deployment, and investigation modules."
      sections={[
        {
          title: "Support requests",
          body: <p>For account, billing, or technical help, include your account email, the tool name, the target type, the time of the issue, and any error shown on screen. Do not send private API keys in support messages.</p>,
        },
        {
          title: "Documentation",
          body: <p>Setup notes currently live inside the project docs and Cloudflare Worker files. The important production flow is GitHub Pages for the frontend, Cloudflare Worker for API calls, D1 for accounts and quota, and server-side secrets for provider API keys.</p>,
        },
        {
          title: "Billing support",
          body: <p>When Stripe and the crypto payment service are connected, payment receipts, failed renewals, plan upgrades, and credit packs should be handled from the account dashboard. Until then, checkout is a prototype shell.</p>,
        },
        {
          title: "Need direct help?",
          body: <p>Use the <Link className="legal-inline-link" href="/contact/">contact page</Link> for direct requests, legal messages, provider access questions, or urgent support.</p>,
        },
      ]}
    />
  );
}

