import React, { useRef, useState } from "react";
import { ArrowLeft, Cake, CalendarDays, Camera, CheckSquare, Mail, MapPin, Phone, Plus, Trash2, User } from "lucide-react";
import { fmtBirthday } from "../lib/utils.js";
import { Badge, EmptyState, ModalShell, inputCls } from "./ui.jsx";

export function MemberAvatar({ member, size = 32, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (member?.avatarUrl && !failed) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name || "Member"}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover bg-stone-200 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className={`rounded-full bg-stone-200 flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <User size={Math.round(size * 0.45)} className="text-stone-500" />
    </div>
  );
}

export function MembersList({ members, onSelect, onAdd }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Members</h1>
        {onAdd && <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Member</button>}
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3"></th><th className="p-3">Name</th><th className="p-3">Position</th><th className="p-3">Status</th><th className="p-3">Contact</th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} onClick={() => onSelect(m)} className="border-t border-stone-100 hover:bg-stone-50 cursor-pointer">
                <td className="p-3"><MemberAvatar member={m} size={32} /></td>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-stone-500">{m.position}</td>
                <td className="p-3"><Badge tone={m.status}>{m.status}</Badge></td>
                <td className="p-3 text-stone-500">{m.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// "YYYY-MM-DD" => "Oct 12, 2026" (safe sa invalid/empty dates).
function fmtEventDate(d) {
  const t = new Date(String(d || "").slice(0, 10) + "T00:00:00");
  return Number.isNaN(t.getTime()) ? d || "—" : t.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MemberProfile({ member, events, attendance, onBack, onDelete, canEditPhoto = false, photoBusy = false, onPhotoChange, onPhotoRemove }) {
  const fileRef = useRef(null);

  // Attendance history — pinakabago muna.
  const history = events
    .map(e => ({ event: e.title, date: e.date, status: attendance[e.id]?.[member.id] }))
    .filter(h => h.status)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const present = history.filter(h => h.status === "present").length;
  const absent = history.filter(h => h.status === "absent").length;
  const excused = history.filter(h => h.status === "excused").length;
  const rate = history.length ? Math.round((present / history.length) * 100) : 0;
  const rateCls = rate >= 80 ? "text-emerald-700" : rate >= 50 ? "text-amber-600" : "text-rose-600";

  const infoRows = [
    { icon: Cake, label: "Birthday", value: fmtBirthday(member.birthday) },
    { icon: Phone, label: "Contact", value: member.contact || "—" },
    { icon: Mail, label: "Email", value: member.email || "—" },
    { icon: CalendarDays, label: "Date Joined", value: member.joined || "—" },
    { icon: MapPin, label: "Address", value: member.address || "—", wide: true },
  ];

  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-5">
        <button onClick={onBack} className="text-sm font-medium text-stone-500 hover:text-emerald-700 flex items-center gap-1.5">
          <ArrowLeft size={15} /> Back to Members
        </button>
        {onDelete && (
          <button onClick={() => onDelete(member.id)} className="text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>

      {/* Profile hero */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-5 mb-5">
        <div className="relative shrink-0">
          <MemberAvatar member={member} size={96} />
          {canEditPhoto && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                aria-label="Change profile photo"
                title="Change profile photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow disabled:opacity-60"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) onPhotoChange?.(f);
                }}
              />
            </>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-emerald-900">{member.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {member.position && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full px-2.5 py-1">{member.position}</span>
            )}
            <Badge tone={member.status}>{member.status}</Badge>
          </div>
          {canEditPhoto && (
            <p className="text-[11px] text-stone-400 mt-2">
              {photoBusy ? "Uploading photo…" : "Tap the camera icon to change this profile photo."}
            </p>
          )}
          {canEditPhoto && !photoBusy && member.avatarUrl && (
            <button type="button" onClick={onPhotoRemove} className="text-[11px] text-rose-600 hover:underline mt-0.5">
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
        <h3 className="font-semibold text-emerald-900 text-sm mb-3">Personal Info</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {infoRows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className={`flex items-center gap-3 rounded-xl bg-stone-50 px-3.5 py-2.5 ${r.wide ? "sm:col-span-2" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{r.label}</p>
                  <p className="text-sm text-stone-800 break-words">{r.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-emerald-900 text-sm">Attendance</h3>
          <span className="text-[11px] text-stone-400">
            {history.length} event{history.length === 1 ? "" : "s"} recorded
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="rounded-lg bg-emerald-50 py-2 text-center">
            <p className="text-lg font-bold text-emerald-700 leading-none">{present}</p>
            <p className="text-[10px] text-emerald-800/70 mt-1 font-medium">Present</p>
          </div>
          <div className="rounded-lg bg-rose-50 py-2 text-center">
            <p className="text-lg font-bold text-rose-600 leading-none">{absent}</p>
            <p className="text-[10px] text-rose-800/70 mt-1 font-medium">Absent</p>
          </div>
          <div className="rounded-lg bg-amber-50 py-2 text-center">
            <p className="text-lg font-bold text-amber-600 leading-none">{excused}</p>
            <p className="text-[10px] text-amber-800/70 mt-1 font-medium">Excused</p>
          </div>
          <div className="rounded-lg bg-stone-100 py-2 text-center">
            <p className={`text-lg font-bold leading-none ${rateCls}`}>{rate}%</p>
            <p className="text-[10px] text-stone-500 mt-1 font-medium">Rate</p>
          </div>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={CheckSquare} message="Wala pang attendance record." />
        ) : (
          <div className="divide-y divide-stone-100">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800 truncate">{h.event}</p>
                  <p className="text-[11px] text-stone-400">{fmtEventDate(h.date)}</p>
                </div>
                <Badge tone={h.status}>{h.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MemberFormModal({ onClose, onSave }) {
  const [f, setF] = useState({ name: "", position: "", status: "active", contact: "", birthday: "", address: "", joined: new Date().toISOString().slice(0, 10) });
  return (
    <ModalShell title="Add New Member" onClose={onClose}>
      <div className="space-y-3">
        <input className={inputCls} placeholder="Full Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <input className={inputCls} placeholder="Position (optional)" value={f.position} onChange={e => setF({ ...f, position: e.target.value })} />
        <input className={inputCls} type="date" value={f.birthday} onChange={e => setF({ ...f, birthday: e.target.value })} />
        <input className={inputCls} placeholder="Contact Number" value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} />
        <input className={inputCls} placeholder="Address" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
        <button onClick={() => f.name && onSave(f)} className="w-full bg-emerald-700 text-white text-sm py-2 rounded-lg">Save Member</button>
      </div>
    </ModalShell>
  );
}
