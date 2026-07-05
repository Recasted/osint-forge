import type { Metadata } from "next";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "Privacy Policy | OSINT Forge" };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy Policy."
      description="This policy explains what OSINT Forge stores, why it is needed, and how privacy requests are handled."
      sections={[
        { title: "Information we collect", body: <p>We may collect account details, username, email address, plan status, payment references, search usage counts, support messages, and operational logs needed to run and secure the platform.</p> },
        { title: "Search inputs", body: <p>Search inputs may be processed by Cloudflare Worker and authorized third-party providers to return results. Do not enter sensitive data unless you have a lawful basis and authorization to process it.</p> },
        { title: "How we use information", body: <p>We use information to provide accounts, enforce quotas, process payments, prevent abuse, respond to support requests, maintain security, and improve the service.</p> },
        { title: "Payments", body: <p>Stripe and a separate crypto payment provider may process payment information. OSINT Forge should store payment status, plan references, and receipts, not full card numbers or private wallet secrets.</p> },
        { title: "Data sharing", body: <p>We may share necessary data with infrastructure providers, payment processors, API providers, security tools, or legal authorities when required to operate the service or comply with law.</p> },
        { title: "Retention", body: <p>We keep account, billing, usage, and support records only as long as needed for service operation, security, accounting, legal compliance, and dispute handling.</p> },
        { title: "Your rights", body: <p>You can request access, correction, deletion, or review of personal information by contacting legal@osintforge.dev. We may need to verify your identity before acting on a request.</p> },
        { title: "Security", body: <p>API keys and provider secrets should be stored server-side through Cloudflare Worker secrets. We use reasonable safeguards, but no internet service can guarantee perfect security.</p> },
      ]}
    />
  );
}

