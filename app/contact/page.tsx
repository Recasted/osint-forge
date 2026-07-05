import type { Metadata } from "next";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "Contact | OSINT Forge" };

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Contact OSINT Forge."
      description="Use this page for support, partnerships, billing questions, provider integrations, and legal or removal requests."
      sections={[
        {
          title: "General contact",
          body: <p>Email: support@osintforge.dev. Include a clear subject, your account email if you have one, and the module or page your request is about.</p>,
        },
        {
          title: "Legal and removal requests",
          body: <p>Email: legal@osintforge.dev. Include the affected data, source URL if visible, proof of authorization, and the action you are requesting.</p>,
        },
        {
          title: "Provider and API partnerships",
          body: <p>Email: partnerships@osintforge.dev. Send your API documentation, rate limits, allowed use cases, pricing, and any compliance requirements.</p>,
        },
        {
          title: "Community",
          body: <p>Telegram updates: https://t.me/osintforgeupdates. Community channel: https://t.me/OsintForgeChat.</p>,
        },
      ]}
    />
  );
}

