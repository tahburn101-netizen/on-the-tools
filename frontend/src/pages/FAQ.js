import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const FAQS = [
  { q: "Are your discs certified?", a: "Yes — every disc is EN12413 and ISO9001 certified, tested for safety and performance." },
  { q: "Do you offer trade pricing?", a: "Absolutely. Submit a trade enquiry on the Contact page and we'll send you our best bulk rates." },
  { q: "How fast is delivery?", a: "Standard UK orders ship within 24 hours. Free delivery on orders over £50." },
  { q: "Which materials can I cut?", a: "Our metal cutting discs handle steel, stainless steel, rebar, and most ferrous metals. Our grinding discs are ideal for weld cleaning and deburring." },
  { q: "Can I return a product?", a: "Yes, unused discs can be returned within 30 days. Contact us for a returns label." },
  { q: "Do you sell to businesses internationally?", a: "We can quote international trade orders — fill the contact form with your requirements." },
];

export default function FAQ() {
  return (
    <div className="bg-black" data-testid="faq-page">
      <section className="border-b border-neutral-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">Help</p>
          <h1 className="text-5xl sm:text-6xl font-heading uppercase leading-none">
            Frequently <span className="text-neon">Asked</span>
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                data-testid={`faq-item-${i}`}
                className="border border-neutral-900 bg-ink-800 px-5"
              >
                <AccordionTrigger className="font-heading uppercase tracking-wider text-lg hover:text-neon">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-metal-dim leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
