import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "Legal Notice | OSINT Forge" };

export default function LegalPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Legal center."
      description="Important notices for using OSINT Forge, requesting support, understanding acceptable use, and contacting us about privacy or data concerns."
      sections={[
        {
          title: "Legal notice",
          body: <p>OSINT Forge provides investigation workflow software for lawful open-source intelligence research. Users are responsible for making sure their searches, exports, and use of third-party data providers comply with applicable laws, contracts, platform terms, and internal authorization rules.</p>,
        },
        {
          title: "Acceptable use",
          body: <p>You may not use OSINT Forge to stalk, harass, threaten, dox, unlawfully profile, bypass access controls, obtain unauthorized access, or target people or systems without a lawful basis. We may suspend access when usage appears abusive, illegal, or harmful.</p>,
        },
        {
          title: "Data removal",
          body: <p>To request review or removal of content shown through OSINT Forge, contact us with the affected identifier, the reason for the request, and proof that you are authorized to make it. Some results come from third-party providers, so we may direct you to the original source when we cannot remove it directly.</p>,
        },
        {
          title: "Related policies",
          body: <p>Read the <Link className="legal-inline-link" href="/terms/">Terms of Service</Link>, <Link className="legal-inline-link" href="/privacy/">Privacy Policy</Link>, and <Link className="legal-inline-link" href="/eula/">EULA</Link> for the full operating rules.</p>,
        },
      ]}
    />
  );
}

