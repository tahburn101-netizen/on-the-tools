import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  React.useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className="sticky top-0 z-50 bg-black/85 backdrop-blur-md border-b border-neutral-900"
      data-testid="site-navbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo-link">
            <Logo className="h-12 sm:h-14 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `font-heading uppercase tracking-widest text-sm transition-colors ${
                    isActive ? "text-neon" : "text-white hover:text-neon"
                  }`
                }
              >
                {l.label}
                <span className="block h-[2px] mt-1 w-0 bg-neon transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contact"
              data-testid="nav-cta-buy-in-bulk"
              className="inline-flex items-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-5 py-3 hover:bg-neon-hover hover:-translate-y-0.5 transition-all"
            >
              Buy In Bulk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setOpen((v) => !v)}
            data-testid="nav-mobile-toggle"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-900 bg-black"
            data-testid="nav-mobile-menu"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `block font-heading uppercase tracking-widest text-lg py-3 border-b border-neutral-900 ${
                      isActive ? "text-neon" : "text-white"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                data-testid="nav-mobile-cta"
                className="block mt-3 bg-neon text-black font-heading uppercase tracking-wider px-5 py-4 text-center"
              >
                Buy In Bulk →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900 mt-24" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Logo className="h-14 w-auto mb-4" />
          <p className="text-metal-dim text-sm leading-relaxed">
            High-performance cutting discs for professionals. Built to cut. Built to last.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-neon tracking-widest text-sm mb-4">Shop</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li><Link to="/products" className="hover:text-neon">All Products</Link></li>
            <li><Link to="/contact" className="hover:text-neon">Trade Enquiries</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-neon tracking-widest text-sm mb-4">Company</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li><Link to="/about" className="hover:text-neon">About</Link></li>
            <li><Link to="/faq" className="hover:text-neon">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-neon">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-neon tracking-widest text-sm mb-4">Promise</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>Fast UK Delivery</li>
            <li>Trade Discounts</li>
            <li>Expert Support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-900 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto text-metal-dim text-xs tracking-widest uppercase">
        <span>© {new Date().getFullYear()} On The Tools · Cutting Edge Supplies</span>
        <div className="flex items-center gap-5">
          <Link to="/privacy" className="hover:text-neon" data-testid="footer-privacy-link">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-neon">Trade Enquiries</Link>
          <Link to="/admin/login" className="hover:text-neon" data-testid="footer-admin-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
