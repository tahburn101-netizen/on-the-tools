import React from "react";
import { ShieldCheck } from "lucide-react";

const Section = ({ title, children, testid }) => (
  <section className="mb-10" data-testid={testid}>
    <h2 className="font-heading uppercase tracking-wider text-2xl text-neon mb-3">{title}</h2>
    <div className="text-white/85 leading-relaxed space-y-3 text-base">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  const updated = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="bg-black" data-testid="privacy-page">
      <section className="relative border-b border-neutral-900 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 stripe-bg opacity-[0.04]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="border border-neon/40 p-3"><ShieldCheck className="h-5 w-5 text-neon" /></div>
            <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs">Legal</p>
          </div>
          <h1 className="text-5xl sm:text-6xl font-heading uppercase leading-none">
            Privacy <span className="text-neon">Policy</span>
          </h1>
          <p className="mt-4 text-metal-dim text-sm uppercase tracking-widest">Last updated: {updated}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <p className="text-white/85 leading-relaxed mb-12 text-lg">
            On The Tools ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how
            we collect, use, store, and protect any personal information you provide when using our website at
            onthetools.com (the "Site"). By using our Site, you agree to the practices described below.
          </p>

          <Section title="1. Information We Collect" testid="privacy-section-1">
            <p>We may collect and process the following data about you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity &amp; contact data</strong> — when you submit a Trade Enquiry, you provide your name, company, phone, email, product needed, quantity, and message.</li>
              <li><strong>Technical data</strong> — IP address, browser type and version, time-zone setting, device type, and operating system, gathered automatically when you visit the Site.</li>
              <li><strong>Usage data</strong> — pages visited, time spent, click events (such as our "Buy Now" Amazon redirects), and the referring URL.</li>
              <li><strong>Cookies</strong> — small text files used to remember your session and improve site performance. You can disable cookies in your browser settings.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information" testid="privacy-section-2">
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to your trade enquiries and provide bulk-pricing quotes.</li>
              <li>To process and fulfil orders made via partner platforms such as Amazon.</li>
              <li>To analyse which products attract the most interest so we can improve our range and stock levels.</li>
              <li>To maintain the security and performance of our Site.</li>
              <li>To comply with legal obligations and protect our rights.</li>
            </ul>
            <p>We will <strong>never</strong> sell or rent your personal information to third parties.</p>
          </Section>

          <Section title="3. Legal Basis (UK GDPR)" testid="privacy-section-3">
            <p>We rely on the following lawful bases under the UK General Data Protection Regulation:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consent</strong> — when you submit a form, you consent to us contacting you about your enquiry.</li>
              <li><strong>Legitimate interests</strong> — for site analytics, fraud prevention, and improving our products.</li>
              <li><strong>Legal obligation</strong> — for accounting, tax, and regulatory record-keeping.</li>
            </ul>
          </Section>

          <Section title="4. Data Retention" testid="privacy-section-4">
            <p>
              We retain enquiry messages and reply threads for as long as necessary to fulfil the purposes for which we
              collected them — typically up to 24 months — unless a longer retention period is required by law.
              Click-tracking data is retained in aggregated, anonymised form for analytics.
            </p>
          </Section>

          <Section title="5. Third-Party Services" testid="privacy-section-5">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Amazon</strong> — purchases made via "Buy Now" buttons are processed by Amazon under their own privacy policy.</li>
              <li><strong>Hosting &amp; storage</strong> — our Site is hosted on a secure cloud platform with industry-standard safeguards.</li>
              <li><strong>Analytics</strong> — we use first-party analytics to count clicks and form submissions; no third-party trackers are embedded.</li>
            </ul>
          </Section>

          <Section title="6. Your Rights" testid="privacy-section-6">
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to a copy of your personal data.</li>
              <li>Request correction of any inaccurate or incomplete data.</li>
              <li>Request erasure of your data ("right to be forgotten") where applicable.</li>
              <li>Object to or restrict our processing of your data.</li>
              <li>Request data portability.</li>
              <li>Lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.</li>
            </ul>
            <p>To exercise any of these rights, contact us using the details below.</p>
          </Section>

          <Section title="7. Data Security" testid="privacy-section-7">
            <p>
              We implement appropriate technical and organisational measures to safeguard your personal information,
              including encrypted database storage, hashed admin credentials, HTTPS transport, and access controls
              restricting data to authorised personnel.
            </p>
          </Section>

          <Section title="8. Cookies" testid="privacy-section-8">
            <p>
              We use only essential cookies to maintain your session and security. We do not currently use third-party
              advertising or tracking cookies. You can configure your browser to refuse cookies at any time.
            </p>
          </Section>

          <Section title="9. Children's Privacy" testid="privacy-section-9">
            <p>
              Our Site is not intended for individuals under the age of 16. We do not knowingly collect personal data
              from children. If you believe a child has provided us with information, please contact us so we can
              delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy" testid="privacy-section-10">
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be highlighted on this page
              and the "Last updated" date refreshed.
            </p>
          </Section>

          <Section title="11. Contact Us" testid="privacy-section-11">
            <p>If you have any questions about this Privacy Policy or how your data is handled, get in touch:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email:</strong> privacy@onthetools.com</li>
              <li><strong>Trade enquiries:</strong> via the contact form on our Site</li>
            </ul>
          </Section>
        </div>
      </section>
    </div>
  );
}
