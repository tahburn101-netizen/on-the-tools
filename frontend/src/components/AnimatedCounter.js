import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({ to = 100, duration = 2.0, suffix = "", prefix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(eased * to);
      if (t < 1) requestAnimationFrame(step);
      else setValue(to);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  const display = decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
