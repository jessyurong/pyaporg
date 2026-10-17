import React, { useMemo } from "react";
import { Medal, Trophy } from "lucide-react";
import { StatCard } from "./ui.jsx";
import { MemberAvatar } from "./MembersPage.jsx";

// Kulay ng attendance rate — >=80% emerald, 50-79% amber, <50% rose.
function rateTone(rate) {
  if (rate >= 80) return "bg-emerald-50 text-emerald-700";
  if (rate >= 50) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

// Medalya para sa top 3 (gold / silver / bronze).
const MEDALS = [
  { Icon: Trophy, cls: "bg-amber-100 text-amber-600" },
  { Icon: Medal, cls: "bg-stone-100 text-stone-500" },
  { Icon: Medal, cls: "bg-orange-100 text-orange-700" },
];

export function Leaderboard({ members = [], events = [], attendance = {} }) {
  // Mga event na may na-record na attendance — ito ang denominator ng rate.
  const recordedEventIds = useMemo(
    () =>
      events
        .filter((e) => attendance?.[e.id] && Object.keys(attendance[e.id]).length > 0)
        .map((e) => e.id),
    [events, attendance]
  );

  // Stats per member: present count at attendance rate, sorted by rate desc.
  const rows = useMemo(() => {
    const total = recordedEventIds.length;
    return members
      .map((m) => {
        let present = 0;
        for (const eventId of recordedEventIds) {
          if (attendance[eventId]?.[m.id] === "present") present += 1;
        }
        const rate = total ? Math.round((present / total) * 100) : 0;
        return { member: m, present, total, rate };
      })
      .sort(
        (a, b) =>
          b.rate - a.rate ||
          b.present - a.present ||
          (a.member.name || "").localeCompare(b.member.name || "")
      );
  }, [members, recordedEventIds, attendance]);

  const avgRate = rows.length ? Math.round(rows.reduce((s, r) => s + r.rate, 0) / rows.length) : 0;

  // Empty state — wala pang kahit isang event na may attendance record.
  if (recordedEventIds.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-5">Leaderboard</h1>
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center max-w-xl">
          <Trophy size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-700">No attendance data yet</p>
          <p className="text-xs text-stone-500 mt-1.5">
            Wala pang na-record na attendance sa kahit anong event. Pumunta sa Attendance screen at mag-mark muna ng attendance para lumabas ang ranking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-1">Leaderboard</h1>
      <p className="text-sm text-stone-500 mb-5">
        Attendance ranking ng mga members batay sa {recordedEventIds.length} recorded event{recordedEventIds.length === 1 ? "" : "s"}.
      </p>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard num={members.length} label="Total Members" />
        <StatCard num={recordedEventIds.length} label="Total Events" />
        <StatCard num={`${avgRate}%`} label="Avg Attendance Rate" />
      </div>

      {/* Ranked table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-emerald-50 text-emerald-900 text-left">
              <th className="p-3 w-16">#</th>
              <th className="p-3">Member Name</th>
              <th className="p-3 text-center">Present</th>
              <th className="p-3 text-center">Total Events</th>
              <th className="p-3 text-center">Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const medal = i < 3 ? MEDALS[i] : null;
              const MedalIcon = medal?.Icon;
              return (
                <tr key={r.member.id} className="border-t border-stone-100">
                  <td className="p-3">
                    {MedalIcon ? (
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center ${medal.cls}`} title={`Rank ${i + 1}`}>
                        <MedalIcon size={14} />
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-stone-400 pl-2">{i + 1}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <MemberAvatar member={r.member} size={26} />
                      <div className="min-w-0">
                        <div className="font-medium text-stone-800 truncate">{r.member.name}</div>
                        {r.member.position && <div className="text-[11px] text-stone-400">{r.member.position}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-medium text-stone-600">{r.present}</td>
                  <td className="p-3 text-center text-stone-400">{r.total}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${rateTone(r.rate)}`}>
                      {r.rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr className="border-t border-stone-100">
                <td colSpan={5} className="p-6 text-center text-xs text-stone-400">
                  Walang members na maipapakita.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-stone-400 mt-2">
        Present = bilang ng recorded events kung saan "present" ang member. Rate = present ÷ {recordedEventIds.length} recorded event
        {recordedEventIds.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
