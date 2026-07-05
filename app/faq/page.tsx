import type { Metadata } from "next";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "FAQ | OSINT Forge" };

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Questions and answers."
      description="A larger FAQ for accounts, credits, tools, API keys, billing, exports, and deployment."
      sections={[
        { title: "Do I need an account to use tools?", body: <p>Yes. Logged-out users can open a tool page, but they will see the create-account panel first. Signed-in users see the tool or module workspace directly.</p> },
        { title: "How many free searches do I get?", body: <p>Free accounts get 5 searches per month in the current prototype. Paid plans and credit packs raise that monthly allowance.</p> },
        { title: "Where do provider API keys go?", body: <p>Provider keys belong in Cloudflare Worker secrets, never in GitHub, the frontend, localStorage, or public environment variables.</p> },
        { title: "Will GitHub Pages run the APIs?", body: <p>No. GitHub Pages hosts the static frontend. Cloudflare Worker handles API requests, quota checks, secrets, and provider calls.</p> },
        { title: "Can I accept Stripe and crypto payments?", body: <p>Yes. Stripe Checkout and a separate crypto payment service should both call Worker webhook routes, then the Worker updates D1 subscription and credit records.</p> },
        { title: "Can I export reports?", body: <p>The export workspace is ready as a frontend module. Real report storage can use D1 for metadata and R2 for larger files when needed.</p> },
        { title: "Is OSINT Forge a hacking tool?", body: <p>No. It is designed for lawful open-source intelligence workflows, source review, enrichment, and reporting. Unauthorized access and abuse are not allowed.</p> },
      ]}
    />
  );
}

