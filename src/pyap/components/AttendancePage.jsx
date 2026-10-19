import React, { useState } from "react";
import { CalendarDays, Check, ChevronRight, ClipboardList } from "lucide-react";
import { Badge, EmptyState, MobileCard, MobileField, MobileFields, inputCls } from "./ui.jsx";
import { MemberAvatar } from "./MembersPage.jsx";
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
      <h1 className="text-xl font-bold text-emerald-900 mb-1">Attendance</h1>
      <p className="text-sm text-stone-500 mb-5">{canManage ? "Select an event to mark or view attendance." : "Tap a recorded event below to view per-member attendance."}</p>

      <div className="lg:hidden grid gap-3 mb-6">
        {events.length === 0 ? (
          <MobileCard>
            <EmptyState icon={CalendarDays} message="No events yet." />
          </MobileCard>
        ) : events.map((e) => (
          <MobileCard key={e.id}>
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarDays size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-emerald-950 break-words">{e.title || "Untitled event"}</p>
                <p className="text-xs text-stone-500 mt-0.5">{e.date || "No date"}</p>
              </div>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => onSelect(e)}
                className="mt-3 min-h-11 w-full rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
              >
                Mark Attendance
              </button>
            )}
          </MobileCard>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto mb-6">
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
        <>
          <div className="lg:hidden grid gap-3">
            {history.map((h) => (
              <MobileCard key={h.id} onClick={() => onViewHistory(events.find(e => e.id === h.id))}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-950 break-words">{h.title || "Untitled event"}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{h.date || "No date"}</p>
                  </div>
                  <ChevronRight size={18} className="text-stone-300 shrink-0" />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                  <div><p className="text-[10px] text-stone-400">Present</p><Badge tone="present">{h.present}</Badge></div>
                  <div><p className="text-[10px] text-stone-400">Absent</p><Badge tone="absent">{h.absent}</Badge></div>
                  <div><p className="text-[10px] text-stone-400">Excused</p><Badge tone="excused">{h.excused}</Badge></div>
                  <div><p className="text-[10px] text-stone-400">Rate</p><p className="text-sm font-bold text-emerald-700">{h.rate}%</p></div>
                </div>
              </MobileCard>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
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
        </>
      )}
      {history.length > 0 && <p className="hidden lg:block text-xs text-stone-400 mt-2">Click a row to see per-member attendance.</p>}
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

      <div className="lg:hidden grid gap-3">
        {rows.map((r) => (
          <MobileCard key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-emerald-950 break-words">{r.name}</p>
              <Badge tone={r.status}>{r.status}</Badge>
            </div>
            <MobileFields>
              <MobileField label="Note" wide>{r.note || "—"}</MobileField>
            </MobileFields>
          </MobileCard>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
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

  const statusOptions = [
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "excused", label: "Excused" },
  ];

  function statusButtonCls(key, selected) {
    if (!selected) return "border-stone-200 bg-white text-stone-500 hover:bg-stone-50";
    if (key === "present") return "border-emerald-700 bg-emerald-700 text-white";
    if (key === "absent") return "border-rose-600 bg-rose-600 text-white";
    return "border-amber-500 bg-amber-500 text-white";
  }

  return (
    <div className="pb-24 lg:pb-0">
      <button onClick={onBack} className="min-h-10 text-sm text-emerald-700 mb-3 block">&larr; Back</button>
      <h1 className="text-lg font-bold text-emerald-900 mb-1 break-words">Attendance: {event.title} ({event.date})</h1>
      <p className="text-xs text-stone-500 mb-4">{presentCount}/{total} marked present ({rate}%)</p>

      <div className="grid grid-cols-2 gap-2 mb-3 sm:flex">
        <button onClick={() => markAll("present")} className="min-h-11 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100">Mark All Present</button>
        <button onClick={() => markAll("absent")} className="min-h-11 text-xs font-semibold bg-rose-50 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-100">Mark All Absent</button>
      </div>

      {saved && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-2.5 mb-3 flex items-center gap-1.5"><Check size={14} /> Attendance saved!</div>}

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <EmptyState icon={CalendarDays} message="No members to mark for this event." />
        </div>
      ) : (
        <>
          <div className="lg:hidden grid gap-3">
            {members.map((m) => {
              const status = local[m.id];
              return (
                <MobileCard key={m.id}>
                  <div className="flex items-center gap-3">
                    <MemberAvatar member={m} size={36} />
                    <p className="min-w-0 flex-1 font-semibold text-emerald-950 break-words">{m.name || "Unknown member"}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {statusOptions.map((opt) => {
                      const selected = status === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setStatus(m.id, opt.key)}
                          aria-pressed={selected}
                          className={`min-h-11 rounded-lg border text-xs font-semibold transition ${statusButtonCls(opt.key, selected)}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    aria-label={`Note for ${m.name || "member"}`}
                    className={`mt-2 ${inputCls}`}
                    placeholder={status === "excused" ? "Reason (optional)" : "Note (optional)"}
                    value={notes[m.id] || ""}
                    onChange={e => setNotes(n => ({ ...n, [m.id]: e.target.value }))}
                  />
                </MobileCard>
              );
            })}
          </div>

          <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
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
            className={`hidden lg:inline-flex mt-4 min-h-11 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-lg ${submittingCls}`}
          >
            {busy ? "Saving…" : saved ? "Saved!" : "Save Attendance"}
          </button>

          <div
            className="lg:hidden fixed inset-x-0 bottom-0 md:left-56 z-30 border-t border-stone-200 bg-white/95 px-5 md:px-8 py-3 backdrop-blur"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-700">{presentCount}/{total} present</p>
                <p className="text-[10px] text-stone-400">{rate}% attendance rate</p>
              </div>
              <button
                onClick={handleSave}
                disabled={busy}
                className={`min-h-11 shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2 rounded-lg ${submittingCls}`}
              >
                {busy ? "Saving…" : saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
