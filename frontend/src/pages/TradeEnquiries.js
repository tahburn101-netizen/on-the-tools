import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Package, Headphones, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";

export default function TradeEnquiries() {
  const [params] = useSearchParams();
  const preselected = params.get("product") || "";
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    phone: "",
    email: "",
    product_needed: preselected,
    quantity: "",
    message: preselected ? `I'd like to enquire about bulk pricing on ${preselected}.` : "",
  });

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data || [])).catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/messages", form);
      setSubmitted(true);
      toast.success("Enquiry sent — we'll be in touch shortly.");
      setForm({
        full_name: "",
        company: "",
        phone: "",
        email: "",
        product_needed: "",
        quantity: "",
        message: "",
      });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to send. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-ink-900 border border-neutral-800 text-white px-4 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none transition-colors";

  return (
    <div className="bg-black" data-testid="contact-page">
      <section className="relative border-b border-neutral-900 py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 stripe-bg opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">Get In Touch</p>
            <h1 className="text-5xl sm:text-6xl font-heading uppercase leading-none">
              Trade <br />
              <span className="text-neon">Enquiries</span>
            </h1>
            <p className="mt-5 text-white/80 leading-relaxed max-w-md">
              Need bulk pricing or regular supply for your business? Complete the form and we'll get back to you with
              the best trade options.
            </p>

            <ul className="mt-10 space-y-6">
              {[
                { icon: ShieldCheck, t: "Trade Pricing", d: "Competitive rates for businesses and bulk orders." },
                { icon: Package, t: "Reliable Supply", d: "Consistent stock and fast lead times you can count on." },
                { icon: Headphones, t: "Dedicated Support", d: "Our team is here to help get you the right solution." },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex items-start gap-4">
                  <div className="border border-neon/30 p-3">
                    <Icon className="h-5 w-5 text-neon" />
                  </div>
                  <div>
                    <p className="font-heading uppercase tracking-widest text-sm">{t}</p>
                    <p className="text-metal-dim text-sm">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-ink-900 border border-neutral-900 p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="border border-neon/40 p-3"><ShieldCheck className="h-5 w-5 text-neon" /></div>
                <div>
                  <h2 className="font-heading uppercase tracking-wider text-2xl">Get a Trade Quote</h2>
                  <p className="text-neon text-sm uppercase tracking-widest">Quick. Simple. No obligation.</p>
                </div>
              </div>

              {submitted ? (
                <div className="border border-neon/40 p-8 text-center" data-testid="contact-success">
                  <h3 className="font-heading uppercase text-2xl text-neon mb-2">Enquiry Received</h3>
                  <p className="text-white/80">Thanks — we'll respond as quickly as possible.</p>
                  <button
                    className="mt-6 text-neon underline uppercase tracking-widest text-sm"
                    onClick={() => setSubmitted(false)}
                    data-testid="contact-send-another"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Full Name *"
                      value={form.full_name}
                      onChange={(e) => update("full_name", e.target.value)}
                      className={inputCls}
                      data-testid="contact-full-name"
                    />
                    <input
                      placeholder="Company Name"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      className={inputCls}
                      data-testid="contact-company"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Phone Number *"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={inputCls}
                      data-testid="contact-phone"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email Address *"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputCls}
                      data-testid="contact-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-white/80 mb-2">
                      Product Needed
                    </label>
                    <select
                      value={form.product_needed}
                      onChange={(e) => update("product_needed", e.target.value)}
                      className={`${inputCls} appearance-none`}
                      data-testid="contact-product-select"
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-white/80 mb-2">Quantity</label>
                    <input
                      placeholder="e.g. 500 units"
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      className={inputCls}
                      data-testid="contact-quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-widest text-white/80 mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us about your requirements…"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      className={inputCls}
                      data-testid="contact-message"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="contact-submit-btn"
                    className="w-full inline-flex items-center justify-center gap-3 bg-neon text-black font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon-hover hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
                  >
                    {submitting ? "Sending…" : "Get Trade Quote"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="flex items-center justify-center gap-2 text-metal-dim text-xs uppercase tracking-widest pt-2">
                    <Lock className="h-3 w-3" /> We aim to respond to all trade enquiries as quickly as possible.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
