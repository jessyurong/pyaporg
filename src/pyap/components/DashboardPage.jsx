import React, { useState } from "react";
import { Camera, Cake, Eye, Megaphone, Settings, X } from "lucide-react";
import { getUrgency } from "../constants.js";
import { StatCard } from "./ui.jsx";

export const WIDGET_LABELS = {
  totalMembers: "Total Members",
  activeMembers: "Active Members",
  totalEvents: "Total Events",
  attendanceRate: "Attendance Rate",
  fundBalance: "Fund Balance",
  birthdays: "Birthdays Count",
  birthdayList: "Birthday List",
  recentAnnouncements: "Recent Announcements",
  snapshots: "Snapshots (Photos)",
};

export function Dashboard({ members, events, attendance, announcements, finance, snapshots, accountBirthdays, isSuperAdmin, widgets, onSaveWidgets, onViewSnapshots, isGuest, onLoginClick }) {
  const [editing, setEditing] = useState(false);
  const w = widgets || {};
  const active = members.filter(m => m.status === "active").length;
  const income = finance.filter(f => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expense = finance.filter(f => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  const allRecords = Object.values(attendance).flatMap(r => Object.values(r));
  const rate = allRecords.length ? Math.round((allRecords.filter(s => s === "present").length / allRecords.length) * 100) : 0;
  const thisMonth = new Date().getMonth();
  const bdaySeen = new Set();
  const birthdays = [...members, ...(accountBirthdays || [])]
    .filter(b => {
      const d = new Date(b.birthday);
      if (!b.birthday || Number.isNaN(d.getTime()) || d.getMonth() !== thisMonth) return false;
      const key = (b.name || "").trim().toLowerCase();
      if (!key || bdaySeen.has(key)) return false;
      bdaySeen.add(key);
      return true;
    })
    .sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate());
  const anyStat = w.totalMembers || w.activeMembers || w.totalEvents || w.attendanceRate || w.fundBalance || w.birthdays;
  const showStats = anyStat && !isGuest;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Dashboard</h1>
        {isSuperAdmin && (
          <button onClick={() => setEditing(true)} className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Settings size={12} /> Customize
          </button>
        )}
      </div>
      {isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Eye size={18} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-amber-900 text-sm">Naka-Guest Mode ka ngayon</div>
            <p className="text-xs text-amber-800 mt-1">
              Para makita ang live na stats — members, events, attendance, finance, at birthdays — mag-login gamit ang account mo.
            </p>
            <button type="button" onClick={onLoginClick} className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
              Mag-login
            </button>
          </div>
        </div>
      )}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          {w.totalMembers && <StatCard num={members.length} label="Total Members" />}
          {w.activeMembers && <StatCard num={active} label="Active Members" />}
          {w.totalEvents && <StatCard num={events.length} label="Total Events" />}
          {w.attendanceRate && <StatCard num={`${rate}%`} label="Attendance Rate" />}
          {w.fundBalance && <StatCard num={`₱${(income - expense).toFixed(0)}`} label="Fund Balance" />}
          {w.birthdays && <StatCard num={birthdays.length} label="Birthdays This Month" />}
        </div>
      )}
      {!isGuest && w.birthdayList && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
          <h3 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-1.5"><Cake size={14} /> Birthdays This Month</h3>
          {birthdays.length === 0 ? <p className="text-sm text-stone-400">No birthdays this month.</p> :
            <ul className="text-sm space-y-1">{birthdays.map(b => <li key={b.id || b.name}>{b.name} — {new Date(String(b.birthday).slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}</li>)}</ul>}
        </div>
      )}
      {w.recentAnnouncements && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-emerald-900 text-sm mb-3 flex items-center gap-1.5"><Megaphone size={14} /> Recent Announcements</h3>
          {announcements.slice(0, 3).map(a => {
            const u = getUrgency(a);
            return (
              <div key={a.id} className={`border-l-4 ${u.border} ${u.bg} rounded-r-lg p-3 mb-2`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] text-stone-400">{a.date}</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.badge}`}>{u.label}</span>
                </div>
                <div className="font-semibold text-sm">{a.title}</div>
                <p className="text-xs text-stone-600 mt-0.5">{a.content}</p>
              </div>
            );
          })}
        </div>
      )}
      {w.snapshots && snapshots.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5"><Camera size={14} /> Snapshots</h3>
            <button onClick={onViewSnapshots} className="text-xs text-emerald-700 font-semibold hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {snapshots.slice(0, 6).map(s => (
              <img key={s.id} src={s.url} alt={s.title || "Snapshot"} className="w-full h-24 object-cover rounded-lg" loading="lazy" />
            ))}
          </div>
        </div>
      )}
      {editing && (
        <DashboardCustomizeModal current={w} onClose={() => setEditing(false)} onSave={(v) => { onSaveWidgets(v); setEditing(false); }} />
      )}
    </div>
  );
}

export function DashboardCustomizeModal({ current, onClose, onSave }) {
  const [v, setV] = useState(current);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-emerald-900">Customize Dashboard</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <p className="text-xs text-stone-500 mb-3">Pick what to show on the dashboard.</p>
        <div className="space-y-2 mb-4">
          {Object.keys(WIDGET_LABELS).map(k => (
            <label key={k} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
              <input type="checkbox" checked={!!v[k]} onChange={e => setV({ ...v, [k]: e.target.checked })} />
              {WIDGET_LABELS[k]}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-stone-300 rounded-lg py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(v)} className="flex-1 bg-emerald-700 text-white rounded-lg py-2 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
