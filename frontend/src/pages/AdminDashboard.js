import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut,
  Mail,
  Package,
  Plus,
  Reply,
  Trash2,
  X,
  Pencil,
  ExternalLink,
  Check,
  Upload,
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Inbox,
  Box,
} from "lucide-react";
import Logo from "../components/Logo";
import AnimatedCounter from "../components/AnimatedCounter";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

// Image URL helper: handles relative API paths (object storage) and absolute URLs
const resolveImg = (u) => {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/api/")) return `${BACKEND}${u}`;
  return u; // /disc-115mm.png etc. served from frontend public
};

const inputCls =
  "w-full bg-black border border-neutral-800 text-white px-4 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none";

/* ---------------- ANALYTICS ---------------- */
function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/analytics/summary");
      setData(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading || !data) return <p className="text-metal-dim">Loading analytics…</p>;

  const maxDaily = Math.max(1, ...data.daily_clicks.map((d) => d.clicks));

  const Stat = ({ icon: Icon, label, value, sub, testid }) => (
    <div className="bg-ink-900 border border-neutral-900 p-6 hover-lift hover:border-neon/40" data-testid={testid}>
      <div className="flex items-center justify-between">
        <span className="font-heading uppercase tracking-widest text-xs text-metal-dim">{label}</span>
        <Icon className="h-5 w-5 text-neon" />
      </div>
      <div className="mt-3 text-4xl font-heading text-white">
        <AnimatedCounter to={value} duration={1.2} />
      </div>
      {sub && <p className="text-metal-dim text-xs mt-2 uppercase tracking-widest">{sub}</p>}
    </div>
  );

  return (
    <div data-testid="admin-analytics-panel" className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-heading uppercase tracking-wider text-2xl">Analytics</h2>
          <p className="text-metal-dim text-sm">Live conversion + engagement data</p>
        </div>
        <button onClick={load} className="border border-neutral-800 text-white px-4 py-2 hover:border-neon hover:text-neon font-heading uppercase tracking-wider text-xs" data-testid="analytics-refresh">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="analytics-stat-cards">
        <Stat icon={MousePointerClick} label="Total Buy Now Clicks" value={data.total_clicks} sub="All-time Amazon redirects" testid="stat-total-clicks" />
        <Stat icon={TrendingUp} label="Clicks (24h)" value={data.clicks_24h} sub="Last 24 hours" testid="stat-clicks-24h" />
        <Stat icon={Inbox} label="New Messages" value={data.new_messages} sub={`${data.total_messages} total enquiries`} testid="stat-new-messages" />
        <Stat icon={Package} label="Products" value={data.total_products} sub="Live in catalogue" testid="stat-products" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily chart */}
        <div className="bg-ink-900 border border-neutral-900 p-6" data-testid="analytics-daily-chart">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading uppercase tracking-widest text-sm text-neon">Clicks · Last 7 Days</h3>
            <span className="text-metal-dim text-xs">{data.clicks_7d} total</span>
          </div>
          <div className="flex items-end gap-2 h-44">
            {data.daily_clicks.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full bg-neon hover:bg-neon-hover transition-all"
                    style={{ height: `${(d.clicks / maxDaily) * 100}%`, minHeight: d.clicks > 0 ? "4px" : "1px" }}
                    title={`${d.date}: ${d.clicks} clicks`}
                  />
                </div>
                <span className="text-[10px] text-metal-dim uppercase tracking-widest">
                  {new Date(d.date).toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span className="text-xs text-white font-heading">{d.clicks}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-ink-900 border border-neutral-900 p-6" data-testid="analytics-top-products">
          <h3 className="font-heading uppercase tracking-widest text-sm text-neon mb-4">Top Products by Clicks</h3>
          {data.top_products.length === 0 ? (
            <p className="text-metal-dim text-sm">No clicks tracked yet. Buy Now events will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {data.top_products.map((p, i) => {
                const max = data.top_products[0].clicks || 1;
                return (
                  <li key={p.product_id} className="flex items-center gap-4">
                    <span className="font-heading text-2xl text-neon w-8">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-heading uppercase tracking-wider text-sm truncate pr-3">{p.name}</span>
                        <span className="text-neon font-heading text-sm">{p.clicks}</span>
                      </div>
                      <div className="h-1 bg-neutral-900 mt-2 overflow-hidden">
                        <div className="h-full bg-neon transition-all" style={{ width: `${(p.clicks / max) * 100}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent clicks */}
      <div className="bg-ink-900 border border-neutral-900 p-6" data-testid="analytics-recent-clicks">
        <h3 className="font-heading uppercase tracking-widest text-sm text-neon mb-4">Recent Buy Now Events</h3>
        {data.recent_clicks.length === 0 ? (
          <p className="text-metal-dim text-sm">No events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-metal-dim text-xs uppercase tracking-widest border-b border-neutral-900">
                  <th className="text-left py-2 pr-4">When</th>
                  <th className="text-left py-2 pr-4">Product</th>
                  <th className="text-left py-2 pr-4">Referrer</th>
                  <th className="text-left py-2">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_clicks.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-900/60">
                    <td className="py-2 pr-4 text-white whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-neon">{c.product_name}</td>
                    <td className="py-2 pr-4 text-metal-dim truncate max-w-[180px]">{c.referrer || "—"}</td>
                    <td className="py-2 text-metal-dim truncate max-w-[260px]">{c.user_agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- MESSAGES ---------------- */
function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/messages");
      setMessages(r.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    try {
      const r = await api.post(`/messages/${selected.id}/reply`, { body: replyText });
      const updated = { ...selected, replies: [...(selected.replies || []), r.data], status: "replied" };
      setSelected(updated);
      setMessages((ms) => ms.map((m) => (m.id === updated.id ? updated : m)));
      setReplyText("");
      toast.success("Reply saved");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages((ms) => ms.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Deleted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="admin-messages-panel">
      <div className="lg:col-span-1 border border-neutral-900 bg-ink-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-900 flex items-center justify-between">
          <span className="font-heading uppercase tracking-widest text-sm text-neon">Inbox</span>
          <span className="text-xs text-metal-dim">{messages.length} total</span>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="p-5 text-metal-dim text-sm">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="p-5 text-metal-dim text-sm">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                data-testid={`message-item-${m.id}`}
                className={`w-full text-left px-5 py-4 border-b border-neutral-900 hover:bg-black transition-colors ${
                  selected?.id === m.id ? "bg-black border-l-2 border-l-neon" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading uppercase tracking-wider text-sm truncate">{m.full_name}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${m.status === "replied" ? "text-black bg-neon" : "text-neon border border-neon/50"}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-metal-dim truncate mt-1">{m.email}</p>
                <p className="text-sm text-white/70 line-clamp-2 mt-2">{m.message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 border border-neutral-900 bg-ink-900">
        {!selected ? (
          <div className="h-full flex items-center justify-center py-24 text-metal-dim">
            <p className="font-heading uppercase tracking-widest text-sm">Select a message</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-neutral-900 flex items-start justify-between">
              <div>
                <h3 className="font-heading uppercase tracking-wider text-2xl">{selected.full_name}</h3>
                <p className="text-metal-dim text-sm">
                  {selected.email}{selected.phone ? ` · ${selected.phone}` : ""}{selected.company ? ` · ${selected.company}` : ""}
                </p>
              </div>
              <button onClick={() => remove(selected.id)} data-testid="message-delete-btn" className="text-metal-dim hover:text-red-400">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.product_needed && (<div><span className="text-metal-dim uppercase tracking-widest text-xs">Product</span><p>{selected.product_needed}</p></div>)}
                {selected.quantity && (<div><span className="text-metal-dim uppercase tracking-widest text-xs">Quantity</span><p>{selected.quantity}</p></div>)}
              </div>
              <div className="border border-neutral-900 bg-black p-4">
                <p className="text-metal-dim uppercase tracking-widest text-xs mb-2">Message</p>
                <p className="text-white/90 whitespace-pre-wrap">{selected.message}</p>
              </div>

              {(selected.replies || []).map((r) => (
                <div key={r.id} className="border-l-2 border-neon bg-black p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neon font-heading uppercase tracking-widest text-xs">Reply · {r.author}</span>
                    <span className="text-metal-dim text-xs">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-white/90 whitespace-pre-wrap">{r.body}</p>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-neutral-900">
              <textarea
                rows={3}
                placeholder="Write your reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                data-testid="message-reply-input"
                className={inputCls}
              />
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  data-testid="message-reply-send"
                  className="inline-flex items-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-5 py-3 hover:bg-neon-hover transition-all disabled:opacity-50"
                >
                  <Reply className="h-4 w-4" /> Send Reply
                </button>
              </div>
              <p className="text-xs text-metal-dim mt-2">Reply is saved in this panel (no email sent).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- PRODUCT FORM ---------------- */
function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", short_description: "", description: "", image_url: "", amazon_url: "", specs: {} }
  );
  const [specRows, setSpecRows] = useState(Object.entries(initial?.specs || {}).map(([k, v]) => ({ k, v })));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/uploads/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      update("image_url", res.data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const specs = {};
    for (const r of specRows) { if (r.k.trim()) specs[r.k.trim()] = r.v; }
    onSave({ ...form, specs });
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="admin-product-form">
      <input className={inputCls} placeholder="Product name" required value={form.name} onChange={(e) => update("name", e.target.value)} data-testid="product-form-name" />
      <input className={inputCls} placeholder="Short description" required value={form.short_description} onChange={(e) => update("short_description", e.target.value)} data-testid="product-form-short" />
      <textarea rows={4} className={inputCls} placeholder="Full description" required value={form.description} onChange={(e) => update("description", e.target.value)} data-testid="product-form-description" />

      {/* Image: paste URL OR upload */}
      <div className="border border-neutral-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-heading uppercase tracking-widest text-sm text-neon">Product Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            data-testid="product-form-upload-btn"
            className="inline-flex items-center gap-2 border border-neon text-neon font-heading uppercase tracking-wider text-xs px-4 py-2 hover:bg-neon/10 disabled:opacity-60"
          >
            <Upload className="h-3 w-3" /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            data-testid="product-form-file-input"
          />
        </div>
        <input className={inputCls} placeholder="…or paste an image URL" required value={form.image_url} onChange={(e) => update("image_url", e.target.value)} data-testid="product-form-image" />
        {form.image_url && (
          <div className="bg-black border border-neutral-900 p-3 flex items-center justify-center">
            <img src={resolveImg(form.image_url)} alt="preview" className="max-h-32" />
          </div>
        )}
      </div>

      <input className={inputCls} placeholder="Amazon URL" required value={form.amazon_url} onChange={(e) => update("amazon_url", e.target.value)} data-testid="product-form-amazon" />

      <div className="border border-neutral-900 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading uppercase tracking-widest text-sm text-neon">Specs</span>
          <button type="button" onClick={() => setSpecRows((r) => [...r, { k: "", v: "" }])} className="text-neon text-xs uppercase tracking-widest">+ Add spec</button>
        </div>
        {specRows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2">
            <input className={`${inputCls} col-span-2`} placeholder="Key" value={row.k} onChange={(e) => { const c = [...specRows]; c[idx].k = e.target.value; setSpecRows(c); }} />
            <input className={`${inputCls} col-span-2`} placeholder="Value" value={row.v} onChange={(e) => { const c = [...specRows]; c[idx].v = e.target.value; setSpecRows(c); }} />
            <button type="button" onClick={() => setSpecRows((r) => r.filter((_, i) => i !== idx))} className="border border-neutral-800 text-metal-dim hover:text-red-400">
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="border border-neutral-800 text-white px-5 py-3 hover:border-neon hover:text-neon">Cancel</button>
        <button type="submit" data-testid="product-form-save" className="inline-flex items-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-5 py-3 hover:bg-neon-hover">
          <Check className="h-4 w-4" /> Save
        </button>
      </div>
    </form>
  );
}

/* ---------------- PRODUCTS PANEL ---------------- */
function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/products");
      setProducts(r.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    try {
      if (editing && editing !== "new") {
        await api.put(`/products/${editing.id}`, data);
        toast.success("Product updated");
      } else {
        await api.post("/products", data);
        toast.success("Product added");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
      toast.success("Deleted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-products-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading uppercase tracking-wider text-2xl">Products</h2>
        <button onClick={() => setEditing("new")} data-testid="admin-add-product-btn" className="inline-flex items-center gap-2 bg-neon text-black font-heading uppercase tracking-wider px-5 py-3 hover:bg-neon-hover">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {editing && (
        <div className="mb-6 bg-ink-900 border border-neutral-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading uppercase tracking-widest text-neon text-sm">
              {editing === "new" ? "New Product" : `Editing: ${editing.name}`}
            </h3>
            <button onClick={() => setEditing(null)} className="text-metal-dim hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <ProductForm initial={editing === "new" ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      )}

      {loading ? (
        <p className="text-metal-dim">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-neutral-900 bg-ink-900 p-5" data-testid={`admin-product-${p.id}`}>
              <div className="aspect-square bg-black flex items-center justify-center mb-4 overflow-hidden">
                <img src={resolveImg(p.image_url)} alt={p.name} className="max-h-full" />
              </div>
              <h3 className="font-heading uppercase tracking-wider text-lg">{p.name}</h3>
              <p className="text-metal-dim text-sm mt-1 line-clamp-2">{p.short_description}</p>
              <a href={p.amazon_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-neon text-xs uppercase tracking-widest mt-3">
                Amazon <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEditing(p)} className="flex-1 border border-neutral-800 text-white px-3 py-2 hover:border-neon hover:text-neon text-sm uppercase tracking-widest font-heading inline-flex items-center justify-center gap-2" data-testid={`admin-edit-product-${p.id}`}>
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => remove(p.id)} className="border border-neutral-800 text-metal-dim hover:text-red-400 px-3 py-2" data-testid={`admin-delete-product-${p.id}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("analytics");

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "products", label: "Products", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-black text-white" data-testid="admin-dashboard">
      <header className="border-b border-neutral-900 bg-black sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-auto" />
            <div className="hidden sm:block">
              <p className="font-heading uppercase tracking-widest text-xs text-neon">Admin Panel</p>
              <p className="text-metal-dim text-xs">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} data-testid="admin-logout-btn" className="inline-flex items-center gap-2 border border-neutral-800 text-white px-4 py-2 hover:border-neon hover:text-neon font-heading uppercase tracking-wider text-xs">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex gap-2 mb-8 border-b border-neutral-900 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`inline-flex items-center gap-2 px-5 py-3 font-heading uppercase tracking-wider text-sm border-b-2 whitespace-nowrap ${tab === t.id ? "border-neon text-neon" : "border-transparent text-metal-dim hover:text-white"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" && <AnalyticsPanel />}
        {tab === "messages" && <MessagesPanel />}
        {tab === "products" && <ProductsPanel />}
      </div>
    </div>
  );
}
