import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Target, ShieldCheck, Gauge, Wrench, Truck, Percent, Headphones, CheckCircle2, Star } from "lucide-react";
import Sparks from "../components/Sparks";
import { api } from "../lib/api";

const HERO_BG =
  "https://images.unsplash.com/reserve/7vjJbdDRga27ApDoYicw_Sparks.jpg?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800";
const PRODUCT_DISC =
  "https://customer-assets.emergentagent.com/job_f207eb6c-e5d0-4f53-a1ed-2d0d257bf71c/artifacts/bs3n5039_IMG-20260422-WA0000.jpg";
const TESTIMONIAL_BG =
  "https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yDisc = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scaleDisc = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const [products, setProducts] = React.useState([]);
  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data || [])).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* ---------- HERO ---------- */}
      <section
        ref={ref}
        className="relative overflow-hidden bg-black"
        data-testid="hero-section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url('${HERO_BG}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <Sparks count={32} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p
              variants={item}
              className="text-neon font-heading uppercase tracking-[0.3em] text-xs sm:text-sm mb-6"
              data-testid="hero-overline"
            >
              Cutting Edge Supplies
            </motion.p>
            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading uppercase leading-[0.9] tracking-tighter text-white"
              data-testid="hero-headline"
            >
              Built to Cut.
              <br />
              Built to <span className="text-neon neon-text">Last.</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed"
              data-testid="hero-subtitle"
            >
              High-performance cutting discs for professionals who demand precision, power and durability.
            </motion.p>
            <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                data-testid="hero-cta-shop"
                className="group inline-flex items-center gap-3 bg-neon text-black font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon-hover hover:-translate-y-1 transition-all hover:drop-shadow-[0_0_24px_rgba(198,255,0,0.55)]"
              >
                Shop Cutting Discs
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                data-testid="hero-cta-bulk"
                className="inline-flex items-center gap-3 bg-transparent border-2 border-neon text-neon font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon/10 hover:-translate-y-1 transition-all"
              >
                Buy In Bulk
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-12 grid grid-cols-3 gap-6 max-w-md"
              data-testid="hero-feature-trio"
            >
              {[
                { icon: Target, label: "Precision", sub: "Cutting" },
                { icon: ShieldCheck, label: "Long-Lasting", sub: "Performance" },
                { icon: Gauge, label: "Maximum", sub: "Speed" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-start">
                  <Icon className="h-7 w-7 text-neon mb-2" />
                  <span className="font-heading uppercase tracking-wider text-xs text-white">{label}</span>
                  <span className="font-heading uppercase tracking-wider text-xs text-metal-dim">{sub}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: yDisc, scale: scaleDisc }}
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="absolute -inset-6 bg-neon/10 blur-3xl rounded-full" />
            <img
              src={PRODUCT_DISC}
              alt="On The Tools Cutting Disc"
              className="relative max-w-[520px] w-full drop-shadow-[0_0_60px_rgba(198,255,0,0.25)]"
              data-testid="hero-product-image"
            />
          </motion.div>
        </div>
      </section>

      {/* ---------- FEATURE STRIP (Lime Marquee) ---------- */}
      <section className="bg-neon text-black overflow-hidden border-y-4 border-black" data-testid="feature-strip">
        <div className="flex items-stretch animate-marquee whitespace-nowrap py-5">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center">
              {[
                { icon: Wrench, label: "Industrial Grade" },
                { icon: CheckCircle2, label: "Clean Cuts" },
                { icon: Gauge, label: "High Speed" },
                { icon: ShieldCheck, label: "Safer Working" },
                { icon: Wrench, label: "EN12413 Certified" },
                { icon: CheckCircle2, label: "Burr-Free Finish" },
              ].map((f, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-3 px-10 font-heading uppercase tracking-widest text-xl">
                  <f.icon className="h-6 w-6" /> {f.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- WHY PROFESSIONALS ---------- */}
      <section
        className="relative bg-black py-20 sm:py-28 overflow-hidden"
        data-testid="why-pros-section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${TESTIMONIAL_BG}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-4">Why Professionals</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-none mb-8">
              Choose <span className="text-neon">On The Tools</span>
            </h2>
            <p className="text-white/80 leading-relaxed mb-8 max-w-lg">
              Our cutting discs are trusted on site, in the workshop and in industry across the country.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Fast, accurate cutting on steel & metal",
                "Reduced sparks and minimal waste",
                "Consistent performance, every job",
                "Built to handle the toughest conditions",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-neon shrink-0 mt-0.5" />
                  <span className="text-white">{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              data-testid="why-learn-more"
              className="inline-flex items-center gap-3 bg-neon text-black font-heading uppercase tracking-wider px-6 py-3 hover:bg-neon-hover hover:-translate-y-1 transition-all"
            >
              Learn More <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-black/70 border border-neutral-800 p-8 hover-lift hover:border-neon/60 backdrop-blur-sm">
              <div className="flex items-center gap-1 mb-4 text-neon">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-neon" />
                ))}
              </div>
              <blockquote className="font-heading text-3xl sm:text-4xl leading-tight uppercase mb-4">
                “Discs that don't let you down on site.”
              </blockquote>
              <p className="text-metal-dim text-sm uppercase tracking-widest">— Verified Customer</p>
            </div>

            <div className="mt-6 bg-neon text-black p-6 flex items-start gap-4 hover-lift">
              <Truck className="h-10 w-10 shrink-0" />
              <div>
                <p className="font-heading uppercase tracking-widest text-sm">Fast UK Delivery</p>
                <p className="text-sm">On orders over £50</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- OUR RANGE ---------- */}
      <section className="bg-black py-20 sm:py-28" data-testid="our-range-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">Our Range</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-none">
                Built for <span className="text-neon">Every Job.</span>
              </h2>
              <p className="text-white/70 mt-4 max-w-xl">
                From everyday tasks to heavy-duty projects, we've got the right disc for the job.
              </p>
            </div>
            <Link
              to="/products"
              data-testid="view-all-products-btn"
              className="self-start lg:self-end inline-flex items-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-6 py-3 hover:bg-neon-hover hover:-translate-y-0.5 transition-all"
            >
              View All Products <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {(products.length ? products : [1, 2, 3]).slice(0, 3).map((p, i) => (
              <motion.div key={p.id || i} variants={item}>
                <Link
                  to={p.slug ? `/products/${p.slug}` : "/products"}
                  data-testid={`range-card-${i}`}
                  className="group block bg-ink-800 border border-neutral-900 hover:border-neon/60 transition-all p-6 hover-lift"
                >
                  <div className="aspect-square bg-black/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.image_url || PRODUCT_DISC}
                      alt={p.name || "Cutting Disc"}
                      className="max-h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    />
                  </div>
                  <h3 className="mt-6 font-heading uppercase tracking-wider text-2xl text-white group-hover:text-neon transition-colors">
                    {p.name || "Cutting Disc"}
                  </h3>
                  <p className="mt-2 text-metal-dim text-sm">{p.short_description || "Premium cutting disc."}</p>
                  <div className="mt-4 flex items-center gap-2 text-neon font-heading uppercase tracking-wider text-sm">
                    View Product <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- FOOTER BADGES ---------- */}
      <section className="bg-ink-900 border-y border-neutral-900" data-testid="footer-badges">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, label: "Fast UK Delivery", sub: "Get your order quickly." },
            { icon: Percent, label: "Trade Discounts", sub: "Save more when you buy more." },
            { icon: Headphones, label: "Expert Support", sub: "We're here to help." },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-4">
              <Icon className="h-10 w-10 text-neon shrink-0" />
              <div>
                <p className="font-heading uppercase tracking-widest text-sm">{label}</p>
                <p className="text-metal-dim text-sm">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
