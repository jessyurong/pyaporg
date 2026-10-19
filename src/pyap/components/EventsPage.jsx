import React, { useState } from "react";
import { CalendarDays, MapPin, Plus, Trash2 } from "lucide-react";
import { EmptyState, MobileCard, ModalShell, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function EventsList({ events, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Events / Activities</h1>
        {onAdd && (
          <button onClick={onAdd} className="min-h-11 bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0">
            <Plus size={14} /> Add Event
          </button>
        )}
      </div>

      <div className="lg:hidden grid gap-3">
        {events.length === 0 ? (
          <MobileCard>
            <EmptyState icon={CalendarDays} message="No events yet." />
          </MobileCard>
        ) : events.map((e) => (
          <MobileCard key={e.id} className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CalendarDays size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-950 break-words">{e.title || "Untitled event"}</p>
              <p className="text-xs text-stone-500 mt-0.5">{e.date || "No date"}</p>
              {e.location && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-stone-500 break-words">
                  <MapPin size={12} className="shrink-0 mt-0.5" /> {e.location}
                </p>
              )}
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(e.id)}
                aria-label={`Delete ${e.title || "event"}`}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 shrink-0"
              >
                <Trash2 size={17} />
              </button>
            )}
          </MobileCard>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Title</th><th className="p-3">Date</th><th className="p-3">Location</th><th className="p-3"></th></tr></thead>
          <tbody>{events.map(e => (
            <tr key={e.id} className="border-t border-stone-100">
              <td className="p-3">{e.title}</td><td className="p-3 text-stone-500">{e.date}</td><td className="p-3 text-stone-500">{e.location}</td>
              <td className="p-3">{onDelete && <button onClick={() => onDelete(e.id)} aria-label={`Delete ${e.title || "event"}`} className="text-rose-600"><Trash2 size={14} /></button>}</td>
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
