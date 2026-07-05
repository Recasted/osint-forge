import type { Metadata } from "next";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "Terms of Service | OSINT Forge" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of Service."
      description="These terms explain the rules for accessing OSINT Forge, using credits, running searches, and interacting with provider-backed intelligence modules."
      sections={[
        { title: "Agreement", body: <p>By creating an account, purchasing a plan, or using OSINT Forge, you agree to these Terms of Service and any linked policies. If you do not agree, do not use the service.</p> },
        { title: "Accounts", body: <p>You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate contact and billing information when purchasing a plan.</p> },
        { title: "Credits and plans", body: <p>Plans and credit packs grant access to search capacity and platform modules. Credits may be limited by month, plan, provider availability, rate limits, or abuse controls. Prototype checkout pages do not collect real payments until payment processors are connected.</p> },
        { title: "Acceptable use", body: <p>You may only use OSINT Forge for lawful, authorized, and ethical investigations. You may not use the platform for harassment, stalking, doxing, unauthorized access, credential abuse, fraud, discrimination, or any activity that violates law or third-party rights.</p> },
        { title: "Third-party providers", body: <p>Some results may come from external APIs or public sources. Provider availability, limits, accuracy, and terms can change. OSINT Forge is not responsible for third-party data source outages or inaccuracies.</p> },
        { title: "Suspension", body: <p>We may suspend or restrict access if usage appears illegal, abusive, harmful, fraudulent, or likely to create security, privacy, compliance, or operational risk.</p> },
        { title: "No warranties", body: <p>The service is provided as available. We do not guarantee that results are complete, current, accurate, or suitable for any specific legal, employment, credit, or safety decision.</p> },
        { title: "Limitation of liability", body: <p>To the maximum extent allowed by law, OSINT Forge is not liable for indirect, incidental, special, consequential, or punitive damages related to your use of the service.</p> },
      ]}
    />
  );
}

