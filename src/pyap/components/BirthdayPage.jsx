import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Cake,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { differenceInCalendarDays, differenceInYears, format } from "date-fns";
import { MemberAvatar } from "./MembersPage.jsx";

// Mga caption choices — automatic na napapalitan ang pangalan (at age kung kilala).
// build(firstName, fullName, age) => string
const CAPTIONS = [
  {
    key: "sincere",
    label: "Sincere",
    build: (first) =>
      `Maligayang kaarawan, ${first}! 🎂 Nawa'y punuin ng saya, pagmamahal, at biyaya ang bagong taon ng iyong buhay. Dasal namin ang iyong kaligayahan at tagumpay — enjoy your special day! 🎉`,
  },
  {
    key: "funny",
    label: "Funny",
    build: (first) =>
      `HAPPY BIRTHDAY, ${first}! 🥳 Ngayong araw mo lang 'to ha — libre mo na kami! Chour! 😂 Pero seryoso, deserve mo ang isang araw na puno ng saya, pagkain, at pagmamahal. Kain nang marami at magpahinga ka — birthday mo 'yan! 🎂`,
  },
  {
    key: "org",
    label: "PYAP Style",
    build: (_first, full) =>
      `🎂 Maligayang kaarawan mula sa buong PYAP Barangay Samac, ${full}! Ang iyong dedikasyon at pagmamalasakit sa ating organisasyon ay tunay na inspirasyon. Nawa'y patuloy kang pagpalain sa bagong taon ng iyong buhay. 🎉`,
  },
  {
    key: "short",
    label: "Short & Sweet",
    build: (first, _full, age) =>
      age
        ? `🎂 HBD, ${first}! ${age} ka na today — new age, new blessings, same amazing you! ✨`
        : `🎂 HBD, ${first}! New age, new blessings, same amazing you! ✨`,
  },
  {
    key: "blessing",
    label: "Blessing",
    build: (first) =>
      `"Ang bawat bagong taon ay regalo at bagong simula." 🎁 Maligayang kaarawan, ${first}! Nawa'y patuloy kang lumago, mangarap, at magtagumpay. Ipinagdarasal namin ang pinakamaganda para sa'yo. 🙏✨`,
  },
  {
    key: "english",
    label: "English",
    build: (first) =>
      `Happy Birthday, ${first}! 🎉 Wishing you a year filled with happiness, good health, and success. Cheers to new adventures and more blessings! 🎂🥳`,
  },
];

const STYLE_STORAGE_KEY = "pyap-birthday-style";

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
const hasYear = (b, reference) => b.y >= 1930 && b.y <= reference.getFullYear();

const firstNameOf = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)[0] ||
  name ||
  "Friend";

const birthdayLabel = (b) => format(new Date(2000, b.mo, b.d), "MMMM d");

function nextBirthdayDate(mo, d, today) {
  let next = new Date(today.getFullYear(), mo, d);
  if (differenceInCalendarDays(next, today) < 0) next = new Date(today.getFullYear() + 1, mo, d);
  return next;
}

function ageOn(b, date) {
  if (!hasYear(b, date)) return null;
  return differenceInYears(date, new Date(b.y, b.mo, b.d));
}

function memberSinceLabel(joined) {
  if (!joined) return "";
  const d = new Date(String(joined).slice(0, 10) + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return `Member since ${format(d, "yyyy")}`;
}

function countdownLabel(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 14) return `In ${days} days`;
  return "";
}

function readSavedStyle() {
  try {
    if (typeof window === "undefined") return CAPTIONS[0].key;
    const saved = window.localStorage.getItem(STYLE_STORAGE_KEY);
    if (CAPTIONS.some((c) => c.key === saved)) return saved;
  } catch {
    /* localStorage can be unavailable in private mode */
  }
  return CAPTIONS[0].key;
}

function writeSavedStyle(key) {
  try {
    window.localStorage.setItem(STYLE_STORAGE_KEY, key);
  } catch {
    /* ignore */
  }
}

async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
      return copied;
    } catch {
      return false;
    }
  }
}

