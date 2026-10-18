import React, { useState } from "react";
import { Check, ClipboardList } from "lucide-react";
import { Badge } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function AttendanceSelect({ events, members, attendance, canManage, onSelect, onViewHistory }) {
  const history = events
    .filter(e => attendance[e.id])
    .map(e => {
      const rec = attendance[e.id] || {};
      const statuses = Object.values(rec);
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        present: statuses.filter(s => s === "present").length,
        absent: statuses.filter(s => s === "absent").length,
        excused: statuses.filter(s => s === "excused").length,
        rate: statuses.length ? Math.round((statuses.filter(s => s === "present").length / statuses.length) * 100) : 0,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-5">Attendance</h1>
      <p className="text-sm text-stone-500 mb-4">{canManage ? "Select an event to mark or view attendance." : "Click a recorded event below to view per-member attendance."}</p>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3"></th></tr></thead>
          <tbody>{events.map(e => (
            <tr key={e.id} className="border-t border-stone-100">
              <td className="p-3">{e.title}</td><td className="p-3 text-stone-500">{e.date}</td>
              <td className="p-3">{canManage && <button onClick={() => onSelect(e)} className="bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg">Mark Attendance</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h3 className="font-semibold text-emerald-900 text-sm mb-3 flex items-center gap-1.5"><ClipboardList size={14} /> Attendance History</h3>
      {history.length === 0 ? (
        <p className="text-sm text-stone-400">No attendance recorded yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[550px]">
            <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3 text-center">Present</th><th className="p-3 text-center">Absent</th><th className="p-3 text-center">Excused</th><th className="p-3 text-center">Rate</th></tr></thead>
            <tbody>{history.map(h => (
              <tr key={h.id} onClick={() => onViewHistory(events.find(e => e.id === h.id))} className="border-t border-stone-100 hover:bg-stone-50 cursor-pointer">
                <td className="p-3 font-medium">{h.title}</td>
                <td className="p-3 text-stone-500">{h.date}</td>
                <td className="p-3 text-center"><Badge tone="present">{h.present}</Badge></td>
                <td className="p-3 text-center"><Badge tone="absent">{h.absent}</Badge></td>
                <td className="p-3 text-center"><Badge tone="excused">{h.excused}</Badge></td>
                <td className="p-3 text-center font-semibold text-emerald-700">{h.rate}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {history.length > 0 && <p className="text-xs text-stone-400 mt-2">Click a row to see per-member attendance.</p>}
    </div>
  );
}

export function AttendanceHistoryDetail({ event, members, record, noteRecord, onBack }) {
  const rows = members.map(m => ({
    id: m.id,
    name: m.name,
    status: record[m.id] || "not marked",
    note: noteRecord[m.id] || "",
  }));
  const presentCount = rows.filter(r => r.status === "present").length;
  const rate = members.length ? Math.round((presentCount / members.length) * 100) : 0;

  return (
    <div>
      <button onClick={onBack} className="text-sm text-emerald-700 mb-4 block">&larr; Back to Attendance History</button>
      <h1 className="text-lg font-bold text-emerald-900 mb-1">{event.title}</h1>
      <p className="text-xs text-stone-500 mb-4">{event.date} — {presentCount}/{members.length} present ({rate}%)</p>

      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Member</th><th className="p-3">Status</th><th className="p-3">Note</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.id} className="border-t border-stone-100">
              <td className="p-3">{r.name}</td>
              <td className="p-3"><Badge tone={r.status}>{r.status}</Badge></td>
              <td className="p-3 text-stone-500">{r.note || "-"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function AttendanceMark({ event, members, record, noteRecord, onBack, onSave }) {
  const [local, setLocal] = useState(record);
  const [notes, setNotes] = useState(noteRecord);
  const [saved, setSaved] = useState(false);
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();

  function setStatus(memberId, status) {
    setLocal(l => ({ ...l, [memberId]: status }));
  }

  function markAll(status) {
    const all = {};
    members.forEach(m => { all[m.id] = status; });
    setLocal(all);
  }

  async function handleSave() {
    // Ang run() ay may ref lock: ang double-tap sa Save (usapang mahina ang
    // signal) ay isang upsert lang — hindi na doble ang attendance.
    await run(null, async () => {
      const ok = await onSave(local, notes);
      if (!ok) return;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const total = members.length;
  const presentCount = Object.values(local).filter(s => s === "present").length;
  const rate = total ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div>
      <button onClick={onBack} className="text-sm text-emerald-700 mb-4 block">&larr; Back</button>
      <h1 className="text-lg font-bold text-emerald-900 mb-1">Attendance: {event.title} ({event.date})</h1>
      <p className="text-xs text-stone-500 mb-4">{presentCount}/{total} marked present ({rate}%)</p>

      <div className="flex gap-2 mb-3">
        <button onClick={() => markAll("present")} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">Mark All Present</button>
        <button onClick={() => markAll("absent")} className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg">Mark All Absent</button>
      </div>

      {saved && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-2.5 mb-3 flex items-center gap-1.5"><Check size={14} /> Attendance saved!</div>}

      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Member</th><th className="p-3 text-center">Present</th><th className="p-3 text-center">Absent</th><th className="p-3 text-center">Excused</th><th className="p-3">Note</th></tr></thead>
          <tbody>{members.map(m => (
            <tr key={m.id} className="border-t border-stone-100">
              <td className="p-3">{m.name}</td>
              {["present", "absent", "excused"].map(s => (
                <td key={s} className="p-3 text-center">
                  <input type="radio" checked={local[m.id] === s} onChange={() => setStatus(m.id, s)} />
                </td>
              ))}
              <td className="p-3">
                <input
                  className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs"
                  placeholder={local[m.id] === "excused" ? "reason (optional)" : "-"}
                  value={notes[m.id] || ""}
                  onChange={e => setNotes(n => ({ ...n, [m.id]: e.target.value }))}
                />
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        disabled={busy}
        className={`mt-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm px-4 py-2 rounded-lg ${submittingCls}`}
      >
        {busy ? "Saving…" : "Save Attendance"}
      </button>
    </div>
  );
}
