import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

// Kulay ng event pills — deterministic per event para hindi nagbabago-bago.
const PILL_COLORS = [
  "bg-emerald-100 text-emerald-900 border-emerald-200",
  "bg-sky-100 text-sky-900 border-sky-200",
  "bg-amber-100 text-amber-900 border-amber-200",
  "bg-rose-100 text-rose-900 border-rose-200",
  "bg-violet-100 text-violet-900 border-violet-200",
];

const DOT_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];

function colorIndex(event) {
  const s = String(event?.id ?? event?.title ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return h % PILL_COLORS.length;
}

function pillColor(event) {
  return PILL_COLORS[colorIndex(event)];
}

function dotColor(event) {
  return DOT_COLORS[colorIndex(event)];
}

// Safe parse — baka may event na walang o invalid ang petsa.
function safeParse(value) {
  try {
    const d = parseISO(String(value ?? ""));
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function EventRow({ event }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50/70 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-stone-800 break-words">{event.title}</p>
        <span className="text-[10px] text-stone-400 shrink-0 pt-0.5">{event._d ? format(event._d, "MMM d") : ""}</span>
      </div>
      {event.location && (
        <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
          <MapPin size={11} className="shrink-0" /> {event.location}
        </p>
      )}
    </div>
  );
}

export function EventCalendar({ events = [] }) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);

  // I-parse at i-sort ang events na may valid na petsa.
  const dated = useMemo(
    () =>
      [...events]
        .map((e) => ({ ...e, _d: safeParse(e.date) }))
        .filter((e) => e._d)
        .sort((a, b) => a._d - b._d),
    [events]
  );

  const monthEvents = useMemo(() => dated.filter((e) => isSameMonth(e._d, viewMonth)), [dated, viewMonth]);

  // Buong grid ng buwan (kasama ang leading/trailing days ng katabing buwan).
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    const end = endOfWeek(endOfMonth(viewMonth));
    const rows = [];
    let day = start;
    while (day <= end) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        row.push(day);
        day = addDays(day, 1);
      }
      rows.push(row);
    }
    return rows;
  }, [viewMonth]);

  const eventsOn = (day) => dated.filter((e) => isSameDay(e._d, day));
  const selectedEvents = selectedDay ? eventsOn(selectedDay) : [];

  const selectDay = (day) => {
    setSelectedDay(day);
    if (!isSameMonth(day, viewMonth)) setViewMonth(startOfMonth(day)); // leading/trailing day → lipat buwan
  };

  const goPrev = () => {
    setViewMonth((m) => subMonths(m, 1));
    setSelectedDay(null);
  };
  const goNext = () => {
    setViewMonth((m) => addMonths(m, 1));
    setSelectedDay(null);
  };
  const goToday = () => {
    const now = new Date();
    setViewMonth(startOfMonth(now));
    setSelectedDay(now);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-5">Event Calendar</h1>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Calendar */}
        <div>
          {/* Month navigation */}
          <div className="bg-emerald-900 text-white rounded-t-xl px-3 py-2.5 flex items-center justify-between">
            <button onClick={goPrev} aria-label="Previous month" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-sm">{format(viewMonth, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <button onClick={goToday} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                Today
              </button>
              <button onClick={goNext} aria-label="Next month" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-b-xl border border-t-0 border-stone-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-emerald-50 text-emerald-900">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1.5 sm:py-2 text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="grid grid-cols-7 gap-px bg-stone-100">
              {weeks.flat().map((day) => {
                const inMonth = isSameMonth(day, viewMonth);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const dayEvents = eventsOn(day);
                return (
                  <button
                    key={format(day, "yyyy-MM-dd")}
                    onClick={() => selectDay(day)}
                    aria-pressed={!!isSelected}
                    aria-label={`${format(day, "MMMM d, yyyy")}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}` : ""}`}
                    className={`min-h-[52px] sm:min-h-[64px] xl:min-h-[88px] bg-white p-1 sm:p-1.5 text-left flex flex-col gap-0.5 sm:gap-1 transition-colors hover:bg-stone-50 ${isSelected ? "ring-2 ring-inset ring-emerald-500" : ""}`}
                  >
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[11px] sm:text-xs font-semibold ${
                        isToday(day) ? "bg-emerald-600 text-white" : inMonth ? "text-stone-700" : "text-stone-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Desktop: full event pills. Mobile/tablet: compact dots. */}
                    <div className={`hidden xl:block space-y-1 ${inMonth ? "" : "opacity-50"}`}>
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={`truncate rounded border px-1.5 py-0.5 text-[10px] font-medium ${pillColor(e)}`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="pl-1 text-[10px] font-semibold text-stone-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                    <div className={`flex xl:hidden flex-wrap gap-0.5 pt-0.5 ${inMonth ? "" : "opacity-40"}`}>
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${dotColor(e)}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="xl:hidden mt-2 text-[11px] text-stone-400">Dots mark event days. Tap a day to see the details below.</p>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-1.5">
              <CalendarDays size={14} />
              {selectedDay ? format(selectedDay, "EEEE, MMM d") : "Selected Day"}
            </h3>
            {!selectedDay && <p className="text-xs text-stone-500">Pumili ng araw sa kalendaryo para makita ang mga event nito.</p>}
            {selectedDay && selectedEvents.length === 0 && <p className="text-xs text-stone-500">Walang event sa araw na ito.</p>}
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-bold text-emerald-900 mb-3">
              Events this month <span className="text-stone-400 font-semibold">({monthEvents.length})</span>
            </h3>
            {monthEvents.length === 0 && <p className="text-xs text-stone-500">Walang event sa {format(viewMonth, "MMMM yyyy")}.</p>}
            <div className="space-y-2">
              {monthEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
