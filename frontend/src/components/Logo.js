import React from "react";

/**
 * Transparent logo (white background removed via Pillow preprocessing).
 * Served from /public/logo.png with proper alpha channel.
 */
export default function Logo({ className = "h-12 w-auto", testid = "site-logo" }) {
  return (
    <img
      src="/logo.png"
      alt="On The Tools – Cutting Edge Supplies"
      className={className}
      style={{ background: "transparent" }}
      data-testid={testid}
    />
  );
}
