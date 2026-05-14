import React, { useEffect, useState } from "react";

/**
 * Cookie consent banner — appears once, dismissible.
 * Persists choice in localStorage under key 'ott_cookie_consent'.
 */
export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ott_cookie_consent");
    if (!stored) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("ott_cookie_consent", "accepted");
    setShow(false);
  };
  const decline = () => {
    localStorage.setItem("ott_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm z-[60] bg-ink-900 border border-neon/40 p-4 sm:p-5 shadow-[0_0_30px_rgba(198,255,0,0.15)]"
      data-testid="cookie-banner"
    >
      <p className="font-heading uppercase tracking-widest text-xs text-neon mb-2">Cookies</p>
      <p className="text-white/85 text-sm leading-relaxed mb-4">
        We use essential cookies to make the site work. See our{" "}
        <a href="/privacy" className="text-neon underline">privacy policy</a> for details.
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          data-testid="cookie-accept"
          className="flex-1 bg-neon text-black font-heading uppercase tracking-wider text-xs px-4 py-2.5 hover:bg-neon-hover"
        >
          Accept
        </button>
        <button
          onClick={decline}
          data-testid="cookie-decline"
          className="flex-1 border border-neutral-800 text-white font-heading uppercase tracking-wider text-xs px-4 py-2.5 hover:border-neon hover:text-neon"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
