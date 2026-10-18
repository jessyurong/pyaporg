import React, { useState } from "react";
import { CalendarDays, Camera, Cake, Eye, Medal, Megaphone, Settings, TrendingUp, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUrgency } from "../constants.js";
import { StatCard } from "./ui.jsx";

// Nakaayos ayon sa display order ng dashboard.
export const WIDGET_LABELS = {
  recentAnnouncements: "Announcements",
  upcomingEvents: "Upcoming Events",
  birthdayList: "Birthday List",
  totalMembers: "Total Members",
  activeMembers: "Active Members",
  totalEvents: "Total Events",
  attendanceRate: "Attendance Rate",
  fundBalance: "Fund Balance",
  birthdays: "Birthdays Count",
  attendanceTrend: "Attendance Trend",
  topAttenders: "Top Attenders",
  snapshots: "Snapshots (Photos)",
};

export function Dashboard({ members, events, attendance, announcements, finance, snapshots, accountBirthdays, isSuperAdmin, widgets, onSaveWidgets, onViewSnapshots, onViewAnnouncements, onViewEvents, isGuest, onLoginClick }) {
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

  // Upcoming Events: susunod na activities (mula ngayon pataas), pinakamalapit muna.
  const today = new Date().toLocaleDateString("en-CA");
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Announcements: urgent/important muna bago normal; newest-first pa rin sa loob ng bawat group.
  const urgencyRank = { urgent: 0, important: 1, normal: 2 };
  const headlineAnnouncements = [...announcements]
    .sort((a, b) => (urgencyRank[a.urgency] ?? 2) - (urgencyRank[b.urgency] ?? 2))
    .slice(0, 3);

  // Top Attenders: members sorted by attendance rate (present / total recorded)
  const topAttenders = members
    .map(m => {
      const recorded = events.filter(e => attendance[e.id]?.[m.id]);
      const presentCount = recorded.filter(e => attendance[e.id]?.[m.id] === "present").length;
      const rate = recorded.length ? Math.round((presentCount / recorded.length) * 100) : 0;
      return { id: m.id, name: m.name, presentCount, total: recorded.length, rate };
    })
    .filter(m => m.total > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  // Attendance Trend: last 6 events with their attendance rate
  const trendData = events
    .filter(e => attendance[e.id])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6)
    .map(e => {
      const rec = attendance[e.id] || {};
      const vals = Object.values(rec);
      const rate = vals.length ? Math.round((vals.filter(s => s === "present").length / vals.length) * 100) : 0;
      return { name: e.title.length > 12 ? e.title.slice(0, 12) + "…" : e.title, rate };
    });

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

      <div className="space-y-5">
        {isGuest && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
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

        {/* 1. Announcements — pinaka-una: balita/urgent na dapat makita agad */}
        {w.recentAnnouncements && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5"><Megaphone size={14} /> Announcements</h3>
              {onViewAnnouncements && (
                <button onClick={onViewAnnouncements} className="text-xs text-emerald-700 font-semibold hover:underline">View all</button>
              )}
            </div>
            {headlineAnnouncements.length === 0 ? (
              <p className="text-sm text-stone-400">No announcements yet.</p>
            ) : (
              <div className="space-y-2">
                {headlineAnnouncements.map(a => {
                  const u = getUrgency(a);
                  return (
                    <div key={a.id} className={`border-l-4 ${u.border} ${u.bg} rounded-r-lg p-3`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] text-stone-400">{a.date}</div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`}></span>{u.label}
                        </span>
                      </div>
                      <div className="font-semibold text-sm">{a.title}</div>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-3">{a.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Upcoming Events — ang "Susunod" na activity ay naka-highlight */}
        {!isGuest && w.upcomingEvents && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                <CalendarDays size={14} /> Upcoming Events
              </h3>
              {onViewEvents && (
                <button onClick={onViewEvents} className="text-xs text-emerald-700 font-semibold hover:underline">View all</button>
              )}
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-stone-400">No upcoming events scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((e, i) => {
                  const evDate = new Date(e.date + "T00:00:00");
                  if (i === 0) {
                    const du = Math.round((evDate - new Date(today + "T00:00:00")) / 86400000);
                    const label = du <= 0 ? "Ngayon" : du === 1 ? "Bukas" : "Susunod";
                    return (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-700 text-white">
                        <div className="bg-white/15 rounded-lg px-2.5 py-1.5 text-center shrink-0 min-w-[52px]">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                            {evDate.toLocaleDateString("en-US", { month: "short" })}
                          </p>
                          <p className="text-lg font-bold leading-none">{evDate.getDate()}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-200">{label}</p>
                          <p className="text-sm font-semibold truncate">{e.title}</p>
                          {e.location && <p className="text-xs text-emerald-100 truncate">{e.location}</p>}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg text-center min-w-[44px]">
                        {evDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{e.title}</p>
                        {e.location && <p className="text-xs text-stone-500 truncate">{e.location}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Birthdays This Month */}
        {!isGuest && w.birthdayList && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-1.5"><Cake size={14} /> Birthdays This Month</h3>
            {birthdays.length === 0 ? <p className="text-sm text-stone-400">No birthdays this month.</p> :
              <ul className="text-sm space-y-1">{birthdays.map(b => <li key={b.id || b.name}>{b.name} — {new Date(String(b.birthday).slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}</li>)}</ul>}
          </div>
        )}

        {/* 4. Stats */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {w.totalMembers && <StatCard num={members.length} label="Total Members" />}
            {w.activeMembers && <StatCard num={active} label="Active Members" />}
            {w.totalEvents && <StatCard num={events.length} label="Total Events" />}
            {w.attendanceRate && <StatCard num={`${rate}%`} label="Attendance Rate" />}
            {w.fundBalance && <StatCard num={`₱${(income - expense).toFixed(0)}`} label="Fund Balance" />}
            {w.birthdays && <StatCard num={birthdays.length} label="Birthdays This Month" />}
          </div>
        )}

        {/* 5. Attendance Trend */}
        {!isGuest && w.attendanceTrend && trendData.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-emerald-900 text-sm mb-3 flex items-center gap-1.5">
              <TrendingUp size={14} /> Attendance Trend (Last 6 Events)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Attendance Rate"]} />
                <Bar dataKey="rate" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 6. Top Attenders */}
        {!isGuest && w.topAttenders && topAttenders.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-emerald-900 text-sm mb-3 flex items-center gap-1.5">
              <Medal size={14} /> Top Attenders
            </h3>
            <div className="space-y-2">
              {topAttenders.map((m, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const rateColor = m.rate >= 80 ? "bg-emerald-500" : m.rate >= 50 ? "bg-amber-400" : "bg-rose-400";
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                    <span className="text-sm font-medium text-stone-800 flex-1 truncate">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div className={`h-2 rounded-full ${rateColor} transition-all`} style={{ width: `${m.rate}%` }} />
                      </div>
                      <span className="text-xs font-bold text-stone-600 w-10 text-right">{m.rate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Snapshots */}
        {w.snapshots && snapshots.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
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
      </div>

      {editing && (
        <DashboardCustomizeModal current={w} onClose={() => setEditing(false)} onSave={(v) => { onSaveWidgets(v); setEditing(false); }} />
      )}
    </div>
  );
}

export function DashboardCustomizeModal({ current, onClose, onSave }) {
  const [v, setV] = useState(current);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-md my-auto max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
