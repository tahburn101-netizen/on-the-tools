import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";

const inputCls =
  "w-full bg-black border border-neutral-800 text-white px-4 py-3 placeholder:text-neutral-600 focus:border-neon focus:outline-none";

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
                  <span className="font-heading uppercase tracking-wider text-sm truncate">
                    {m.full_name}
                  </span>
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

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      short_description: "",
      description: "",
      image_url: "",
      amazon_url: "",
      specs: {},
    }
  );
  const [specRows, setSpecRows] = useState(
    Object.entries(initial?.specs || {}).map(([k, v]) => ({ k, v }))
  );

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const specs = {};
    for (const r of specRows) {
      if (r.k.trim()) specs[r.k.trim()] = r.v;
    }
    onSave({ ...form, specs });
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="admin-product-form">
      <input className={inputCls} placeholder="Product name" required value={form.name} onChange={(e) => update("name", e.target.value)} data-testid="product-form-name" />
      <input className={inputCls} placeholder="Short description" required value={form.short_description} onChange={(e) => update("short_description", e.target.value)} data-testid="product-form-short" />
      <textarea rows={4} className={inputCls} placeholder="Full description" required value={form.description} onChange={(e) => update("description", e.target.value)} data-testid="product-form-description" />
      <input className={inputCls} placeholder="Image URL" required value={form.image_url} onChange={(e) => update("image_url", e.target.value)} data-testid="product-form-image" />
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

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/products");
      setProducts(r.data || []);
    } finally {
      setLoading(false);
    }
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
          <ProductForm
            initial={editing === "new" ? null : editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-metal-dim">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-neutral-900 bg-ink-900 p-5" data-testid={`admin-product-${p.id}`}>
              <div className="aspect-square bg-black flex items-center justify-center mb-4">
                <img src={p.image_url} alt={p.name} className="max-h-full" />
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("messages");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

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
        <div className="flex gap-2 mb-8 border-b border-neutral-900">
          <button
            onClick={() => setTab("messages")}
            data-testid="admin-tab-messages"
            className={`inline-flex items-center gap-2 px-5 py-3 font-heading uppercase tracking-wider text-sm border-b-2 ${tab === "messages" ? "border-neon text-neon" : "border-transparent text-metal-dim hover:text-white"}`}
          >
            <Mail className="h-4 w-4" /> Messages
          </button>
          <button
            onClick={() => setTab("products")}
            data-testid="admin-tab-products"
            className={`inline-flex items-center gap-2 px-5 py-3 font-heading uppercase tracking-wider text-sm border-b-2 ${tab === "products" ? "border-neon text-neon" : "border-transparent text-metal-dim hover:text-white"}`}
          >
            <Package className="h-4 w-4" /> Products
          </button>
        </div>

        {tab === "messages" ? <MessagesPanel /> : <ProductsPanel />}
      </div>
    </div>
  );
}
