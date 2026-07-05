import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "Tools", href: "/tools/email/" },
      { label: "API Status", href: "https://api.osintforge.dev/api/health" },
      { label: "Changelog", href: "/support/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Support", href: "/support/" },
      { label: "Contact Us", href: "/contact/" },
      { label: "Data Removal", href: "/legal/#data-removal" },
      { label: "Legal", href: "/legal/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/support/#documentation" },
      { label: "FAQ", href: "/faq/" },
      { label: "Sitemap", href: "/sitemap/" },
      { label: "Help Center", href: "/support/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms/" },
      { label: "Privacy Policy", href: "/privacy/" },
      { label: "Legal Notice", href: "/legal/" },
      { label: "EULA", href: "/eula/" },
    ],
  },
];

const socialLinks = [
  { label: "TG", href: "https://t.me/osintforgeupdates" },
  { label: "GH", href: "https://github.com/Recasted/osint-forge" },
  { label: "IG", href: "https://www.instagram.com/" },
  { label: "IN", href: "https://www.linkedin.com/" },
];

const payments = ["VISA", "MC", "AMEX", "DISC", "JCB", "PP", "BTC", "USDT", "+ crypto"];

export function SiteFooter() {
  return (
    <footer id="community" className="site-footer relative z-30 border-t border-white/10 bg-[#111312] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_3fr]">
          <section>
            <Link href="/" className="footer-brand" aria-label="OSINT Forge home">
              <span>OF</span>
              <strong>OSINT Forge</strong>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-white/62">
              Precision OSINT intelligence for investigators, analysts, and security professionals.
            </p>

            <p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/42">Follow us</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a key={link.label} className="social-icon" href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  {link.label}
                </a>
              ))}
            </div>

            <Link href="/contact/" className="footer-contact-link">
              Contact Us
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </section>

          <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h2 className="text-sm font-black text-white">{column.title}</h2>
                <div className="mt-5 grid gap-4">
                  {column.links.map((link) => (
                    <Link key={link.label} href={link.href} className="footer-nav-link">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-sm text-white/54">© 2026 OSINT Forge. All rights reserved.</p>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/38">We accept</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {payments.map((payment) => (
              <span key={payment} className="payment-chip">{payment}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
