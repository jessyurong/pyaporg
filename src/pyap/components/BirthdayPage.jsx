import React, { useState } from "react";
import { toast } from "sonner";
import { Cake, Check, Copy } from "lucide-react";
import { differenceInCalendarDays, differenceInYears, format } from "date-fns";
import { MemberAvatar } from "./MembersPage.jsx";

// Mga caption choices — automatic na napapalitan ang pangalan (at age kung kilala).
// build(firstName, fullName, age) => string
const CAPTIONS = [
  {
    key: "sincere",
    label: "💚 Sincere",
    build: (first) =>
      `Maligayang kaarawan, ${first}! 🎂 Nawa'y punuin ng saya, pagmamahal, at biyaya ang bagong taon ng iyong buhay. Dasal namin ang iyong kaligayahan at tagumpay — enjoy your special day! 🎉`,
  },
  {
    key: "funny",
    label: "😂 Funny",
    build: (first) =>
      `HAPPY BIRTHDAY, ${first}! 🥳 Ngayong araw mo lang 'to ha — libre mo na kami! Chour! 😂 Pero seryoso, deserve mo ang isang araw na puno ng saya, pagkain, at pagmamahal. Kain nang marami at magpahinga ka — birthday mo 'yan! 🎂`,
  },
  {
    key: "org",
    label: "🎉 PYAP Style",
    build: (_first, full) =>
      `🎂 Maligayang kaarawan mula sa buong PYAP Barangay Samac, ${full}! Ang iyong dedikasyon at pagmamalasakit sa ating organisasyon ay tunay na inspirasyon. Nawa'y patuloy kang pagpalain sa bagong taon ng iyong buhay. 🎉`,
  },
  {
    key: "short",
    label: "✨ Short & Sweet",
    build: (first, _full, age) =>
      age
        ? `🎂 HBD, ${first}! ${age} ka na today — new age, new blessings, same amazing you! ✨`
        : `🎂 HBD, ${first}! New age, new blessings, same amazing you! ✨`,
  },
  {
    key: "blessing",
    label: "🙏 Blessing",
    build: (first) =>
      `"Ang bawat bagong taon ay regalo at bagong simula." 🎁 Maligayang kaarawan, ${first}! Nawa'y patuloy kang lumago, mangarap, at magtagumpay. Ipinagdarasal namin ang pinakamaganda para sa'yo. 🙏✨`,
  },
  {
    key: "english",
    label: "🎂 English",
    build: (first) =>
      `Happy Birthday, ${first}! 🎉 Wishing you a year filled with happiness, good health, and success. Cheers to new adventures and more blessings! 🎂🥳`,
  },
];

// "YYYY-MM-DD" => { y, mo (0-11), d } — null kung invalid/walang birthday.
function parseBday(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw || "").slice(0, 10));
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2] - 1;
  const d = +m[3];
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  return { y, mo, d };
}

// Kung may valid na taon (hindi placeholder o typo), pwede nang i-compute ang age.
const hasYear = (b, today) => b.y >= 1930 && b.y <= today.getFullYear();

const firstNameOf = (name) => (String(name || "").trim().split(/\s+/)[0] || name || "Friend");

// Ilang araw pa bago ang birthday (0 = ngayon).
function daysUntil(mo, d, today) {
  let next = new Date(today.getFullYear(), mo, d);
  if (differenceInCalendarDays(next, today) < 0) next = new Date(today.getFullYear() + 1, mo, d);
  return differenceInCalendarDays(next, today);
}

