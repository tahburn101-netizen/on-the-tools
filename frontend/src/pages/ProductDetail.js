import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, ShoppingCart, ChevronLeft, ShieldCheck, Truck, Gauge } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";
import Sparks from "../components/Sparks";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const resolveImg = (u) => {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/api/")) return `${BACKEND}${u}`;
  return u;
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neon font-heading uppercase tracking-widest">
        Loading…
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="font-heading text-3xl uppercase">Product not found</h2>
        <Link to="/products" className="text-neon underline">Back to catalogue</Link>
      </div>
    );
  }

  return (
    <div className="bg-black" data-testid="product-detail-page">
      <section className="relative overflow-hidden border-b border-neutral-900 py-12 sm:py-20">
        <Sparks count={18} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => navigate(-1)}
            data-testid="product-back-btn"
            className="inline-flex items-center gap-2 text-metal-dim hover:text-neon mb-8 text-sm uppercase tracking-widest font-heading"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square bg-ink-900 border border-neutral-900 flex items-center justify-center"
            >
              <div className="absolute -inset-6 bg-neon/10 blur-3xl rounded-full" />
              <img
                src={resolveImg(product.image_url)}
                alt={product.name}
                data-testid="product-detail-image"
                className="relative max-w-[88%] drop-shadow-[0_0_60px_rgba(198,255,0,0.25)]"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">Cutting Edge Supplies</p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-none"
                data-testid="product-detail-title"
              >
                {product.name}
              </h1>

              {/* Price */}
              {formatPrice(product.price, product.currency) && (
                <div className="mt-5 flex items-baseline gap-3" data-testid="product-detail-price">
                  <span className="font-heading text-neon text-4xl sm:text-5xl">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-metal-dim text-xs uppercase tracking-widest">incl. VAT · per disc</span>
                </div>
              )}

              <p className="mt-5 text-white/85 text-lg leading-relaxed" data-testid="product-detail-description">
                {product.description}
              </p>

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-8 border border-neutral-900 bg-ink-900" data-testid="product-specs">
                  <div className="px-5 py-3 border-b border-neutral-900 font-heading uppercase tracking-widest text-sm text-neon">
                    Specifications
                  </div>
                  <dl className="divide-y divide-neutral-900">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="grid grid-cols-2 px-5 py-3 text-sm">
                        <dt className="text-metal-dim uppercase tracking-wider">{k}</dt>
                        <dd className="text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="product-buy-now-btn"
                  onClick={() => {
                    // Fire-and-forget click tracking
                    api
                      .post("/clicks", {
                        product_id: product.id,
                        referrer: document.referrer || window.location.href,
                      })
                      .catch(() => {});
                  }}
                  className="group inline-flex items-center justify-center gap-3 bg-neon text-black font-heading uppercase tracking-wider px-8 py-4 hover:bg-neon-hover hover:-translate-y-1 transition-all hover:drop-shadow-[0_0_24px_rgba(198,255,0,0.55)]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <Link
                  to={`/contact?product=${encodeURIComponent(product.name)}`}
                  data-testid="product-buy-bulk-btn"
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-neon text-neon font-heading uppercase tracking-wider px-8 py-4 hover:bg-neon/10 hover:-translate-y-1 transition-all"
                >
                  Buy In Bulk
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { icon: Truck, label: "Fast UK Delivery" },
                  { icon: ShieldCheck, label: "EN12413 Certified" },
                  { icon: Gauge, label: "High Performance" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2 p-3 border border-neutral-900 bg-ink-900">
                    <Icon className="h-6 w-6 text-neon" />
                    <span className="text-[11px] uppercase tracking-widest text-white/80">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky mobile bottom CTA bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-900 p-3 flex gap-2 items-center"
        data-testid="product-sticky-mobile-cta"
      >
        {formatPrice(product.price, product.currency) && (
          <div className="font-heading text-neon text-xl pr-2 whitespace-nowrap">
            {formatPrice(product.price, product.currency)}
          </div>
        )}
        <a
          href={product.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            api.post("/clicks", { product_id: product.id, referrer: window.location.href }).catch(() => {});
          }}
          data-testid="sticky-buy-now"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-4 py-3 text-sm hover:bg-neon-hover"
        >
          <ShoppingCart className="h-4 w-4" /> Buy Now
        </a>
        <Link
          to={`/contact?product=${encodeURIComponent(product.name)}`}
          data-testid="sticky-buy-bulk"
          className="inline-flex items-center justify-center gap-2 border border-neon text-neon font-heading uppercase tracking-wider px-4 py-3 text-sm whitespace-nowrap"
        >
          Bulk
        </Link>
      </div>
    </div>
  );
}
