import React, { useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { ModalShell, inputCls } from "./ui.jsx";

export function Snapshots({ items, loading, canManage, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Snapshots</h1>
        {canManage && (
          <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5">
            <Plus size={14} /> Add Photos
          </button>
        )}
      </div>
      {loading ? (
        <p className="text-sm text-stone-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
          <Camera size={28} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-400">No photos yet.</p>
          {canManage && <p className="text-xs text-stone-400 mt-1">Click "Add Photos" to upload pictures or a whole album.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden relative">
              <img src={s.url} alt={s.title || s.album || "Snapshot"} className="w-full h-40 object-cover bg-stone-100" loading="lazy" />
              {s.album && (
                <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{s.album}</span>
              )}
              {canManage && (
                <button
                  onClick={() => onDelete(s.id)}
                  aria-label="Delete snapshot"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-rose-600 text-white rounded-full p-1.5 transition"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <div className="p-3">
                <div className="text-sm font-semibold text-emerald-900 truncate">{s.title || s.album || "Snapshot"}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{s.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SnapshotUploadModal({ onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <ModalShell title="Add Photos" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1.5">Photos (you can select many at once)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
            className="w-full text-sm text-stone-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white file:text-xs file:cursor-pointer border border-stone-200 rounded-lg p-2"
          />
          {files.length > 0 && (
            <div className="text-[11px] text-stone-400 mt-1.5">{files.length} photo{files.length > 1 ? "s" : ""} selected: {files.map((f) => f.name).join(", ")}</div>
          )}
        </div>
        <input className={inputCls} placeholder="Title / caption (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputCls} placeholder="Album name (optional, e.g. Feeding Program 2026)" value={album} onChange={(e) => setAlbum(e.target.value)} />
        <button
          disabled={busy || files.length === 0}
          onClick={async () => { setBusy(true); try { await onSave(files, { title: title.trim(), album: album.trim() }); } finally { setBusy(false); } }}
          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition"
        >
          {busy ? "Uploading…" : `Upload ${files.length || ""} Photo${files.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </ModalShell>
  );
}
