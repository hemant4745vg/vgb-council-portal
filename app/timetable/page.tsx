"use client";

import { useEffect, useMemo, useState } from "react";

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
type ViewMode = "today" | "week" | "routine" | "classes" | "teachers" | "special";
type Grade = "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII";
type Category = "Classes" | "Meals" | "Activities" | "Rest/Admin";

type Entry = {
  id: string;
  title: string;
  start: string;
  end?: string;
  category: Category;
  note?: string;
  grades?: Grade[];
  days?: DayKey[];
  badge?: string;
};

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const CATEGORY_META: Record<Category, { icon: string; className: string }> = {
  Classes: {
    icon: "▦",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  Meals: {
    icon: "◉",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Activities: {
    icon: "✦",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  "Rest/Admin": {
    icon: "○",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const WEEKDAY_BASE: Entry[] = [
  { id: "wake", title: "Wake Up Call", start: "05:00", category: "Rest/Admin", note: "Start of the daily routine." },
  { id: "freshen", title: "Freshen Up", start: "05:00", end: "05:30", category: "Rest/Admin", note: "30 minutes." },
  { id: "morning", title: "Morning Yoga & Exercise", start: "05:30", end: "06:15", category: "Activities" },
  { id: "breakfast", title: "Getting Ready for School & Breakfast", start: "06:15", end: "07:30", category: "Meals" },
  { id: "reporting", title: "Reporting Time", start: "07:35", category: "Classes", note: "Students & teachers report to school." },
  { id: "huddle", title: "Huddle Time", start: "07:35", end: "07:40", category: "Activities" },
  { id: "zero", title: "Class Teacher's Lesson / Zero Lesson", start: "07:40", end: "08:00", category: "Classes" },
  { id: "p1", title: "First Period", start: "08:00", end: "08:50", category: "Classes", badge: "P1" },
  { id: "p2", title: "Second Period", start: "08:50", end: "09:40", category: "Classes", badge: "P2" },
  { id: "p3", title: "Third Period", start: "09:40", end: "10:30", category: "Classes", badge: "P3" },
  { id: "snack1", title: "Break for Morning Snacks", start: "10:30", end: "10:45", category: "Meals" },
  { id: "p4", title: "Fourth Period", start: "10:45", end: "11:35", category: "Classes", badge: "P4" },
  { id: "p5", title: "Fifth Period", start: "11:35", end: "12:25", category: "Classes", badge: "P5" },
  { id: "p6", title: "Sixth Period", start: "12:25", end: "13:15", category: "Classes", badge: "P6" },
  { id: "p7", title: "Seventh Period", start: "13:15", end: "14:00", category: "Classes", badge: "P7" },
  { id: "lunch", title: "Lunch", start: "14:00", end: "14:45", category: "Meals", grades: ["VI", "VII", "VIII", "IX", "X", "XI", "XII"] },
  { id: "rest", title: "Rest Time", start: "14:45", end: "15:45", category: "Rest/Admin" },
  { id: "ncc", title: "NCC Classes & Parade", start: "15:10", end: "15:50", category: "Activities", note: "NCC students only.", days: ["thursday", "friday"] },
  { id: "evening", title: "Evening Activity / Clubs", start: "16:00", end: "17:15", category: "Activities", days: ["wednesday"] },
  { id: "snack2", title: "Evening Snacks", start: "17:15", end: "17:35", category: "Meals" },
  { id: "ready", title: "Getting Ready for Games / Art / Music / Dance", start: "17:35", end: "17:40", category: "Rest/Admin" },
  { id: "games", title: "Evening Games / Clubs", start: "17:40", end: "19:10", category: "Activities", days: ["wednesday"] },
  { id: "hostel", title: "Return to Hostels, Freshen Up, Dinner & Hostel Routine", start: "19:10", end: "20:10", category: "Meals" },
  { id: "prep", title: "Supervised Prep in the Academic Block", start: "20:15", end: "21:30", category: "Classes" },
  { id: "clean", title: "Clean Your Spaces & Organize for the Next Day", start: "21:35", end: "22:05", category: "Rest/Admin" },
  { id: "hostel-night", title: "Hostel Routine", start: "22:05", category: "Rest/Admin", note: "Continues overnight." },
];

const SATURDAY_BASE: Entry[] = [
  { id: "sat-morning", title: "Morning Routine at Hostel, Freshening Up & Breakfast", start: "05:30", end: "07:30", category: "Meals" },
  { id: "sat-report", title: "Reporting Time", start: "07:35", category: "Classes", note: "Students & teachers." },
  { id: "sat-huddle", title: "Huddle Time", start: "07:35", end: "07:40", category: "Activities" },
  { id: "sat-p1", title: "First Period", start: "07:40", end: "08:25", category: "Classes", grades: ["IX", "X", "XI", "XII"], badge: "P1" },
  { id: "sat-p1-jr", title: "Wellness & Meditation Session", start: "07:40", end: "08:25", category: "Activities", grades: ["VI", "VII", "VIII"] },
  { id: "sat-p2", title: "Second Period", start: "08:25", end: "09:10", category: "Classes", grades: ["IX", "X", "XI", "XII"], badge: "P2" },
  { id: "sat-p2-jr", title: "Converging Capacities / DTI / FinLit / Kaushal Bodh", start: "08:25", end: "09:10", category: "Classes", grades: ["VI", "VII", "VIII"] },
  { id: "sat-p3", title: "Third Period", start: "09:10", end: "09:55", category: "Classes", grades: ["IX", "X", "XI", "XII"], badge: "P3" },
  { id: "sat-p3-jr", title: "DTI / FinLit / Kaushal Bodh", start: "09:10", end: "09:55", category: "Classes", grades: ["VI", "VII", "VIII"] },
  { id: "sat-p4", title: "Fourth Period", start: "09:55", end: "10:40", category: "Classes", grades: ["IX", "X", "XI", "XII"], badge: "P4" },
  { id: "sat-p4-jr", title: "Soft Skill / DTI / FinLit / Kaushal Bodh", start: "09:55", end: "10:40", category: "Activities", grades: ["VI", "VII", "VIII"] },
  { id: "sat-snack", title: "Break for Morning Snacks", start: "10:40", end: "11:00", category: "Meals" },
  { id: "sat-p5", title: "Fifth Period", start: "11:00", end: "11:45", category: "Classes", grades: ["IX", "X", "XI", "XII"], badge: "P5" },
  { id: "sat-skills", title: "Essential Skills Session", start: "11:00", end: "11:45", category: "Activities", grades: ["VI", "VII", "VIII"] },
  { id: "sat-mentor", title: "House Meeting / Mentor–Mentee Meeting", start: "11:45", end: "12:30", category: "Activities", note: "Grades VI–XII." },
  { id: "sat-clubs", title: "Club Activities", start: "12:30", end: "13:30", category: "Activities", grades: ["VI", "VII", "VIII", "IX", "X"] },
  { id: "sat-emrc", title: "EMRC", start: "12:30", end: "13:30", category: "Classes", grades: ["XI", "XII"], note: "Non-Maths students of Grades XI–XII." },
  { id: "sat-teacher", title: "Self-time for Teachers", start: "13:30", end: "14:00", category: "Rest/Admin" },
  { id: "sat-lunch", title: "Lunch", start: "14:00", end: "15:00", category: "Meals", note: "Official schedule source lists Classes VI & XII; verify institutional wording before database publication." },
  { id: "sat-rest", title: "Rest Time", start: "15:00", end: "16:00", category: "Rest/Admin" },
  { id: "sat-study", title: "Freshen Up / Self-Study", start: "16:00", end: "17:30", category: "Rest/Admin" },
  { id: "sat-snack2", title: "Evening Snacks", start: "17:30", end: "18:00", category: "Meals" },
  { id: "sat-games", title: "Games / Me Time", start: "18:00", end: "19:30", category: "Activities" },
  { id: "sat-dinner", title: "Dinner", start: "19:30", end: "20:30", category: "Meals" },
  { id: "sat-hostel", title: "Hostel Routine", start: "20:30", category: "Rest/Admin", note: "Continues overnight." },
];

const SPECIAL_RULES: Record<DayKey, Partial<Record<string, string>>> = {
  monday: { morning: "Morning Yoga & Exercise", zero: "Morning Assembly" },
  tuesday: { morning: "Morning Yoga & Exercise", zero: "Class Teacher's Lesson / Zero Lesson" },
  wednesday: { morning: "March Past", zero: "Class Teacher's Lesson / Zero Lesson" },
  thursday: { morning: "Morning Yoga & Exercise", zero: "Morning Assembly" },
  friday: { morning: "Morning Yoga & Exercise", zero: "Class Teacher's Lesson / Zero Lesson" },
  saturday: {},
};

const DAY_TO_NUMBER: Record<DayKey, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDuration(start: string, end?: string) {
  if (!end) return "Open-ended";
  const minutes = parseMinutes(end) - parseMinutes(start);
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function getDayKey(date: Date): DayKey | null {
  const day = date.getDay();
  if (day === 0) return null;
  return DAY_ORDER[day - 1];
}

function getDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getMinutesNow() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const parts = formatter.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function getDateForDay(base: Date, day: DayKey) {
  const result = new Date(base);
  const current = result.getDay() === 0 ? 7 : result.getDay();
  const target = DAY_TO_NUMBER[day];
  result.setDate(result.getDate() + target - current);
  return result;
}

function getWeekdayEntries(day: DayKey) {
  const rule = SPECIAL_RULES[day];
  return WEEKDAY_BASE
    .filter((entry) => !entry.days || entry.days.includes(day))
    .map((entry) => {
      const title = rule[entry.id] ?? entry.title;
      return {
        ...entry,
        title,
        note:
          entry.id === "morning" && day === "wednesday"
            ? "Wednesday: March Past. NCC is also scheduled for Monday, Tuesday and Wednesday."
            : entry.note,
      };
    });
}

function getEntries(day: DayKey, grade: Grade) {
  if (day === "saturday") {
    return SATURDAY_BASE.filter(
      (entry) => !entry.grades || entry.grades.includes(grade)
    );
  }
  return getWeekdayEntries(day);
}

function getCurrentEntry(entries: Entry[], now: number) {
  return entries.find((entry) => {
    const start = parseMinutes(entry.start);
    if (!entry.end) return false;
    const end = parseMinutes(entry.end);
    return now >= start && now < end;
  });
}

function getNextEntry(entries: Entry[], now: number) {
  return entries
    .filter((entry) => parseMinutes(entry.start) > now)
    .sort((a, b) => parseMinutes(a.start) - parseMinutes(b.start))[0];
}

function TimeBadge({ time }: { time: string }) {
  return (
    <span className="whitespace-nowrap text-[11px] font-bold text-slate-500">
      {formatTime(time)}
    </span>
  );
}

function EntryCard({
  entry,
  now,
}: {
  entry: Entry;
  now?: number;
}) {
  const meta = CATEGORY_META[entry.category];
  const start = parseMinutes(entry.start);
  const end = entry.end ? parseMinutes(entry.end) : null;
  const active =
    now !== undefined &&
    now >= start &&
    (end === null ? true : now < end);

  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 shadow-sm transition ${
        active
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-slate-200/80"
      }`}
    >
      {active && (
        <span className="absolute -left-1.5 top-5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
      )}

      <div className="flex gap-4">
        <div className="w-[72px] shrink-0 pt-0.5">
          <TimeBadge time={entry.start} />
          {entry.end && (
            <div className="mt-1 text-[10px] font-medium text-slate-400">
              {formatTime(entry.end)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 border-l border-slate-200 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${meta.className}`}
            >
              <span>{meta.icon}</span>
              {entry.category}
            </span>
            {entry.badge && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                {entry.badge}
              </span>
            )}
            {active && (
              <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                NOW
              </span>
            )}
          </div>

          <h3 className="mt-2 text-sm font-bold tracking-tight text-slate-950">
            {entry.title}
          </h3>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {entry.end && <span>{formatDuration(entry.start, entry.end)}</span>}
            {entry.note && <span>{entry.note}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
        {title}
      </h2>
      {text && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{text}</p>}
    </div>
  );
}

function EmptyFeature({
  title,
  text,
  label,
}: {
  title: string;
  text: string;
  label: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{text}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        The timetable foundation is ready. Class, teacher, room and special-date
        records can be connected here without changing the timeline engine.
      </div>
    </section>
  );
}

export default function TimetablePage() {
  const [view, setView] = useState<ViewMode>("today");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [grade, setGrade] = useState<Grade>("XI");
  const [now, setNow] = useState(getMinutesNow());

  useEffect(() => {
    const id = window.setInterval(() => setNow(getMinutesNow()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const selectedDay = getDayKey(selectedDate);
  const entries = useMemo(
    () => (selectedDay ? getEntries(selectedDay, grade) : []),
    [selectedDay, grade]
  );

  const currentEntry = selectedDay ? getCurrentEntry(entries, now) : undefined;
  const nextEntry = selectedDay ? getNextEntry(entries, now) : undefined;

  const today = useMemo(() => new Date(), []);
  const todayKey = getDayKey(today);

  const todayEntries = todayKey ? getEntries(todayKey, grade) : [];

  const currentForToday =
    todayKey && today.toDateString() === selectedDate.toDateString()
      ? currentEntry
      : getCurrentEntry(todayEntries, now);

  const setToday = () => {
    setSelectedDate(new Date());
    setView("today");
  };

  const shiftDate = (days: number) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
    setView("today");
  };

  const selectedLabel = selectedDay
    ? DAY_LABELS[selectedDay]
    : "Sunday";

  const countdown = currentEntry?.end
    ? Math.max(0, parseMinutes(currentEntry.end) - now)
    : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                VGB Student Portal
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Timetable
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                The complete school-day routine, period structure, weekend schedule
                and, eventually, your class and teacher timetable in one timeline.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Campus time
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {new Date().toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Grade
                </p>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="mt-1 w-full bg-transparent text-sm font-black text-slate-900 outline-none"
                  aria-label="Select grade"
                >
                  {(["VI", "VII", "VIII", "IX", "X", "XI", "XII"] as Grade[]).map(
                    (item) => (
                      <option key={item} value={item}>
                        Class {item}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="col-span-2 rounded-2xl bg-blue-50 px-4 py-3 sm:col-span-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
                  Today
                </p>
                <p className="mt-1 text-sm font-black text-blue-900">
                  {todayKey ? DAY_LABELS[todayKey] : "Sunday"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Timetable views">
          {[
            ["today", "My Day"],
            ["week", "Week"],
            ["routine", "School Routine"],
            ["classes", "My Classes"],
            ["teachers", "Teachers"],
            ["special", "Special"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key as ViewMode)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                view === key
                  ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {view === "today" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section>
              <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    Selected day
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {getDateLabel(selectedDate)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Class {grade} · {selectedLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftDate(-1)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    aria-label="Previous day"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={setToday}
                    className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftDate(1)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    aria-label="Next day"
                  >
                    →
                  </button>
                </div>
              </div>

              {!selectedDay ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Sunday
                  </span>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    No Sunday routine has been published yet.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    The supplied institutional schedule currently defines Monday–Friday
                    and Saturday. Sunday can be added later as its own schedule rather
                    than being incorrectly inferred.
                  </p>
                </section>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <EntryCard
                      key={`${entry.id}-${entry.start}`}
                      entry={entry}
                      now={
                        selectedDate.toDateString() === today.toDateString()
                          ? now
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <section className="rounded-3xl border border-blue-100 bg-blue-700 p-5 text-white shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                  Now
                </p>

                {selectedDay && selectedDate.toDateString() === today.toDateString() ? (
                  <>
                    <h2 className="mt-2 text-xl font-black">
                      {currentEntry?.title ?? "Between scheduled activities"}
                    </h2>
                    {currentEntry?.end && (
                      <p className="mt-2 text-sm text-blue-100">
                        Ends at {formatTime(currentEntry.end)}
                        {countdown !== null && ` · ${countdown} min remaining`}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-xl font-black">
                      {currentForToday?.title ?? "No current activity"}
                    </h2>
                    <p className="mt-2 text-sm text-blue-100">
                      Based on the current campus time and the published routine.
                    </p>
                  </>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Up next
                </p>
                <h2 className="mt-2 text-lg font-black text-slate-950">
                  {nextEntry?.title ?? "No later activity"}
                </h2>
                {nextEntry && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatTime(nextEntry.start)}
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionLabel
                  eyebrow="Legend"
                  title="Schedule types"
                />
                <div className="mt-4 space-y-2">
                  {(Object.keys(CATEGORY_META) as Category[]).map((category) => {
                    const meta = CATEGORY_META[category];
                    return (
                      <div
                        key={category}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${meta.className}`}
                      >
                        <span>{meta.icon}</span>
                        {category}
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        )}

        {view === "week" && (
          <section className="mt-6">
            <SectionLabel
              eyebrow="Weekly overview"
              title="The school week"
              text={`Routine structure for Class ${grade}. Select a day to open its full timeline.`}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DAY_ORDER.map((day) => {
                const date = getDateForDay(selectedDate, day);
                const dayEntries = getEntries(day, grade);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setView("today");
                    }}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">
                          {DAY_LABELS[day]}
                        </h3>
                      </div>
                      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">
                        →
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {dayEntries.slice(0, 5).map((entry) => (
                        <div key={`${day}-${entry.id}`} className="flex items-center gap-3 text-xs">
                          <span className="w-12 shrink-0 font-bold text-slate-400">
                            {formatTime(entry.start).replace(":00", "")}
                          </span>
                          <span className="truncate font-semibold text-slate-700">
                            {entry.title}
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 text-[10px] font-bold text-blue-700">
                        {dayEntries.length} scheduled entries · Open timeline
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {view === "routine" && (
          <section className="mt-6 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionLabel
                eyebrow="Institutional routine"
                title="Standard school schedule"
                text="This view uses the official routine structure supplied for Classes VI–XII. Day-specific rules are applied without duplicating the entire timetable."
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {DAY_ORDER.map((day) => (
                <section
                  key={day}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                        Standard schedule
                      </p>
                      <h2 className="mt-1 text-xl font-black text-slate-950">
                        {DAY_LABELS[day]}
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                      {day === "saturday" ? "Saturday Routine" : "Weekday Routine"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {getEntries(day, grade).map((entry) => (
                      <div
                        key={`${day}-${entry.id}`}
                        className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <span className="w-20 shrink-0 text-[10px] font-bold text-slate-400">
                          {formatTime(entry.start)}
                          {entry.end && `–${formatTime(entry.end)}`}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800">
                            {entry.title}
                          </p>
                          {entry.note && (
                            <p className="mt-0.5 text-[10px] text-slate-500">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}

        {view === "classes" && (
          <div className="mt-6">
            <EmptyFeature
              label="Phase 2"
              title={`Class ${grade} timetable`}
              text="The routine engine now defines when each period exists. The next data layer will map those period slots to subjects, teachers and rooms for each class."
            />
          </div>
        )}

        {view === "teachers" && (
          <div className="mt-6">
            <EmptyFeature
              label="Phase 2"
              title="Teacher timetables"
              text="Teacher schedules should be generated from the same period data, with permissions controlling which staff information is visible."
            />
          </div>
        )}

        {view === "special" && (
          <section className="mt-6 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionLabel
                eyebrow="Date-specific schedules"
                title="Special schedules"
                text="Events such as Cultural Week, examinations, Carnival and other institutional changes should override the normal routine for a specific date."
              />
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">
                Override engine ready for the next data layer
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                The page deliberately does not invent special schedules. Once
                date-specific records are stored, they can replace or augment the
                normal timeline automatically.
              </p>
            </div>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-[10px] text-slate-400">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>VidyaGyan Leadership Academy · Student Portal · 2026–27</span>
            <span>Campus time · Asia/Kolkata</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
