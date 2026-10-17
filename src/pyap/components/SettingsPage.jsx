import React from "react";
import { Banknote, Download, Heart, Sprout } from "lucide-react";
import Welcome from "../Welcome.jsx";
import { downloadBlob, downloadCSV, todayStr } from "../lib/utils.js";
import { ModalShell } from "./ui.jsx";

export function BackupExport({ members, events, attendance, attendanceNotes, finance, achievements, announcements, suggestions, snapshots }) {
  const memberName = (id) => members.find((m) => m.id === id)?.name || "—";

  const attRows = events.flatMap((ev) =>
    Object.entries(attendance[ev.id] || {}).map(([memberId, status]) => [
      ev.title, ev.date, memberName(memberId), status, attendanceNotes[ev.id]?.[memberId] || "",
    ])
  );

  const sets = [
    { key: "members", label: "Members", count: members.length, headers: ["Name", "Position", "Status", "Phone", "Email", "Birthday", "Address", "Joined"], rows: members.map((m) => [m.name, m.position, m.status, m.contact, m.email, m.birthday, m.address, m.joined]) },
    { key: "attendance", label: "Attendance", count: attRows.length, headers: ["Event", "Event Date", "Member", "Status", "Note"], rows: attRows },
    { key: "finance", label: "Finance", count: finance.length, headers: ["Date", "Type", "Description", "Amount"], rows: finance.map((f) => [f.date, f.type, f.category, f.amount]) },
    { key: "achievements", label: "Achievements", count: achievements.length, headers: ["Date", "Member", "Title", "Description", "Badge"], rows: achievements.map((a) => [a.date, memberName(a.memberId), a.title, a.description, a.badge]) },
    { key: "announcements", label: "Announcements", count: announcements.length, headers: ["Date", "Title", "Content", "Urgency"], rows: announcements.map((a) => [a.date, a.title, a.content, a.urgency]) },
    { key: "suggestions", label: "Suggestions", count: suggestions.length, headers: ["Date", "Message", "From", "Status"], rows: suggestions.map((s) => [s.date, s.message, s.isAnonymous ? "Anonymous" : (s.submitterName || "—"), s.status]) },
    { key: "snapshots", label: "Snapshots", count: snapshots.length, headers: ["Date", "Title", "Album", "Image URL"], rows: snapshots.map((s) => [s.createdAt, s.title, s.album, s.url]) },
  ];

  const downloadAll = () => {
    const payload = {
      app: "PYAP Barangay Samac",
      exported_at: new Date().toISOString(),
      members, events, attendance, attendance_notes: attendanceNotes, finance, achievements, announcements, suggestions, snapshots,
    };
    downloadBlob(`pyap-full-backup-${todayStr()}.json`, new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-1">Backup &amp; Export</h1>
      <p className="text-sm text-stone-500 mb-5">Download a copy of the organization's data. CSV files open in Excel or Google Sheets.</p>
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        {sets.map((s) => (
          <div key={s.key} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-emerald-900">{s.label}</div>
              <div className="text-[11px] text-stone-400">{s.count} {s.count === 1 ? "record" : "records"}</div>
            </div>
            <button
              onClick={() => downloadCSV(`pyap-${s.key}-${todayStr()}.csv`, s.headers, s.rows)}
              aria-label={`Download ${s.label} CSV`}
              disabled={s.count === 0}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg shrink-0"
            >
              Download CSV
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-sm text-emerald-900">Full Backup (JSON)</div>
          <div className="text-[11px] text-stone-400">Everything in one file — keep it somewhere safe.</div>
        </div>
        <button onClick={downloadAll} aria-label="Download full backup" className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
          <Download size={12} /> Download
        </button>
      </div>
    </div>
  );
}

export function DonateBox() {
  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-2">Support PYAP Samac</h1>
      <p className="text-sm text-stone-500 mb-5">Ang bawat donasyon, malaking tulong para sa mga proyekto at aktibidad ng kabataan sa Barangay Samac. Maraming salamat sa inyong suporta! <Heart size={13} className="inline text-rose-500 -mt-0.5" /></p>

      <div className="bg-white rounded-xl border border-stone-200 p-5 max-w-md mb-4">
        <h3 className="font-semibold text-emerald-900 text-sm mb-3 flex items-center gap-1.5"><Banknote size={14} /> Paraan ng Pagdo-donate</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-500">GCash</span>
            <span className="font-medium">0939-232-1901 (J****. J* Y****)</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-500">In-person</span>
            <span className="font-medium">Barangay Samac Hall, Mabinay</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Contact Person</span>
            <span className="font-medium">PYAP Treasurer</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md text-xs text-amber-800">
        Lahat ng donasyon ay naka-log sa Finance Tracker ng officers para sa transparency. Salamat po!
      </div>
    </div>
  );
}

export function AboutModal({ onClose }) {
  return (
    <ModalShell title={<span className="flex items-center gap-2"><Sprout size={16} /> Mission & Vision</span>} onClose={onClose}>
      <div className="space-y-3 text-sm text-stone-600">
        <div>
          <span className="font-semibold text-emerald-800">Mission: </span>
          PYAP Barangay Samac aims to unite, empower, and provide opportunities for the youth to become active agents of change through meaningful activities, education, and community service — while nurturing their faith, skills, and compassion for others.
        </div>
        <div>
          <span className="font-semibold text-emerald-800">Vision: </span>
          A barangay where every young person has hope, a voice, and the opportunity to grow — becoming responsible leaders, compassionate citizens, and active partners in building a better Samac and nation.
        </div>
      </div>
    </ModalShell>
  );
}

export function WelcomePage({ content, logo, isSuperAdmin, onLoginClick, onRequestClick, onGuestClick, onSave, installButton }) {
  return (
    <>
      {installButton}
      <Welcome
        content={content}
        logo={logo}
        isSuperAdmin={isSuperAdmin}
        onLoginClick={onLoginClick}
        onRequestClick={onRequestClick}
        onGuestClick={onGuestClick}
        onSave={onSave}
      />
    </>
  );
}
