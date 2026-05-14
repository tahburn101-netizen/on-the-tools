import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoading(false));
  }, []);

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

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-ink-800 border border-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center" data-testid="products-empty">
            <p className="text-metal-dim font-heading uppercase tracking-widest">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
            {products.map((p, i) => (
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
                      src={p.image_url}
                      alt={p.name}
                      className="max-h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    />
                  </div>
                  <h3 className="mt-6 font-heading uppercase tracking-wider text-2xl text-white group-hover:text-neon transition-colors">
                    {p.name}
                  </h3>
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
