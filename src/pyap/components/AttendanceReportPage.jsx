import React, { useMemo, useState } from "react";
import { ClipboardList, Download, Printer } from "lucide-react";
import { Badge, MobileCard, MobileField, MobileFields, StatCard, inputCls } from "./ui.jsx";
import { downloadCSV, todayStr } from "../lib/utils.js";

const ALL = "all";

const statusLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export function AttendanceReport({ members = [], events = [], attendance = {}, attendanceNotes = {} }) {
  const [filter, setFilter] = useState(ALL);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  // I-flatten lahat ng attendance records: isang row per member per event.
  const allRows = useMemo(() => {
    const rows = [];
    for (const e of events) {
      const rec = attendance?.[e.id];
      if (!rec) continue;
      const eventRows = Object.keys(rec)
        .filter((memberId) => rec[memberId])
        .map((memberId) => ({
          memberId,
          memberName: memberMap.get(memberId)?.name || "Unknown member",
          eventId: e.id,
          eventTitle: e.title || "—",
          date: e.date || "",
          status: rec[memberId],
          note: attendanceNotes?.[e.id]?.[memberId] || "",
        }));
      eventRows.sort((a, b) => a.memberName.localeCompare(b.memberName));
      rows.push(...eventRows);
    }
    return rows;
  }, [events, attendance, attendanceNotes, memberMap]);

  // Events na may na-record na attendance lang ang lalabas sa dropdown.
  const recordedEvents = useMemo(() => {
    const ids = new Set(allRows.map((r) => r.eventId));
    return events.filter((e) => ids.has(e.id));
  }, [events, allRows]);

  const rows = useMemo(
    () => (filter === ALL ? allRows : allRows.filter((r) => r.eventId === filter)),
    [allRows, filter]
  );

  const stats = useMemo(() => {
    const present = rows.filter((r) => r.status === "present").length;
    return {
      events: new Set(rows.map((r) => r.eventId)).size,
      members: new Set(rows.map((r) => r.memberId)).size,
      rate: rows.length ? Math.round((present / rows.length) * 100) : 0,
    };
  }, [rows]);

  const selectedEvent = filter === ALL ? null : events.find((e) => e.id === filter) || null;

  const exportCsv = () => {
    downloadCSV(
      `attendance-report-${todayStr()}.csv`,
      ["Member", "Event", "Date", "Status", "Notes"],
      rows.map((r) => [r.memberName, r.eventTitle, r.date, statusLabel(r.status), r.note])
    );
  };

  // ---------- Empty state ----------
  if (allRows.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-5">Attendance Report</h1>
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center max-w-xl">
          <ClipboardList size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-700">No attendance records yet</p>
          <p className="text-xs text-stone-500 mt-1.5">
            Wala pang na-mark na attendance sa kahit anong event. Pumunta sa Attendance screen para mag-record muna.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Print CSS — itatago ang filter at buttons kapag nagpi-print */}
      <style>{"@media print { .no-print { display: none !important; } }"}</style>

      <h1 className="text-xl font-bold text-emerald-900 mb-1">Attendance Report</h1>
      <p className="text-sm text-stone-500 mb-5">
        {selectedEvent ? `${selectedEvent.title} — ${selectedEvent.date}` : "Lahat ng recorded events."}
      </p>

      {/* Filter + actions — naka-hide kapag nagpi-print */}
      <div className="no-print grid gap-3 mb-5 sm:flex sm:flex-wrap sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="attendance-report-filter" className="text-xs font-semibold text-stone-500">Filter by Event</label>
          <select id="attendance-report-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputCls} mt-1.5`}>
            <option value={ALL}>All Events</option>
            {recordedEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.date})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
          <button
            onClick={() => window.print()}
            className="min-h-11 bg-emerald-700 hover:bg-emerald-800 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={exportCsv}
            className="min-h-11 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats (nagbabago base sa filter) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard num={stats.events} label="Total Events" />
        <StatCard num={stats.members} label="Total Members" />
        <div className="col-span-2 md:col-span-1">
          <StatCard num={`${stats.rate}%`} label="Overall Present Rate" />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden print:hidden grid gap-3">
        {rows.map((r) => (
          <MobileCard key={`${r.eventId}-${r.memberId}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-emerald-950 break-words">{r.memberName}</p>
                <p className="text-xs text-stone-500 mt-0.5 break-words">{r.eventTitle}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{r.date || "No date"}</p>
              </div>
              <Badge tone={r.status}>{statusLabel(r.status)}</Badge>
            </div>
            <MobileFields>
              <MobileField label="Note" wide>{r.note || "—"}</MobileField>
            </MobileFields>
          </MobileCard>
        ))}
        {rows.length === 0 && (
          <MobileCard>
            <p className="py-4 text-center text-xs text-stone-400">Walang records para sa napiling event.</p>
          </MobileCard>
        )}
      </div>

      {/* Desktop / print table */}
      <div className="hidden lg:block print:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px] print:min-w-0">
          <thead>
            <tr className="bg-emerald-50 text-emerald-900 text-left">
              <th className="p-3">Member Name</th>
              <th className="p-3">Event</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.eventId}-${r.memberId}`} className="border-t border-stone-100">
                <td className="p-3 font-medium text-stone-800">{r.memberName}</td>
                <td className="p-3 text-stone-600">{r.eventTitle}</td>
                <td className="p-3 text-stone-500">{r.date}</td>
                <td className="p-3">
                  <Badge tone={r.status}>{statusLabel(r.status)}</Badge>
                </td>
                <td className="p-3 text-xs text-stone-500">{r.note || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="border-t border-stone-100">
                <td colSpan={5} className="p-6 text-center text-xs text-stone-400">
                  Walang records para sa napiling event.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-stone-400 mt-2">
        {rows.length} record{rows.length === 1 ? "" : "s"} sa view na ito — Overall Present Rate = present ÷ lahat ng records.
      </p>
    </div>
  );
}
