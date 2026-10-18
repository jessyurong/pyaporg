import React, { useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { SNAPSHOT_LIMIT } from "../constants.js";
import { ModalShell, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function Snapshots({ items, loading, canManage, onAdd, onDelete }) {
  const atLimit = items.length >= SNAPSHOT_LIMIT;
  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">Snapshots</h1>
          <p className={`text-[11px] mt-0.5 ${atLimit ? "text-rose-600 font-semibold" : "text-stone-400"}`}>
            {items.length} / {SNAPSHOT_LIMIT} photos
          </p>
        </div>
        {canManage && (
          <button
            onClick={onAdd}
            disabled={atLimit}
            title={atLimit ? "Limit reached — delete old photos to upload more." : undefined}
            className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Add Photos
          </button>
        )}
      </div>
      {atLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 text-xs text-amber-800">
          Na-hit na ang limit na <b>{SNAPSHOT_LIMIT} photos</b>. Mag-delete muna ng lumang snapshots para maka-upload ulit ng bago.
        </div>
      )}
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

export function SnapshotUploadModal({ onClose, onSave, remaining }) {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();
  const slots = typeof remaining === "number" ? remaining : SNAPSHOT_LIMIT;
  return (
    <ModalShell title="Add Photos" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1.5">Photos (you can select many at once)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const picked = [...e.target.files];
              setFiles(picked.length > slots ? picked.slice(0, slots) : picked);
            }}
            className="w-full text-sm text-stone-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white file:text-xs file:cursor-pointer border border-stone-200 rounded-lg p-2"
          />
          <div className="text-[11px] text-stone-400 mt-1.5">
            {Math.max(0, slots - files.length)} slot{slots - files.length === 1 ? "" : "s"} left (limit: {SNAPSHOT_LIMIT}). Photos are auto-compressed before upload to keep the file size small.
          </div>
          {files.length > 0 && (
            <div className="text-[11px] text-stone-400 mt-1">{files.length} photo{files.length > 1 ? "s" : ""} selected: {files.map((f) => f.name).join(", ")}</div>
          )}
        </div>
        <input className={inputCls} placeholder="Title / caption (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputCls} placeholder="Album name (optional, e.g. Feeding Program 2026)" value={album} onChange={(e) => setAlbum(e.target.value)} />
        <button
          disabled={busy || files.length === 0}
          onClick={() => run(null, () => onSave(files, { title: title.trim(), album: album.trim() }))}
          className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 rounded-lg transition ${submittingCls}`}
        >
          {busy ? "Uploading…" : `Upload ${files.length || ""} Photo${files.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </ModalShell>
  );
}
