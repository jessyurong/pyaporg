import React, { useState } from "react";
import { Award, Dumbbell, HandHeart, Heart, Medal, Megaphone, Plus, Star, Trash2, Trophy } from "lucide-react";
import { ModalShell, inputCls } from "./ui.jsx";

export function Achievements({ members, achievements, onAdd, onDelete }) {
  const withNames = achievements
    .map(a => ({ ...a, memberName: members.find(m => m.id === a.memberId)?.name || "Unknown" }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Achievements</h1>
        {onAdd && <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Achievement</button>}
      </div>
      <p className="text-sm text-stone-500 mb-5">Ipagdiwang ang mga milestone at magagandang gawa ng mga miyembro — mula sa perfect attendance hanggang outstanding volunteer work.</p>

      {withNames.length === 0 ? (
        <p className="text-sm text-stone-400">Wala pang naitalang achievement.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {withNames.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-stone-200 p-4 flex gap-3 items-start">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <BadgeIcon badge={a.badge} size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-emerald-900">{a.title}</div>
                <div className="text-xs text-stone-500 mb-1">{a.memberName} • {a.date}</div>
                <p className="text-xs text-stone-600">{a.description}</p>
              </div>
              {onDelete && <button onClick={() => onDelete(a.id)} className="text-rose-600 flex-shrink-0"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const BADGE_ICONS = { medal: Medal, star: Star, trophy: Trophy, award: Award, dumbbell: Dumbbell, megaphone: Megaphone, handheart: HandHeart, heart: Heart };
export const BADGE_OPTIONS = Object.keys(BADGE_ICONS);

export function BadgeIcon({ badge, size = 18 }) {
  const Icon = BADGE_ICONS[badge] || Medal;
  return <Icon size={size} />;
}

export function AchievementFormModal({ members, onClose, onSave }) {
  const [f, setF] = useState({ memberId: members[0]?.id, title: "", description: "", badge: "medal" });
  return (
    <ModalShell title="Add Achievement" onClose={onClose}>
      <div className="space-y-3">
        <select className={inputCls} value={f.memberId} onChange={e => setF({ ...f, memberId: e.target.value })}>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input className={inputCls} placeholder="Achievement Title (e.g. Perfect Attendance)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <textarea className={inputCls} rows={3} placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1.5">Badge</label>
          <div className="flex gap-2 flex-wrap">
            {BADGE_OPTIONS.map(b => (
              <button
                key={b}
                type="button"
                aria-label={`Badge ${b}`}
                onClick={() => setF({ ...f, badge: b })}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition ${f.badge === b ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 text-stone-400 hover:text-stone-600"}`}
              >
                <BadgeIcon badge={b} size={18} />
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => f.title && f.memberId && onSave(f)} className="w-full bg-emerald-700 text-white text-sm py-2 rounded-lg">Save Achievement</button>
      </div>
    </ModalShell>
  );
}
