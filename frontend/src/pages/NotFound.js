import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sparks from "../components/Sparks";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden" data-testid="not-found-page">
      <Sparks count={40} />
      <div className="relative text-center px-6">
        <p className="text-neon font-heading uppercase tracking-[0.3em] text-xs mb-4">Error 404</p>
        <h1 className="text-[clamp(6rem,18vw,16rem)] font-heading leading-none neon-text">404</h1>
        <h2 className="text-3xl sm:text-5xl font-heading uppercase mt-4">Page Off The Grid</h2>
        <p className="text-metal-dim mt-4 max-w-md mx-auto">
          The page you're looking for has been cut, ground, or simply doesn't exist.
        </p>
        <Link
          to="/"
          data-testid="not-found-home-link"
          className="inline-flex items-center gap-2 mt-8 bg-neon text-black font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon-hover hover:-translate-y-1 transition-all"
        >
          <ArrowLeft className="h-5 w-5" /> Back To Home
        </Link>
      </div>
    </div>
  );
}
