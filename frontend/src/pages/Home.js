import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Target,
  ShieldCheck,
  Gauge,
  Wrench,
  Truck,
  Percent,
  Headphones,
  CheckCircle2,
  Star,
  Quote,
  Zap,
  Award,
  Hammer,
  Flame,
} from "lucide-react";
import Sparks from "../components/Sparks";
import AnimatedCounter from "../components/AnimatedCounter";
import { api } from "../lib/api";

const HERO_BG =
  "https://images.unsplash.com/reserve/7vjJbdDRga27ApDoYicw_Sparks.jpg?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800";
const TESTIMONIAL_BG =
  "https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";
const SITE_GRID = [
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  "/workshop.jpg",
  "/industry.jpg",
];

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
  const yDisc = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const scaleDisc = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const yHeroBg = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const [products, setProducts] = React.useState([]);
  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data || [])).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page" className="relative">
      {/* ---------- HERO ---------- */}
      <section
        ref={ref}
        className="relative overflow-hidden bg-black"
        data-testid="hero-section"
        style={{ minHeight: "92vh" }}
      >
        <motion.div
          style={{ y: yHeroBg, backgroundImage: `url('${HERO_BG}')` }}
          className="absolute inset-0 bg-cover bg-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <Sparks count={40} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p
              variants={item}
              className="text-neon font-heading uppercase tracking-[0.3em] text-xs sm:text-sm mb-6 inline-flex items-center gap-2"
            >
              <span className="h-px w-10 bg-neon" /> Cutting Edge Supplies
            </motion.p>
            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading uppercase leading-[0.88] tracking-tighter text-white"
            >
              Built to Cut.
              <br />
              Built to <span className="text-neon neon-text">Last.</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed"
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

            <motion.div variants={item} className="mt-12 grid grid-cols-3 gap-6 max-w-md">
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
            initial={{ opacity: 0, rotate: -25 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="absolute -inset-12 bg-neon/15 blur-3xl rounded-full animate-pulse" />
            <motion.img
              src="/disc-115mm.png"
              alt="On The Tools Cutting Disc"
              className="relative max-w-[540px] w-full drop-shadow-[0_0_80px_rgba(198,255,0,0.35)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              data-testid="hero-product-image"
            />
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-metal-dim"
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-neon to-transparent"
          />
        </motion.div>
      </section>

      {/* ---------- FEATURE STRIP ---------- */}
      <section className="bg-neon text-black overflow-hidden border-y-4 border-black" data-testid="feature-strip">
        <div className="flex items-stretch animate-marquee whitespace-nowrap py-5">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center">
              {[
                { icon: Wrench, label: "Industrial Grade" },
                { icon: CheckCircle2, label: "Clean Cuts" },
                { icon: Gauge, label: "High Speed" },
                { icon: ShieldCheck, label: "Safer Working" },
                { icon: Award, label: "EN12413 Certified" },
                { icon: Flame, label: "Burr-Free Finish" },
                { icon: Hammer, label: "Trade Trusted" },
              ].map((f, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-3 px-10 font-heading uppercase tracking-widest text-xl">
                  <f.icon className="h-6 w-6" /> {f.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- STATS COUNTER ---------- */}
      <section className="bg-black py-16 sm:py-20 border-b border-neutral-900" data-testid="stats-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 1.2, suffix: "M+", label: "Cuts Made", decimals: 1 },
            { value: 850, suffix: "+", label: "Trade Customers" },
            { value: 13300, suffix: " RPM", label: "Disc Rating" },
            { value: 99, suffix: "%", label: "On-Time Delivery" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="border border-neutral-900 bg-ink-900 p-6 hover-lift hover:border-neon/40 overflow-hidden"
              data-testid={`stat-card-${i}`}
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-heading text-neon truncate">
                <AnimatedCounter to={s.value} suffix={s.suffix} decimals={s.decimals || 0} duration={2.2} />
              </div>
              <div className="mt-2 font-heading uppercase tracking-wider text-xs text-white/80">{s.label}</div>
            </motion.div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40" />

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
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-6 w-6 text-neon shrink-0 mt-0.5" />
                  <span className="text-white">{t}</span>
                </motion.li>
              ))}
            </ul>
            <Link
              to="/about"
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
            className="relative space-y-6"
          >
            <div className="bg-black/70 border border-neutral-800 p-8 hover-lift hover:border-neon/60 backdrop-blur-sm">
              <Quote className="h-10 w-10 text-neon/40 mb-3" />
              <div className="flex items-center gap-1 mb-4 text-neon">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-neon" />)}
              </div>
              <blockquote className="font-heading text-3xl sm:text-4xl leading-tight uppercase mb-4">
                "Discs that don't let you down on site."
              </blockquote>
              <p className="text-metal-dim text-sm uppercase tracking-widest">— Mark T., Steel Fabricator</p>
            </div>

            <div className="bg-neon text-black p-6 flex items-start gap-4 hover-lift">
              <Truck className="h-10 w-10 shrink-0" />
              <div>
                <p className="font-heading uppercase tracking-widest text-sm">Fast UK Delivery</p>
                <p className="text-sm">On orders over £50 — next-day available.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- HOW WE BUILD ---------- */}
      <section className="bg-ink-900 py-20 sm:py-28 border-y border-neutral-900" data-testid="process-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">The Process</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-none">
              How We <span className="text-neon">Build</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: "01", icon: Wrench, title: "Source", text: "Premium aluminium oxide grain and reinforced fibreglass mesh." },
              { num: "02", icon: Zap, title: "Engineer", text: "Precision-bonded under heat & pressure for max strength." },
              { num: "03", icon: ShieldCheck, title: "Certify", text: "EN12413 and ISO9001 tested before every batch ships." },
              { num: "04", icon: Truck, title: "Deliver", text: "Fast UK dispatch — on the tools when you need them." },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-black border border-neutral-900 p-7 hover-lift hover:border-neon/60"
              >
                <span className="absolute right-4 top-3 font-heading text-6xl text-neutral-900/80 select-none">{s.num}</span>
                <s.icon className="h-9 w-9 text-neon mb-4" />
                <h3 className="font-heading uppercase tracking-wider text-xl mb-2">{s.title}</h3>
                <p className="text-metal-dim text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
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
                  className="group block bg-ink-800 border border-neutral-900 hover:border-neon/60 transition-all p-6 hover-lift relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-neon/5 blur-2xl rounded-full group-hover:bg-neon/15 transition-all" />
                  <div className="aspect-square bg-black/50 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={p.image_url || "/disc-115mm.png"}
                      alt={p.name || "Cutting Disc"}
                      className="max-h-full transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
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

      {/* ---------- ON SITE GALLERY ---------- */}
      <section className="bg-ink-900 py-20 sm:py-28 border-y border-neutral-900" data-testid="gallery-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-3">In The Wild</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-none">
                On The <span className="text-neon">Tools.</span>
              </h2>
            </div>
            <p className="text-metal-dim max-w-md">Trusted on construction sites, in workshops, and across UK industry.</p>
          </div>

          <div className="grid grid-cols-12 gap-3 sm:gap-4 h-[480px] sm:h-[560px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-7 row-span-2 bg-cover bg-center hover-lift relative overflow-hidden group"
              style={{ backgroundImage: `url('${SITE_GRID[0]}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-heading uppercase tracking-widest text-neon text-xs mb-1">Construction</p>
                <p className="font-heading text-2xl uppercase">Heavy-duty cuts at scale</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="col-span-5 bg-cover bg-center hover-lift relative overflow-hidden group"
              style={{ backgroundImage: `url('${SITE_GRID[1]}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-heading uppercase tracking-widest text-neon text-xs mb-1">Workshop</p>
                <p className="font-heading text-xl uppercase">Precision every cut</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="col-span-5 bg-cover bg-center hover-lift relative overflow-hidden group"
              style={{ backgroundImage: `url('${SITE_GRID[2]}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-heading uppercase tracking-widest text-neon text-xs mb-1">Industry</p>
                <p className="font-heading text-xl uppercase">Built for the toughest jobs</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className="relative bg-black py-20 sm:py-28 overflow-hidden" data-testid="cta-banner">
        <Sparks count={24} />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-heading uppercase leading-[0.9]"
          >
            Stop Wasting <br /> <span className="text-neon">Bad Discs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-white/80 max-w-2xl mx-auto text-lg"
          >
            Trade in unreliable cutting for discs engineered to last. Order online or get a bulk quote in under a minute.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/products" className="bg-neon text-black font-heading uppercase tracking-wider px-8 py-4 hover:bg-neon-hover hover:-translate-y-1 transition-all">
              Shop Now
            </Link>
            <Link to="/contact" className="border-2 border-neon text-neon font-heading uppercase tracking-wider px-8 py-4 hover:bg-neon/10 hover:-translate-y-1 transition-all">
              Get Trade Quote
            </Link>
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
