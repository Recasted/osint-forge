import type { Metadata } from "next";

import { InfoPage } from "../info-page";

export const metadata: Metadata = { title: "EULA | OSINT Forge" };

export default function EulaPage() {
  return (
    <InfoPage
      eyebrow="EULA"
      title="End User License Agreement."
      description="This agreement covers your license to access and use OSINT Forge software, interfaces, dashboards, modules, and related documentation."
      sections={[
        { title: "License", body: <p>OSINT Forge grants you a limited, non-exclusive, non-transferable, revocable license to access and use the platform for lawful internal investigation, research, and security workflows.</p> },
        { title: "Restrictions", body: <p>You may not copy, resell, sublicense, reverse engineer, scrape, overload, bypass access controls, remove notices, or use OSINT Forge to build a competing service without written permission.</p> },
        { title: "Ownership", body: <p>OSINT Forge, its interface, workflow design, source code, branding, documentation, and related intellectual property remain owned by their respective owners. Your account does not transfer ownership.</p> },
        { title: "User content", body: <p>You retain responsibility for search inputs, notes, exports, and uploaded or entered material. You grant OSINT Forge the rights needed to process that material to provide the service.</p> },
        { title: "Updates", body: <p>We may update modules, pricing, features, APIs, security controls, and documentation. Continued use after updates means you accept the updated software and terms.</p> },
        { title: "Termination", body: <p>Your license ends if your account is closed, suspended, or terminated, or if you violate the EULA, Terms of Service, or applicable law.</p> },
      ]}
    />
  );
}