function StyleChips({ activeKey, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CAPTIONS.map((cap) => {
        const active = cap.key === activeKey;
        return (
          <button
            key={cap.key}
            type="button"
            onClick={() => onSelect(cap.key)}
            aria-pressed={active}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              active
                ? "bg-emerald-700 text-white shadow-sm"
                : "border border-stone-200 bg-white/80 text-stone-600 hover:border-emerald-200 hover:text-emerald-700"
            }`}
          >
            {cap.label}
          </button>
        );
      })}
    </div>
  );
}

function SpotlightCard({ person, style, copiedKey, onStyle, onCopy, onViewProfile }) {
  const age = ageOn(person.b, new Date(person.next));
  const text = style.build(firstNameOf(person.name), person.name, age);
  const copyKey = `today:${person.id || person.name}:${style.key}`;
  const copied = copiedKey === copyKey;
  const since = memberSinceLabel(person.joined);
  const canViewProfile = !!onViewProfile && person.source === "member";

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-4 sm:p-6">
      <Cake
        className="pointer-events-none absolute -right-5 -top-6 text-amber-200/50"
        size={116}
        strokeWidth={1.1}
      />
      <div className="relative flex-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
          <Cake size={11} /> Birthday today
        </span>

        <div className="mt-3 flex items-start gap-3.5">
          <MemberAvatar member={person} size={64} className="ring-4 ring-white/80 shadow-sm" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-emerald-950">{person.name}</h3>
            {person.position && (
              <p className="truncate text-xs text-stone-500">{person.position}</p>
            )}
            <p className="mt-1 text-xs font-medium text-stone-600">
              {age ? `Turning ${age} today` : "Birthday today"} · {birthdayLabel(person.b)}
            </p>
            {since && <p className="mt-0.5 text-[11px] text-stone-400">{since}</p>}
          </div>
        </div>

        <div className="mt-4">
          <StyleChips activeKey={style.key} onSelect={onStyle} />
        </div>

        <div className="mt-3 rounded-xl border border-white/80 bg-white/80 p-3.5 text-sm leading-relaxed text-stone-700">
          {text}
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCopy(copyKey, text)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 active:bg-emerald-900"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy greeting"}
        </button>
        {canViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(person)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            View full profile <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}

function BirthdayRow({ person, style, copiedKey, onOpen, onCopy }) {
  const copyKey = `row:${person.id || person.name}:${style.key}`;
  const copied = copiedKey === copyKey;
  // Today's row already has the amber TODAY badge, so huwag nang ulitin sa date column.
  const countdown = person.in === 0 ? "" : countdownLabel(person.in);
  const isToday = person.in === 0;
  const subtitle = person.position || (person.source === "account" ? "Account" : "Member");

  return (
    <div className="group flex items-center gap-1 pr-2 transition-colors hover:bg-stone-50">
      <button
        type="button"
        onClick={() => onOpen(person)}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:bg-emerald-50"
      >
        <MemberAvatar member={person} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-stone-800">{person.name}</p>
            {isToday && (
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                Today
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-stone-400">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold text-stone-600">{format(person.next, "MMM d")}</p>
          {countdown && (
            <p
              className={`text-[10px] ${isToday ? "font-semibold text-amber-600" : "text-stone-400"}`}
            >
              {countdown}
            </p>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={() =>
          onCopy(
            copyKey,
            style.build(
              firstNameOf(person.name),
              person.name,
              isToday ? ageOn(person.b, person.next) : null,
            ),
          )
        }
        aria-label={`Copy greeting for ${person.name}`}
        title="Copy greeting"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
          copied
            ? "bg-emerald-600 text-white"
            : "text-stone-400 hover:bg-emerald-50 hover:text-emerald-700"
        }`}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

export function BirthdayGreetings({ members = [], accountBirthdays = [], onViewProfile }) {
  const [copiedKey, setCopiedKey] = useState("");
  const [styleKey, setStyleKey] = useState(readSavedStyle);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openMonths, setOpenMonths] = useState({});
  const [todayIndex, setTodayIndex] = useState(0);

  const todayScrollRef = useRef(null);
  const sheetCloseRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeStyle = CAPTIONS.find((c) => c.key === styleKey) || CAPTIONS[0];
  const query = search.trim().toLowerCase();

  // I-merge ang members + account birthdays (gaya ng Dashboard), dedupe by name.
  // Members muna; kapag walang birthday ang member record pero meron sa account
  // birthday, ang account entry ang panatilihin para hindi mawala ang celebration.
  const merged = [
    ...members.map((m) => ({ ...m, source: "member" })),
    ...accountBirthdays.map((a) => ({ ...a, source: "account" })),
  ];
  const byName = new Map();
  for (const person of merged) {
    const key = String(person.name || "")
      .trim()
      .toLowerCase();
    if (!key) continue;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, person);
      continue;
    }
    if (!parseBday(existing.birthday) && parseBday(person.birthday)) byName.set(key, person);
  }
  const all = [...byName.values()]
    .map((p) => ({ ...p, b: parseBday(p.birthday) }))
    .filter((p) => p.b)
    .map((p) => {
      const next = nextBirthdayDate(p.b.mo, p.b.d, today);
      return { ...p, next, in: differenceInCalendarDays(next, today) };
    })
    .sort((a, b) => a.in - b.in || String(a.name || "").localeCompare(String(b.name || "")));

  const featured = all.filter((p) => p.in === 0);
  const nextUp = all.find((p) => p.in > 0) || null;
  const nextUpCountdown =
    nextUp && countdownLabel(nextUp.in) ? ` (${countdownLabel(nextUp.in).toLowerCase()})` : "";

  const filtered = query
    ? all.filter((p) =>
        String(p.name || "")
          .toLowerCase()
          .includes(query),
      )
    : all;

  // Group by next occurrence month para tama ang order kahit December na at
  // ang susunod na birthday ay January of the following year.
  const groups = [];
  const groupByKey = new Map();
  for (const person of filtered) {
    const key = `${person.next.getFullYear()}-${person.next.getMonth()}`;
    if (!groupByKey.has(key)) {
      const group = {
        key,
        date: new Date(person.next.getFullYear(), person.next.getMonth(), 1),
        people: [],
      };
      groupByKey.set(key, group);
      groups.push(group);
    }
    groupByKey.get(key).people.push(person);
  }
  groups.sort((a, b) => a.date - b.date);
  for (const group of groups) {
    group.people.sort(
      (a, b) =>
        a.next.getDate() - b.next.getDate() ||
        String(a.name || "").localeCompare(String(b.name || "")),
    );
  }
  const firstGroupKey = groups[0]?.key;
  const showSearch = query.length > 0;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    sheetCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const todayIds = featured.map((p) => p.id || p.name).join("|");
  useEffect(() => {
    setTodayIndex(0);
    if (todayScrollRef.current) todayScrollRef.current.scrollLeft = 0;
  }, [todayIds]);

  function chooseStyle(key) {
    setStyleKey(key);
    writeSavedStyle(key);
  }

  async function copyCaption(key, text) {
    const ok = await writeToClipboard(text);
    if (!ok) {
      toast.error("Couldn't copy — please select the text manually.");
      return;
    }
    setCopiedKey(key);
    toast.success("Caption copied! Paste it in Messenger or FB.");
    window.setTimeout(() => setCopiedKey((current) => (current === key ? "" : current)), 2000);
  }

  function openSheet(person) {
    setCopiedKey("");
    setDetailsOpen(false);
    setSelected(person);
  }

  function scrollToToday(index) {
    const el = todayScrollRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(index, featured.length - 1));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  function handleTodayScroll(event) {
    const el = event.currentTarget;
    if (!el.clientWidth) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const next = Math.max(0, Math.min(index, featured.length - 1));
    if (next !== todayIndex) setTodayIndex(next);
  }

  function isGroupOpen(key) {
    if (showSearch) return true;
    return openMonths[key] !== undefined ? openMonths[key] : key === firstGroupKey;
  }

  function toggleMonth(key) {
    setOpenMonths((prev) => {
      const currentlyOpen = prev[key] !== undefined ? prev[key] : key === firstGroupKey;
      return { ...prev, [key]: !currentlyOpen };
    });
  }

  // ---------- Empty state ----------
  if (all.length === 0) {
    return (
      <div>
        <h1 className="mb-5 text-xl font-bold text-emerald-900">Birthday Greetings</h1>
        <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-10 text-center">
          <Cake size={32} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm font-semibold text-stone-700">No birthdays on record</p>
          <p className="mt-1.5 text-xs text-stone-500">
            Add a birthday to member profiles so they automatically show up here with ready-made
            greeting captions.
          </p>
        </div>
      </div>
    );
  }

  const safeTodayIndex = Math.min(todayIndex, Math.max(0, featured.length - 1));
  const selectedAge = selected && selected.in === 0 ? ageOn(selected.b, selected.next) : null;
  const selectedNextAge = selected ? ageOn(selected.b, selected.next) : null;
  const selectedText = selected
    ? activeStyle.build(
        firstNameOf(selected.name),
        selected.name,
        selected.in === 0 ? selectedAge : null,
      )
    : "";
  const selectedCopyKey = selected
    ? `sheet:${selected.id || selected.name}:${activeStyle.key}`
    : "";
  const selectedCopied = copiedKey === selectedCopyKey;
  const canViewSelectedProfile = !!selected && !!onViewProfile && selected.source === "member";
  const detailRows = selected
    ? [
        { icon: Phone, label: "Contact", value: selected.contact },
        { icon: Mail, label: "Email", value: selected.email },
        { icon: MapPin, label: "Address", value: selected.address },
      ].filter((row) => row.value)
    : [];
  const selectedSince = selected ? memberSinceLabel(selected.joined) : "";
  const selectedMeta = selected
    ? selected.in === 0
      ? `Birthday today${selectedAge ? ` · Turning ${selectedAge}` : ""} · ${birthdayLabel(selected.b)}`
      : `${birthdayLabel(selected.b)} · ${selected.in === 1 ? "Tomorrow" : `In ${selected.in} days`}${
          selectedNextAge ? ` · Turning ${selectedNextAge}` : ""
        }`
    : "";

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-emerald-900">Birthday Greetings</h1>
      <p className="mb-5 text-sm text-stone-500">
        Celebrate today and prepare greetings for every birthday. Tap a member to copy a caption.
      </p>

      {/* ---------- Today's celebrants (spotlight) ---------- */}
      {featured.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-emerald-900">
              <Cake size={15} className="text-amber-600" /> Today's Celebrants
            </h2>
            {featured.length > 1 && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => scrollToToday(safeTodayIndex - 1)}
                  disabled={safeTodayIndex === 0}
                  aria-label="Previous birthday celebrant"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-white hover:text-emerald-700 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="min-w-[42px] text-center text-[10px] font-semibold text-stone-400">
                  {safeTodayIndex + 1} of {featured.length}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToToday(safeTodayIndex + 1)}
                  disabled={safeTodayIndex === featured.length - 1}
                  aria-label="Next birthday celebrant"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-white hover:text-emerald-700 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          <div
            ref={todayScrollRef}
            onScroll={handleTodayScroll}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featured.map((person) => (
              <div key={person.id || person.name} className="w-full shrink-0 snap-center">
                <SpotlightCard
                  person={person}
                  style={activeStyle}
                  copiedKey={copiedKey}
                  onStyle={chooseStyle}
                  onCopy={copyCaption}
                  onViewProfile={onViewProfile}
                />
              </div>
            ))}
          </div>

          {featured.length > 1 && (
            <div className="mt-2 flex justify-center">
              {featured.map((person, index) => (
                <button
                  key={person.id || person.name}
                  type="button"
                  onClick={() => scrollToToday(index)}
                  aria-label={`Show ${person.name}`}
                  aria-current={index === safeTodayIndex ? "true" : undefined}
                  className="group flex h-6 w-6 items-center justify-center rounded-full"
                >
                  <span
                    className={`h-2 rounded-full transition-all ${
                      index === safeTodayIndex
                        ? "w-5 bg-emerald-700"
                        : "w-2 bg-stone-300 group-hover:bg-stone-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------- No birthday today: compact next-up shortcut ---------- */}
      {featured.length === 0 && nextUp && (
        <button
          type="button"
          onClick={() => openSheet(nextUp)}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left transition-colors hover:bg-stone-50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Cake size={20} className="text-amber-600" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-emerald-900">No birthday today</span>
            <span className="mt-0.5 block truncate text-xs text-stone-500">
              Next up: {nextUp.name} — {format(nextUp.next, "MMMM d")}
              {nextUpCountdown}
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-stone-400" />
        </button>
      )}

      {/* ---------- All birthdays ---------- */}
      <section>
        <div className="mb-3">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-emerald-900">
            <CalendarDays size={15} className="text-emerald-700" /> All Birthdays
          </h2>
          <p className="mt-0.5 text-[11px] text-stone-400">
            {showSearch
              ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${search.trim()}"`
              : `${all.length} on record · sorted by next birthday`}
          </p>
        </div>

        <div className="relative mb-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            aria-label="Search birthdays by name"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-9 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <Search size={28} className="mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No members found</p>
            <p className="mt-1 text-xs text-stone-500">Try a different name or clear the search.</p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {groups.map((group) => {
              const open = isGroupOpen(group.key);
              const month = format(group.date, "MMMM");
              const label =
                group.date.getFullYear() === today.getFullYear()
                  ? month
                  : `${month} ${group.date.getFullYear()}`;
              const GroupHeader = showSearch ? "div" : "button";

              return (
                <div
                  key={group.key}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                >
                  <GroupHeader
                    {...(!showSearch
                      ? {
                          type: "button",
                          onClick: () => toggleMonth(group.key),
                          "aria-expanded": open,
                        }
                      : {})}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${
                      showSearch ? "" : "transition-colors hover:bg-stone-50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-sm font-semibold text-stone-800">{label}</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                        {group.people.length}
                      </span>
                    </span>
                    {!showSearch && (
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    )}
                  </GroupHeader>
                  {open && (
                    <div className="divide-y divide-stone-100 border-t border-stone-100">
                      {group.people.map((person) => (
                        <BirthdayRow
                          key={person.id || person.name}
                          person={person}
                          style={activeStyle}
                          copiedKey={copiedKey}
                          onOpen={openSheet}
                          onCopy={copyCaption}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Bottom sheet (mobile) / right drawer (desktop) ---------- */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Birthday profile for ${selected.name}`}
        >
          <div
            className="absolute inset-0 animate-in touch-none bg-black/50 backdrop-blur-sm duration-200 fade-in"
            onClick={() => setSelected(null)}
          />

          <div className="relative flex max-h-[88dvh] w-full animate-in flex-col rounded-t-2xl bg-white shadow-2xl duration-300 slide-in-from-bottom-6 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:slide-in-from-right-6">
            <div className="flex shrink-0 items-start gap-3 border-b border-stone-100 px-5 py-4">
              <MemberAvatar member={selected} size={52} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-emerald-950">{selected.name}</h3>
                <p className="truncate text-xs text-stone-500">
                  {selected.position || (selected.source === "account" ? "Account" : "Member")}
                </p>
                <p className="mt-1 text-[11px] font-medium text-stone-500">{selectedMeta}</p>
                {selectedSince && (
                  <p className="mt-0.5 text-[10px] text-stone-400">{selectedSince}</p>
                )}
              </div>
              <button
                ref={sheetCloseRef}
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close birthday profile"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                  Greeting style
                </p>
              </div>
              <StyleChips activeKey={activeStyle.key} onSelect={chooseStyle} />

              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                {selectedText}
              </div>
              <p className="mt-2 text-[10px] text-stone-400">
                Copy, then paste in Messenger or Facebook.
              </p>

              {detailRows.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((value) => !value)}
                    aria-expanded={detailsOpen}
                    className="flex w-full items-center justify-between gap-2 bg-white px-4 py-3 text-left transition-colors hover:bg-stone-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <UserRound size={15} className="text-emerald-700" /> Details
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-stone-400 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {detailsOpen && (
                    <div className="divide-y divide-stone-100 border-t border-stone-100">
                      {detailRows.map((row) => {
                        const Icon = row.icon;
                        return (
                          <div key={row.label} className="flex items-start gap-3 px-4 py-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                              <Icon size={14} className="text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                                {row.label}
                              </p>
                              <p className="break-words text-sm text-stone-700">{row.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-stone-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
              <button
                type="button"
                onClick={() => copyCaption(selectedCopyKey, selectedText)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 active:bg-emerald-900"
              >
                {selectedCopied ? <Check size={16} /> : <Copy size={16} />}
                {selectedCopied ? "Copied!" : "Copy greeting"}
              </button>
              {canViewSelectedProfile && (
                <button
                  type="button"
                  onClick={() => {
                    const person = selected;
                    setSelected(null);
                    onViewProfile(person);
                  }}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  View full profile <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
