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

// Podium styling per place (gold / silver / bronze).
const PODIUM = {
  1: {
    height: "h-24",
    block: "bg-emerald-700",
    num: "text-3xl",
    ring: "ring-amber-400",
    avatar: 64,
    medal: <Trophy size={18} className="text-amber-500" />,
  },
  2: {
    height: "h-16",
    block: "bg-emerald-600",
    num: "text-2xl",
    ring: "ring-stone-300",
    avatar: 48,
    medal: <Medal size={15} className="text-stone-400" />,
  },
  3: {
    height: "h-16",
    block: "bg-emerald-500",
    num: "text-2xl",
    ring: "ring-orange-300",
    avatar: 48,
    medal: <Medal size={15} className="text-amber-700" />,
  },
};

function YouChip() {
  return <span className="text-[9px] font-bold bg-emerald-600 text-white rounded-full px-1.5 py-0.5 align-middle">You</span>;
}

function Podium({ row, place, isMe }) {
  const cfg = PODIUM[place];
  return (
    <div className="w-22 sm:w-28 shrink-0 flex flex-col items-center justify-end">
      <div className="mb-1">{cfg.medal}</div>
      <div className={`rounded-full ring-2 ring-offset-2 ring-offset-white ${cfg.ring} mb-1.5`}>
        <MemberAvatar member={row.member} size={cfg.avatar} />
      </div>
      <p className="w-full truncate px-0.5 text-center text-xs font-bold text-stone-800">
        {row.member.name} {isMe && <YouChip />}
      </p>
      {row.member.position && <p className="w-full truncate px-0.5 text-center text-[10px] text-stone-400">{row.member.position}</p>}
      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${rateTone(row.rate)}`}>{row.rate}%</span>
      <div className={`mt-2 w-full ${cfg.height} rounded-t-lg ${cfg.block} flex items-center justify-center`}>
        <span className={`${cfg.num} font-extrabold text-white/95`}>{place}</span>
      </div>
    </div>
  );
}

export function Leaderboard({ members = [], events = [], attendance = {}, currentUserId = null }) {
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

  // Top 3 sa podium (2nd - 1st - 3rd ang order, para gitna ang champion).
  const top = rows.slice(0, 3);
  const podiumList = [];
  if (top[1]) podiumList.push({ row: top[1], place: 2 });
  if (top[0]) podiumList.push({ row: top[0], place: 1 });
  if (top[2]) podiumList.push({ row: top[2], place: 3 });
  const rest = rows.slice(3);

  // Sariling rank ("You" indicator).
  const myRank = currentUserId ? rows.findIndex((r) => r.member.userId === currentUserId) : -1;
  const me = myRank >= 0 ? rows[myRank] : null;

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

      {/* Podium — top 3 */}
      {top.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 px-4 pt-5 pb-0 mb-5 overflow-hidden">
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            {podiumList.map(({ row, place }) => (
              <Podium key={row.member.id} row={row} place={place} isMe={!me ? false : me.member.id === row.member.id} />
            ))}
          </div>
        </div>
      )}

      {/* Rank 4 and below */}
      {rest.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {rest.map((r, i) => {
            const rank = i + 4;
            const isMe = !!me && me.member.id === r.member.id;
            return (
              <div key={r.member.id} className={`flex items-center gap-3 p-3 ${isMe ? "bg-emerald-50/70" : ""}`}>
                <span className="w-8 shrink-0 text-center text-xs font-bold text-stone-400 tabular-nums">
                  {String(rank).padStart(2, "0")}
                </span>
                <MemberAvatar member={r.member} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {r.member.name} {isMe && <YouChip />}
                  </p>
                  {r.member.position && <p className="text-[11px] text-stone-400 truncate">{r.member.position}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${rateTone(r.rate)}`}>{r.rate}%</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {r.present}/{r.total} present
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rows.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-xs text-stone-400">
          Walang members na maipapakita.
        </div>
      )}

      <p className="text-[11px] text-stone-400 mt-2">
        Present = bilang ng recorded events kung saan "present" ang member. Rate = present ÷ {recordedEventIds.length} recorded event
        {recordedEventIds.length === 1 ? "" : "s"}.
      </p>

      {/* "You" pill — sariling rank, naka-pin sa ibaba habang nag-iiscroll */}
      {me && (
        <div className="sticky bottom-4 z-10 mt-5 flex justify-center">
          <div className="bg-emerald-900 text-white rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2 shadow-lg">
            <MemberAvatar member={me.member} size={24} />
            <span className="text-xs font-bold">You</span>
            <span className="text-[11px] font-semibold text-emerald-200">
              #{myRank + 1} · {me.rate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