export function BirthdayGreetings({ members = [], accountBirthdays = [] }) {
  const [copiedKey, setCopiedKey] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tM = today.getMonth();
  const tD = today.getDate();

  // I-merge ang members + account birthdays (gaya ng Dashboard), dedupe by name.
  const seen = new Set();
  const all = [...members, ...accountBirthdays]
    .filter((p) => {
      const key = (p.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({ ...p, b: parseBday(p.birthday) }))
    .filter((p) => p.b);

  const todays = all.filter((p) => p.b.mo === tM && p.b.d === tD);
  const monthList = all.filter((p) => p.b.mo === tM).sort((a, b) => a.b.d - b.b.d);
  const upcoming = all
    .filter((p) => !(p.b.mo === tM && p.b.d === tD))
    .map((p) => ({ ...p, in: daysUntil(p.b.mo, p.b.d, today) }))
    .sort((a, b) => a.in - b.in);
  const nextUp = upcoming.filter((p) => p.b.mo !== tM).slice(0, 5);
  const featured = todays.length ? todays : upcoming.slice(0, 1);
  const isTodaySection = todays.length > 0;

  async function copyCaption(key, text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        toast.error("Hindi ma-copy — piliin na lang manually ang text.");
        return;
      }
    }
    setCopiedKey(key);
    toast.success("Caption copied! I-paste na sa Messenger o FB 📋");
    window.setTimeout(() => setCopiedKey((k) => (k === key ? "" : k)), 2000);
  }

  // ---------- Empty state ----------
  if (all.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-5">Birthday Greetings</h1>
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center max-w-xl">
          <Cake size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-700">Walang nakatalang birthday</p>
          <p className="text-xs text-stone-500 mt-1.5">
            Magdagdag ng birthday sa member profiles para automatic silang lumabas dito kasama ang ready-made greeting captions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-1">Birthday Greetings</h1>
      <p className="text-sm text-stone-500 mb-5">
        Automatic na greeting captions para sa mga celebrants — pili lang ng gusto mo at i-tap ang Copy.
      </p>

      {/* ---------- Featured celebrant(s) ---------- */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold text-emerald-900">
          {isTodaySection ? `🎉 Ngayong Araw (${todays.length})` : "⏳ Susunod na Celebrant"}
        </h2>
        {!isTodaySection && <span className="text-[11px] text-stone-400">advance greeting — ready na sa araw niya</span>}
      </div>

      {featured.map((p) => {
        const age = isTodaySection && hasYear(p.b, today) ? differenceInYears(today, new Date(p.b.y, p.b.mo, p.b.d)) : null;
        return (
          <div key={p.id || p.name} className="mb-6">
            {/* Celebrant card */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4 mb-3">
              <MemberAvatar member={p} size={56} />
              <div className="min-w-0">
                <h3 className="font-bold text-emerald-900">{p.name}</h3>
                {p.position && <p className="text-xs text-stone-500">{p.position}</p>}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {isTodaySection ? (
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-1">
                      🎉 {age ? `${age} na today!` : "Birthday ngayon!"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 rounded-full px-2.5 py-1">
                      🎈 sa {p.in} araw pa
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400">{format(new Date(2000, p.b.mo, p.b.d), "MMMM d")}</span>
                </div>
              </div>
            </div>

            {/* Caption choices */}
            <div className="grid gap-3 md:grid-cols-2">
              {CAPTIONS.map((cap) => {
                const key = `${p.id || p.name}:${cap.key}`;
                const text = cap.build(firstNameOf(p.name), p.name, age);
                const copied = copiedKey === key;
                return (
                  <div key={cap.key} className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 rounded-full px-2.5 py-1">{cap.label}</span>
                      <button
                        onClick={() => copyCaption(key, text)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shrink-0 ${
                          copied ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ---------- Birthdays this month ---------- */}
      {monthList.length > 0 && (
        <div className="mt-2">
          <h2 className="text-sm font-bold text-emerald-900 mb-2">🎈 Birthdays Ngayong {format(today, "MMMM")}</h2>
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {monthList.map((p) => (
              <div key={p.id || p.name} className="flex items-center gap-3 p-3">
                <MemberAvatar member={p} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                  {p.position && <p className="text-[11px] text-stone-400 truncate">{p.position}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-stone-600">{format(new Date(2000, p.b.mo, p.b.d), "MMM d")}</p>
                  {p.b.d === tD ? (
                    <p className="text-[10px] font-semibold text-amber-600">Ngayon! 🎉</p>
                  ) : p.b.d > tD ? (
                    <p className="text-[10px] text-stone-400">{p.b.d - tD === 1 ? "Bukas 🎈" : `sa ${p.b.d - tD} araw`}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Next up (next months) ---------- */}
      {nextUp.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold text-emerald-900 mb-2">📅 Susunod na mga Birthday</h2>
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {nextUp.map((p) => (
              <div key={p.id || p.name} className="flex items-center gap-3 p-3">
                <MemberAvatar member={p} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                  {p.position && <p className="text-[11px] text-stone-400 truncate">{p.position}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-stone-600">{format(new Date(2000, p.b.mo, p.b.d), "MMM d")}</p>
                  <p className="text-[10px] text-stone-400">{p.in === 1 ? "Bukas 🎈" : `sa ${p.in} araw`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
