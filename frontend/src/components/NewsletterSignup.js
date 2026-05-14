import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";

/**
 * Lightweight newsletter capture — stored as a message with [Newsletter] tag
 * so the admin can see signups in the same inbox.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api.post("/messages", {
        full_name: "Newsletter Subscriber",
        company: "",
        phone: "n/a",
        email: email.trim(),
        product_needed: "",
        quantity: "",
        message: "[Newsletter signup] Please add me to the trade discounts mailing list.",
      });
      setDone(true);
      setEmail("");
      toast.success("Subscribed — we'll keep you in the loop.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="border border-neon/40 bg-ink-900 p-5" data-testid="newsletter-success">
        <p className="font-heading uppercase tracking-widest text-xs text-neon mb-1">You're In</p>
        <p className="text-white/85 text-sm">We'll email you trade offers and new product drops.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="newsletter-form">
      <p className="font-heading uppercase tracking-widest text-xs text-neon">Trade Discounts</p>
      <p className="text-white/70 text-xs leading-relaxed">Join the trade list for exclusive bulk prices.</p>
      <div className="flex">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metal-dim" />
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="newsletter-email"
            className="w-full bg-black border border-neutral-800 text-white pl-10 pr-3 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          data-testid="newsletter-submit"
          className="bg-neon text-black px-4 py-3 hover:bg-neon-hover disabled:opacity-60"
          aria-label="Subscribe"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
