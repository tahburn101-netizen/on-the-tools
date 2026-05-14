import React, { useMemo } from "react";

/**
 * Lightweight CSS-only spark particles burst.
 * Avoids tsparticles bundle weight; produces convincing sparks via CSS animation.
 */
export default function Sparks({ count = 28, className = "" }) {
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const tx = (Math.random() - 0.5) * 360;
      const ty = -(Math.random() * 240 + 80);
      const left = Math.random() * 100;
      const delay = Math.random() * 2.4;
      const size = 2 + Math.random() * 3;
      const duration = 1.8 + Math.random() * 1.6;
      return { tx, ty, left, delay, size, duration, key: i };
    });
  }, [count]);

  return (
    <div className={`sparks ${className}`} aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.key}
          style={{
            left: `${s.left}%`,
            bottom: "10%",
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--tx": `${s.tx}px`,
            "--ty": `${s.ty}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
