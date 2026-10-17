import React, { useRef, useState } from "react";
import { Camera, Phone, Plus, Trash2, User } from "lucide-react";
import { fmtBirthday } from "../lib/utils.js";
import { Badge, ModalShell, inputCls } from "./ui.jsx";

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

export function MemberProfile({ member, events, attendance, onBack, onDelete, canEditPhoto = false, photoBusy = false, onPhotoChange, onPhotoRemove }) {
  const fileRef = useRef(null);
  const history = events.map(e => ({ event: e.title, date: e.date, status: attendance[e.id]?.[member.id] })).filter(h => h.status);
  const rate = history.length ? Math.round((history.filter(h => h.status === "present").length / history.length) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <button onClick={onBack} className="text-sm text-emerald-700">&larr; Back to Members</button>
        {onDelete && <button onClick={() => onDelete(member.id)} className="text-rose-600 text-sm flex items-center gap-1"><Trash2 size={14} /> Delete</button>}
      </div>
      <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-5 mb-5">
        <div className="relative shrink-0">
          <MemberAvatar member={member} size={80} />
          {canEditPhoto && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                aria-label="Change profile photo"
                title="Change profile photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow disabled:opacity-60"
              >
                <Camera size={13} />
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
          <h2 className="text-lg font-bold">{member.name}</h2>
          <p className="text-sm text-stone-500 mt-0.5">{member.position} — <Badge tone={member.status}>{member.status}</Badge></p>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5"><Phone size={12} /> {member.contact}</p>
          {canEditPhoto && (
            <p className="text-[11px] text-stone-400 mt-1.5">
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
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5 text-sm space-y-1.5">
        <h3 className="font-semibold text-emerald-900 mb-2">Personal Info</h3>
        <p><b>Birthday:</b> {fmtBirthday(member.birthday)}</p>
        <p><b>Address:</b> {member.address}</p>
        <p><b>Date Joined:</b> {member.joined}</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-semibold text-emerald-900 text-sm mb-3">Attendance History (Rate: {rate}%)</h3>
        {history.length === 0 ? <p className="text-sm text-stone-400">No records yet.</p> : (
          <table className="w-full text-sm min-w-[500px]">
            <thead><tr className="text-left text-stone-500"><th className="py-1.5">Event</th><th className="py-1.5">Date</th><th className="py-1.5">Status</th></tr></thead>
            <tbody>{history.map((h, i) => (
              <tr key={i} className="border-t border-stone-100"><td className="py-1.5">{h.event}</td><td className="py-1.5">{h.date}</td><td className="py-1.5"><Badge tone={h.status}>{h.status}</Badge></td></tr>
            ))}</tbody>
          </table>
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
