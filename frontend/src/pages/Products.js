import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const resolveImg = (u) => {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/api/")) return `${BACKEND}${u}`;
  return u;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div data-testid="products-page" className="bg-black">
      {/* Header */}
      <section className="relative bg-black border-b border-neutral-900 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 stripe-bg opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">Catalogue</p>
          <h1 className="text-5xl sm:text-7xl font-heading uppercase leading-none">
            Our <span className="text-neon">Cutting Discs</span>
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">
            Premium discs engineered for professionals. Browse the full range below.
          </p>
        </div>
      </section>

      {/* Search + Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-metal-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, size, material…"
              data-testid="products-search-input"
              className="w-full bg-ink-900 border border-neutral-800 text-white pl-10 pr-10 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                data-testid="products-search-clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-metal-dim hover:text-neon"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-metal-dim text-sm uppercase tracking-widest font-heading" data-testid="products-result-count">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-ink-800 border border-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center" data-testid="products-empty">
            <p className="text-metal-dim font-heading uppercase tracking-widest">
              {query ? `No products matching "${query}"` : "No products yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={`/products/${p.slug}`}
                  data-testid={`product-card-${p.slug}`}
                  className="group block bg-ink-800 border border-neutral-900 hover:border-neon/60 transition-all p-6 hover-lift h-full"
                >
                  <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveImg(p.image_url)}
                      alt={p.name}
                      className="max-h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    />
                  </div>
                  <h3 className="mt-6 font-heading uppercase tracking-wider text-2xl text-white group-hover:text-neon transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    {formatPrice(p.price, p.currency) ? (
                      <span className="font-heading text-neon text-2xl" data-testid={`product-card-price-${p.slug}`}>
                        {formatPrice(p.price, p.currency)}
                      </span>
                    ) : (
                      <span className="text-metal-dim text-xs uppercase tracking-widest">See Amazon</span>
                    )}
                  </div>
                  <p className="mt-2 text-metal-dim text-sm line-clamp-2">{p.short_description}</p>
                  <div className="mt-5 flex items-center gap-2 text-neon font-heading uppercase tracking-wider text-sm">
                    View Product <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
