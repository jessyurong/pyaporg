import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ModalShell, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function EventsList({ events, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Events / Activities</h1>
        {onAdd && <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Event</button>}
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Title</th><th className="p-3">Date</th><th className="p-3">Location</th><th className="p-3"></th></tr></thead>
          <tbody>{events.map(e => (
            <tr key={e.id} className="border-t border-stone-100">
              <td className="p-3">{e.title}</td><td className="p-3 text-stone-500">{e.date}</td><td className="p-3 text-stone-500">{e.location}</td>
              <td className="p-3">{onDelete && <button onClick={() => onDelete(e.id)} className="text-rose-600"><Trash2 size={14} /></button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EventFormModal({ onClose, onSave }) {
  const [f, setF] = useState({ title: "", date: "", location: "" });
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();
  return (
    <ModalShell title="Add New Event" onClose={onClose}>
      <div className="space-y-3">
        <input className={inputCls} placeholder="Event Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <input className={inputCls} type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
        <input className={inputCls} placeholder="Location" value={f.location} onChange={e => setF({ ...f, location: e.target.value })} />
        <button
          disabled={busy || !f.title.trim()}
          onClick={() => run(null, () => onSave(f))}
          className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm py-2 rounded-lg ${submittingCls}`}
        >
          {busy ? "Saving…" : "Save Event"}
        </button>
      </div>
    </ModalShell>
  );
}
