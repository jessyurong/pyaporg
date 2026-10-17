import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { URGENCY, getUrgency } from "../constants.js";
import { inputCls } from "./ui.jsx";

export function Announcements({ announcements, isGuest, canPost, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Announcements</h1>
        {canPost && <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Post Announcement</button>}
      </div>
      {announcements.map(a => {
        const u = getUrgency(a);
        return (
          <div key={a.id} className={`border-l-4 ${u.border} ${u.bg} rounded-r-lg p-4 mb-3`}>
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[11px] text-stone-400">{a.date}</div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`}></span>{u.label}
                  </span>
                </div>
                <div className="font-semibold text-sm mt-0.5">{a.title}</div>
                <p className="text-sm text-stone-600 mt-1 whitespace-pre-wrap break-words">{a.content}</p>
              </div>
              {canPost && <button onClick={() => onDelete(a.id)} className="text-rose-600 shrink-0"><Trash2 size={14} /></button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnnounceFormModal({ onClose, onSave }) {
  const [f, setF] = useState({ title: "", content: "", urgency: "normal" });
  const [busy, setBusy] = useState(false);
  const u = URGENCY[f.urgency] || URGENCY.normal;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-emerald-900">Post Announcement</h3>
          <button onClick={onClose}><X size={18} className="text-stone-400" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <input className={inputCls} placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
            <textarea className={inputCls} rows={6} placeholder="Content" value={f.content} onChange={e => setF({ ...f, content: e.target.value })} />
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(URGENCY).map(([key, uu]) => {
                  const active = f.urgency === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setF({ ...f, urgency: key })}
                      className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border-2 transition ${active ? `${uu.badge} ${uu.border}` : "bg-white border-stone-200 text-stone-500"}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${uu.dot}`}></span>{uu.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              disabled={busy || !f.title.trim()}
              onClick={async () => { setBusy(true); try { await onSave(f); } finally { setBusy(false); } }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition"
            >
              {busy ? "Posting…" : "Post Announcement"}
            </button>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-stone-400 font-semibold mb-2">Live Preview</div>
            <div className={`rounded-xl border-l-4 ${u.border} ${u.bg} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${u.badge}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${u.dot} mr-1 align-middle`}></span>{u.label}
                </span>
                <span className="text-[10px] text-stone-400">{new Date().toISOString().slice(0, 10)}</span>
              </div>
              <div className="font-bold text-stone-900 text-sm mb-1">{f.title || "Announcement title"}</div>
              <div className="text-xs text-stone-600 whitespace-pre-wrap">{f.content || "Your message will appear here…"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
