import React from "react";
import { motion } from "framer-motion";
import { Wrench, Award, Users, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-black" data-testid="about-page">
      <section className="relative border-b border-neutral-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">About</p>
          <h1 className="text-5xl sm:text-7xl font-heading uppercase leading-none">
            Cutting Edge <span className="text-neon">Since Day One.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/80 leading-relaxed text-lg">
            On The Tools was built for the tradesmen who turn up early, stay late, and don't have time for tools that
            let them down. We engineer cutting discs that perform — every job, every time.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Wrench, t: "Industrial Grade", d: "Premium materials, reinforced fibreglass for unbeatable strength." },
            { icon: Award, t: "Certified Quality", d: "EN12413 & ISO9001 standards on every batch." },
            { icon: Users, t: "Trade Trusted", d: "Used by tradesmen on sites across the UK." },
            { icon: Truck, t: "Fast Delivery", d: "Fast UK dispatch — on the tools when you need them." },
          ].map(({ icon: Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-ink-800 border border-neutral-900 p-8 hover-lift hover:border-neon/60"
            >
              <Icon className="h-10 w-10 text-neon mb-4" />
              <h3 className="font-heading uppercase tracking-wider text-xl mb-2">{t}</h3>
              <p className="text-metal-dim text-sm leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 border-y border-neutral-900 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-heading uppercase leading-none mb-6">
            Ready to <span className="text-neon">Cut Better</span>?
          </h2>
          <p className="text-white/80 mb-8">
            Browse our catalogue or get in touch for trade pricing on bulk orders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products" data-testid="about-cta-products" className="bg-neon text-black font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon-hover hover:-translate-y-1 transition-all">
              Shop Now
            </Link>
            <Link to="/contact" data-testid="about-cta-contact" className="bg-transparent border-2 border-neon text-neon font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon/10 hover:-translate-y-1 transition-all">
              Trade Enquiries
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
