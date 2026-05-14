import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </Link>
        <div className="bg-ink-900 border border-neutral-900 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="border border-neon/40 p-3"><Lock className="h-5 w-5 text-neon" /></div>
            <div>
              <h1 className="font-heading uppercase tracking-wider text-2xl">Admin Login</h1>
              <p className="text-neon text-xs uppercase tracking-widest">Restricted access</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="admin-login-email"
              className="w-full bg-black border border-neutral-800 text-white px-4 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="admin-login-password"
              className="w-full bg-black border border-neutral-800 text-white px-4 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none"
            />
            {error && (
              <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              data-testid="admin-login-submit"
              className="w-full inline-flex items-center justify-center gap-3 bg-neon text-black font-heading uppercase tracking-wider px-7 py-4 hover:bg-neon-hover transition-all disabled:opacity-60"
            >
              {submitting ? "Signing In…" : "Sign In"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
        <Link to="/" className="block text-center text-metal-dim text-xs uppercase tracking-widest mt-6 hover:text-neon">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
